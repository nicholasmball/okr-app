'use server';

import { createClient } from '@/lib/supabase/server';
import type { KRStatus } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getCheckIns(keyResultId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('check_ins')
    .select('*, author:profiles!check_ins_author_id_fkey(id, full_name, avatar_url)')
    .eq('key_result_id', keyResultId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createCheckIn({
  keyResultId,
  authorId,
  value,
  status,
  comment,
}: {
  keyResultId: string;
  authorId: string;
  value: number;
  status: KRStatus;
  comment?: string;
}) {
  const supabase = await createClient();

  // Create the check-in
  const { data: checkIn, error: checkInError } = await supabase
    .from('check_ins')
    .insert({
      key_result_id: keyResultId,
      author_id: authorId,
      value,
      status,
      comment: comment ?? null,
    })
    .select()
    .single();

  if (checkInError) throw new Error(checkInError.message);

  // Update the KR's current value, status, and score
  const { data: kr } = await supabase
    .from('key_results')
    .select('target_value, objective_id')
    .eq('id', keyResultId)
    .single();

  if (kr) {
    const score = Number(kr.target_value) > 0 ? Math.min(value / Number(kr.target_value), 1) : 0;
    const roundedScore = Math.round(score * 100) / 100;

    await supabase
      .from('key_results')
      .update({
        current_value: value,
        status,
        score: roundedScore,
      })
      .eq('id', keyResultId);

    // Recalculate parent objective score
    await recalculateObjectiveScore(kr.objective_id);
  }

  revalidatePath('/');
  return checkIn;
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
