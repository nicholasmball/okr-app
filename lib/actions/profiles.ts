'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/types/database';

export async function updateProfile({
  id,
  fullName,
}: {
  id: string;
  fullName: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function updateUserRole({
  userId,
  role,
}: {
  userId: string;
  role: UserRole;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function getOrgProfiles(organisationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, role')
    .eq('organisation_id', organisationId)
    .order('full_name');

  if (error) throw new Error(error.message);
  return data;
}
