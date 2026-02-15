'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getOrganisation() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('organisations').select('*').single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createOrganisation(name: string) {
  const supabase = await createClient();

  const { data: org, error: orgError } = await supabase
    .from('organisations')
    .insert({ name })
    .select()
    .single();

  if (orgError) throw new Error(orgError.message);

  // Update the current user's profile to link them to this org as admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ organisation_id: org.id, role: 'admin' })
      .eq('id', user.id);

    if (profileError) throw new Error(profileError.message);
  }

  revalidatePath('/');
  return org;
}

export async function updateOrganisation(id: string, name: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organisations')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}
