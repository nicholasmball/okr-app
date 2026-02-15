'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getTeams() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('teams')
    .select('*, team_lead:profiles!teams_team_lead_id_fkey(id, full_name, email, avatar_url)')
    .order('name');

  if (error) throw new Error(error.message);
  return data;
}

export async function getTeam(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('teams')
    .select(
      '*, team_lead:profiles!teams_team_lead_id_fkey(id, full_name, email, avatar_url), team_memberships(id, user_id, joined_at, profile:profiles(id, full_name, email, avatar_url, role))'
    )
    .eq('id', teamId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createTeam({
  name,
  description,
  organisationId,
}: {
  name: string;
  description?: string;
  organisationId: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('teams')
    .insert({
      name,
      description: description ?? null,
      organisation_id: organisationId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function updateTeam({
  id,
  name,
  description,
}: {
  id: string;
  name?: string;
  description?: string;
}) {
  const supabase = await createClient();

  const updates: Record<string, string | null> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;

  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function deleteTeam(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('teams').delete().eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}

export async function assignTeamLead(teamId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('teams')
    .update({ team_lead_id: userId })
    .eq('id', teamId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function addTeamMember(teamId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('team_memberships')
    .insert({ team_id: teamId, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function removeTeamMember(teamId: string, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('team_memberships')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  revalidatePath('/');
}

export async function getTeamMembers(teamId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('team_memberships')
    .select('id, joined_at, profile:profiles(id, full_name, email, avatar_url, role)')
    .eq('team_id', teamId)
    .order('joined_at');

  if (error) throw new Error(error.message);
  return data;
}
