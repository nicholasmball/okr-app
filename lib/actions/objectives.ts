'use server';

import { createClient } from '@/lib/supabase/server';
import type { ObjectiveStatus, ObjectiveType } from '@/types/database';
import { revalidatePath } from 'next/cache';

export interface ObjectiveFilters {
  cycleId?: string;
  type?: ObjectiveType;
  teamId?: string;
  ownerId?: string;
  status?: ObjectiveStatus;
}

export async function getObjectives(organisationId: string, filters?: ObjectiveFilters) {
  const supabase = await createClient();

  let query = supabase
    .from('objectives')
    .select('*, key_results(id, title, score, status, current_value, target_value, unit)')
    .eq('organisation_id', organisationId);

  if (filters?.cycleId) query = query.eq('cycle_id', filters.cycleId);
  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.teamId) query = query.eq('team_id', filters.teamId);
  if (filters?.ownerId) query = query.eq('owner_id', filters.ownerId);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getObjective(objectiveId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('objectives')
    .select(
      '*, key_results(*, assignee:profiles!key_results_assignee_id_fkey(id, full_name, email, avatar_url), check_ins(id, value, status, comment, created_at, author:profiles!check_ins_author_id_fkey(id, full_name)))'
    )
    .eq('id', objectiveId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getObjectivesForUser(userId: string, cycleId: string) {
  const supabase = await createClient();

  // Get team objectives where user is a team member
  const { data: memberships } = await supabase
    .from('team_memberships')
    .select('team_id')
    .eq('user_id', userId);

  const teamIds = memberships?.map((m) => m.team_id) ?? [];

  let query = supabase
    .from('objectives')
    .select('*, key_results(id, title, score, status, current_value, target_value, unit, assignee_id)')
    .eq('cycle_id', cycleId);

  if (teamIds.length > 0) {
    // Team objectives for user's teams OR cross-cutting/individual assigned to user
    query = query.or(
      `team_id.in.(${teamIds.join(',')}),owner_id.eq.${userId},key_results.assignee_id.eq.${userId}`
    );
  } else {
    // No teams — just individual objectives and cross-cutting assigned to them
    query = query.or(`owner_id.eq.${userId}`);
  }

  const { data, error } = await query.order('type').order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createObjective({
  organisationId,
  cycleId,
  type,
  title,
  description,
  teamId,
  ownerId,
}: {
  organisationId: string;
  cycleId: string;
  type: ObjectiveType;
  title: string;
  description?: string;
  teamId?: string;
  ownerId?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('objectives')
    .insert({
      organisation_id: organisationId,
      cycle_id: cycleId,
      type,
      title,
      description: description ?? null,
      team_id: teamId ?? null,
      owner_id: ownerId ?? null,
      status: 'draft',
      score: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function updateObjective({
  id,
  title,
  description,
  status,
  score,
}: {
  id: string;
  title?: string;
  description?: string;
  status?: ObjectiveStatus;
  score?: number;
}) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (score !== undefined) updates.score = score;

  const { data, error } = await supabase
    .from('objectives')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function deleteObjective(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('objectives').delete().eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}
