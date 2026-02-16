import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { PersonHeader } from '@/components/people/person-header';
import { PersonObjectives } from '@/components/people/person-objectives';
import { EmptyState } from '@/components/okr/empty-state';
import { Target } from 'lucide-react';
import type { AssignmentType, KRStatus, ObjectiveType } from '@/types/database';

interface KRAssigneeJoin {
  user_id: string;
}

interface KeyResult {
  id: string;
  title: string;
  score: number;
  status: KRStatus;
  current_value: number;
  target_value: number;
  unit: string;
  assignee_id: string | null;
  assignment_type?: AssignmentType;
  key_result_assignees?: KRAssigneeJoin[];
}

interface Objective {
  id: string;
  title: string;
  type: ObjectiveType;
  score: number;
  status: string;
  owner_id: string | null;
  key_results: KeyResult[];
}

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();

  return { title: profile?.full_name ?? 'Person' };
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch the person's profile
  const { data: person, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, role, organisation_id')
    .eq('id', userId)
    .single();

  if (error || !person) notFound();

  // Fetch their team memberships
  const { data: memberships } = await supabase
    .from('team_memberships')
    .select('team:teams(id, name)')
    .eq('user_id', userId);

  const teamNames = (memberships ?? [])
    .map((m: { team: { id: string; name: string } | { id: string; name: string }[] | null }) => {
      const t = m.team;
      if (!t) return null;
      if (Array.isArray(t)) return t[0]?.name ?? null;
      return t.name;
    })
    .filter(Boolean) as string[];

  // Get active cycle
  const { data: cycle } = await supabase
    .from('okr_cycles')
    .select('*')
    .eq('organisation_id', person.organisation_id ?? '')
    .eq('is_active', true)
    .single();

  // Fetch people for assignee picker
  const { data: allPeople } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('organisation_id', person.organisation_id ?? '')
    .order('full_name');

  // Fetch objectives where this person has assigned KRs or owns individual objectives
  let objectives: Objective[] = [];
  if (cycle) {
    // Get all objectives in this cycle for the org
    const { data: allCycleObjectives } = await supabase
      .from('objectives')
      .select(
        '*, key_results(id, title, description, score, status, current_value, target_value, unit, assignee_id, assignment_type, key_result_assignees(user_id))'
      )
      .eq('cycle_id', cycle.id)
      .eq('organisation_id', person.organisation_id ?? '');

    // Keep objectives where the person owns it OR has an assigned KR (via junction or legacy)
    objectives = ((allCycleObjectives ?? []) as Objective[]).filter(
      (obj) =>
        obj.owner_id === userId ||
        obj.key_results.some(
          (kr) =>
            kr.key_result_assignees?.some((a) => a.user_id === userId) ||
            kr.assignee_id === userId
        )
    );
  }

  // Calculate overall score from this person's KRs (active objectives only)
  const activeObjectives = objectives.filter((obj) => obj.status === 'active');
  const personKRs = activeObjectives.flatMap((obj) =>
    obj.key_results.filter(
      (kr) =>
        kr.key_result_assignees?.some((a) => a.user_id === userId) ||
        kr.assignee_id === userId ||
        obj.type === 'individual'
    )
  );
  const avgScore =
    personKRs.length > 0
      ? personKRs.reduce((sum, kr) => sum + kr.score, 0) / personKRs.length
      : 0;

  return (
    <>
      <AppHeader title={person.full_name} />
      <div className="flex-1 space-y-6 p-6">
        <PersonHeader
          fullName={person.full_name}
          email={person.email}
          avatarUrl={person.avatar_url}
          role={person.role}
          teamNames={teamNames}
          score={avgScore}
          krCount={personKRs.length}
        />

        {!cycle ? (
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="No active cycle"
            description="There's no active OKR cycle to display objectives for."
          />
        ) : objectives.length === 0 ? (
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="No objectives"
            description={`${person.full_name} has no objectives or assigned KRs in this cycle.`}
          />
        ) : (
          <PersonObjectives objectives={objectives} personId={userId} people={allPeople ?? []} />
        )}
      </div>
    </>
  );
}
