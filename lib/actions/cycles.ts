'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCycles(organisationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('okr_cycles')
    .select('*')
    .eq('organisation_id', organisationId)
    .order('start_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveCycle(organisationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('okr_cycles')
    .select('*')
    .eq('organisation_id', organisationId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}

export async function getCycle(cycleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('okr_cycles')
    .select('*')
    .eq('id', cycleId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createCycle({
  organisationId,
  name,
  startDate,
  endDate,
}: {
  organisationId: string;
  name: string;
  startDate: string;
  endDate: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('okr_cycles')
    .insert({
      organisation_id: organisationId,
      name,
      start_date: startDate,
      end_date: endDate,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function updateCycle({
  id,
  name,
  startDate,
  endDate,
}: {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = await createClient();

  const updates: Record<string, string> = {};
  if (name !== undefined) updates.name = name;
  if (startDate !== undefined) updates.start_date = startDate;
  if (endDate !== undefined) updates.end_date = endDate;

  const { data, error } = await supabase
    .from('okr_cycles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function setActiveCycle(organisationId: string, cycleId: string) {
  const supabase = await createClient();

  // Deactivate any currently active cycle
  const { error: deactivateError } = await supabase
    .from('okr_cycles')
    .update({ is_active: false })
    .eq('organisation_id', organisationId)
    .eq('is_active', true);

  if (deactivateError) throw new Error(deactivateError.message);

  // Activate the target cycle
  const { data, error } = await supabase
    .from('okr_cycles')
    .update({ is_active: true })
    .eq('id', cycleId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function closeCycle(cycleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('okr_cycles')
    .update({ is_active: false })
    .eq('id', cycleId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/');
  return data;
}

export async function carryForwardObjectives(fromCycleId: string, toCycleId: string) {
  const supabase = await createClient();

  // Get incomplete objectives from the source cycle
  const { data: objectives, error: fetchError } = await supabase
    .from('objectives')
    .select('*, key_results(*)')
    .eq('cycle_id', fromCycleId)
    .in('status', ['draft', 'active']);

  if (fetchError) throw new Error(fetchError.message);
  if (!objectives || objectives.length === 0) return [];

  const carried = [];

  for (const obj of objectives) {
    // Create new objective in the target cycle
    const { data: newObj, error: objError } = await supabase
      .from('objectives')
      .insert({
        organisation_id: obj.organisation_id,
        cycle_id: toCycleId,
        team_id: obj.team_id,
        owner_id: obj.owner_id,
        type: obj.type,
        title: obj.title,
        description: obj.description,
        status: 'draft',
        score: 0,
      })
      .select()
      .single();

    if (objError) throw new Error(objError.message);

    // Carry forward key results (reset progress)
    if (obj.key_results && obj.key_results.length > 0) {
      const krInserts = obj.key_results.map(
        (kr: { title: string; description: string | null; target_value: number; unit: string; assignee_id: string | null }) => ({
          objective_id: newObj.id,
          assignee_id: kr.assignee_id,
          title: kr.title,
          description: kr.description,
          target_value: kr.target_value,
          current_value: 0,
          unit: kr.unit,
          score: 0,
          status: 'on_track' as const,
        })
      );

      const { error: krError } = await supabase.from('key_results').insert(krInserts);
      if (krError) throw new Error(krError.message);
    }

    carried.push(newObj);
  }

  revalidatePath('/');
  return carried;
}
