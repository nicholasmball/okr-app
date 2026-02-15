'use server';

import { createClient } from '@/lib/supabase/server';
import type { KRStatus } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getKeyResults(objectiveId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('key_results')
    .select(
      '*, assignee:profiles!key_results_assignee_id_fkey(id, full_name, email, avatar_url)'
    )
    .eq('objective_id', objectiveId)
    .order('created_at');

  if (error) throw new Error(error.message);
  return data;
}

export async function getKeyResult(krId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('key_results')
    .select(
      '*, assignee:profiles!key_results_assignee_id_fkey(id, full_name, email, avatar_url), check_ins(*, author:profiles!check_ins_author_id_fkey(id, full_name))'
    )
    .eq('id', krId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createKeyResult({
  objectiveId,
  title,
  description,
  targetValue,
  unit,
  assigneeId,
}: {
  objectiveId: string;
  title: string;
  description?: string;
  targetValue?: number;
  unit?: string;
  assigneeId?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('key_results')
    .insert({
      objective_id: objectiveId,
      title,
      description: description ?? null,
      target_value: targetValue ?? 100,
      current_value: 0,
      unit: unit ?? '%',
      assignee_id: assigneeId ?? null,
      score: 0,
      status: 'on_track' as KRStatus,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function updateKeyResult({
  id,
  title,
  description,
  targetValue,
  unit,
  currentValue,
  status,
}: {
  id: string;
  title?: string;
  description?: string;
  targetValue?: number;
  unit?: string;
  currentValue?: number;
  status?: KRStatus;
}) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (targetValue !== undefined) updates.target_value = targetValue;
  if (unit !== undefined) updates.unit = unit;
  if (currentValue !== undefined) updates.current_value = currentValue;
  if (status !== undefined) updates.status = status;

  // Recalculate score if current or target value changed
  if (currentValue !== undefined || targetValue !== undefined) {
    // Need to fetch current values to calculate
    const { data: current } = await supabase
      .from('key_results')
      .select('current_value, target_value')
      .eq('id', id)
      .single();

    if (current) {
      const cv = currentValue ?? current.current_value;
      const tv = targetValue ?? current.target_value;
      updates.score = tv > 0 ? Math.min(Number(cv) / Number(tv), 1) : 0;
    }
  }

  const { data, error } = await supabase
    .from('key_results')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Recalculate parent objective score
  if (data) {
    await recalculateObjectiveScore(data.objective_id);
  }

  revalidatePath('/');
  return data;
}

export async function assignKeyResult(krId: string, userId: string | null) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('key_results')
    .update({ assignee_id: userId })
    .eq('id', krId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function deleteKeyResult(id: string) {
  const supabase = await createClient();

  // Get objective_id before deleting so we can recalculate
  const { data: kr } = await supabase
    .from('key_results')
    .select('objective_id')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('key_results').delete().eq('id', id);

  if (error) throw new Error(error.message);

  if (kr) {
    await recalculateObjectiveScore(kr.objective_id);
  }

  revalidatePath('/');
}

async function recalculateObjectiveScore(objectiveId: string) {
  const supabase = await createClient();

  const { data: krs } = await supabase
    .from('key_results')
    .select('score')
    .eq('objective_id', objectiveId);

  if (!krs || krs.length === 0) {
    await supabase.from('objectives').update({ score: 0 }).eq('id', objectiveId);
    return;
  }

  const avgScore = krs.reduce((sum, kr) => sum + Number(kr.score), 0) / krs.length;
  const rounded = Math.round(avgScore * 100) / 100;

  await supabase.from('objectives').update({ score: rounded }).eq('id', objectiveId);
}
