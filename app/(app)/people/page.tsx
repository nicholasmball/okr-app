import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { EmptyState } from '@/components/okr/empty-state';
import { PersonCard } from '@/components/people/person-card';
import { PeopleFilter } from '@/components/people/people-filter';
import { Users } from 'lucide-react';

export const metadata = { title: 'People' };

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; team?: string; view?: string }>;
}) {
  const { q, team, view } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organisation_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organisation_id) {
    return (
      <>
        <AppHeader title="People" />
        <div className="flex-1 p-6">
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No organisation yet"
            description="Join an organisation to see people."
          />
        </div>
      </>
    );
  }

  // Fetch all teams for filter
  const { data: allTeams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('organisation_id', profile.organisation_id)
    .order('name');

  // Fetch all people in the org with their team memberships
  const { data: people } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, avatar_url, role, manager_id, team_memberships(team_id, team:teams(id, name))'
    )
    .eq('organisation_id', profile.organisation_id)
    .order('full_name');

  // Get active cycle for scoring
  const { data: cycle } = await supabase
    .from('okr_cycles')
    .select('id')
    .eq('organisation_id', profile.organisation_id)
    .eq('is_active', true)
    .single();

  // Fetch all KRs with assignees for scoring (if active cycle)
  // Use junction table for multi-assignee support + fall back to legacy assignee_id
  const krsByAssignee: Record<string, { score: number }[]> = {};
  if (cycle) {
    const { data: allKRs } = await supabase
      .from('key_results')
      .select('assignee_id, score, assignment_type, key_result_assignees(user_id), objective:objectives!inner(cycle_id, status)')
      .eq('objective.cycle_id', cycle.id)
      .eq('objective.status', 'active');

    if (allKRs) {
      for (const kr of allKRs) {
        const junctionAssignees = (kr.key_result_assignees as { user_id: string }[]) ?? [];
        if (junctionAssignees.length > 0) {
          // Use junction table entries
          for (const a of junctionAssignees) {
            if (!krsByAssignee[a.user_id]) krsByAssignee[a.user_id] = [];
            krsByAssignee[a.user_id].push({ score: kr.score });
          }
        } else if (kr.assignee_id) {
          // Fall back to legacy assignee_id
          if (!krsByAssignee[kr.assignee_id]) krsByAssignee[kr.assignee_id] = [];
          krsByAssignee[kr.assignee_id].push({ score: kr.score });
        }
      }
    }
  }

  let filtered = people ?? [];

  // Check if current user has any direct reports
  const hasReports = filtered.some((p) => p.manager_id === user.id);

  // Filter by view (My Reports)
  if (view === 'reports') {
    filtered = filtered.filter((p) => p.manager_id === user.id);
  }

  // Filter by team
  if (team) {
    filtered = filtered.filter((person) =>
      (person.team_memberships as { team_id: string }[])?.some(
        (m) => m.team_id === team
      )
    );
  }

  // Filter by search query
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (person) =>
        person.full_name.toLowerCase().includes(lower) ||
        person.email.toLowerCase().includes(lower)
    );
  }

  return (
    <>
      <AppHeader title="People" />
      <div className="flex-1 space-y-4 p-6">
        <Suspense>
          <PeopleFilter teams={allTeams ?? []} hasReports={hasReports} />
        </Suspense>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No people found"
            description={
              q || team
                ? 'Try adjusting your search or filter.'
                : 'People will appear here once they join your organisation.'
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((person) => {
              const memberships = person.team_memberships as {
                team_id: string;
                team: { id: string; name: string }[] | { id: string; name: string } | null;
              }[];
              const firstMembership = memberships?.[0];
              const t = firstMembership?.team;
              const teamName = t
                ? Array.isArray(t)
                  ? t[0]?.name ?? null
                  : t.name
                : null;

              const krs = krsByAssignee[person.id] ?? [];
              const avgScore =
                krs.length > 0
                  ? krs.reduce((sum, kr) => sum + kr.score, 0) / krs.length
                  : 0;

              return (
                <PersonCard
                  key={person.id}
                  id={person.id}
                  fullName={person.full_name}
                  avatarUrl={person.avatar_url}
                  teamName={teamName}
                  role={person.role}
                  score={avgScore}
                  krCount={krs.length}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
