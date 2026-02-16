import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { TeamHeader } from '@/components/teams/team-header';
import { HealthSummary } from '@/components/teams/health-summary';
import { TeamSelector } from '@/components/teams/team-selector';
import { ObjectiveSection } from '@/components/dashboard/objective-section';
import { CreateObjectiveDialog } from '@/components/okr/create-objective-dialog';
import { EmptyState } from '@/components/okr/empty-state';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';
import type { AssignmentType, KRStatus, ObjectiveType } from '@/types/database';

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
}

interface Objective {
  id: string;
  title: string;
  type: ObjectiveType;
  score: number;
  status: string;
  key_results: KeyResult[];
}

export async function generateMetadata({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const supabase = await createClient();
  const { data: team } = await supabase
    .from('teams')
    .select('name')
    .eq('id', teamId)
    .single();

  return { title: team?.name ?? 'Team' };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch team with lead and members
  const { data: team, error } = await supabase
    .from('teams')
    .select(
      '*, team_lead:profiles!teams_team_lead_id_fkey(id, full_name, email, avatar_url), team_memberships(user_id, profile:profiles(id, full_name, email, avatar_url))'
    )
    .eq('id', teamId)
    .single();

  if (error || !team) notFound();

  // Get user's profile for org
  const { data: profile } = await supabase
    .from('profiles')
    .select('organisation_id')
    .eq('id', user.id)
    .single();

  // Get all teams for selector
  const { data: allTeams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('organisation_id', profile?.organisation_id ?? '')
    .order('name');

  // Get active cycle
  const { data: cycle } = await supabase
    .from('okr_cycles')
    .select('*')
    .eq('organisation_id', profile?.organisation_id ?? '')
    .eq('is_active', true)
    .single();

  const members = (team.team_memberships ?? []).map(
    (m: { profile: { id: string; full_name: string; email: string; avatar_url: string | null } }) => ({
      id: m.profile.id,
      full_name: m.profile.full_name,
      avatar_url: m.profile.avatar_url,
    })
  );

  const teamLead = team.team_lead as { id: string; full_name: string; avatar_url: string | null } | null;

  // Fetch people for create dialog
  const { data: allPeople } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('organisation_id', profile?.organisation_id ?? '')
    .order('full_name');

  // Fetch team objectives for active cycle
  let objectives: Objective[] = [];
  if (cycle) {
    const { data } = await supabase
      .from('objectives')
      .select(
        '*, key_results(id, title, score, status, current_value, target_value, unit, assignee_id, assignment_type, assignee:profiles!key_results_assignee_id_fkey(id, full_name, avatar_url), key_result_assignees(user_id, profile:profiles!key_result_assignees_user_id_profile_fkey(id, full_name, avatar_url)))'
      )
      .eq('team_id', teamId)
      .eq('cycle_id', cycle.id)
      .order('created_at', { ascending: false });

    objectives = (data ?? []) as Objective[];
  }

  return (
    <>
      <AppHeader title={team.name}>
        <div className="flex items-center gap-2">
          {allTeams && allTeams.length > 1 && (
            <TeamSelector teams={allTeams} currentTeamId={teamId} />
          )}
          {cycle && (
            <CreateObjectiveDialog
              organisationId={profile?.organisation_id ?? ''}
              cycleId={cycle.id}
              teams={allTeams ?? []}
              people={allPeople ?? []}
              defaultType="team"
              defaultTeamId={teamId}
            >
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                New Objective
              </Button>
            </CreateObjectiveDialog>
          )}
        </div>
      </AppHeader>
      <div className="flex-1 space-y-6 p-6">
        <TeamHeader
          name={team.name}
          description={team.description}
          teamLead={teamLead}
          members={members}
        />

        {objectives.length > 0 && <HealthSummary objectives={objectives} />}

        {!cycle ? (
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="No active cycle"
            description="There's no active OKR cycle to display objectives for."
          />
        ) : objectives.length === 0 ? (
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="No objectives yet"
            description={`No objectives have been created for ${team.name} in this cycle.`}
          />
        ) : (
          <ObjectiveSection
            title="Team Objectives"
            objectives={objectives}
            currentUserId={user.id}
            people={allPeople ?? []}
            teamName={team.name}
          />
        )}
      </div>
    </>
  );
}
