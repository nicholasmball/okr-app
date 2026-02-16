import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { CycleHeader } from '@/components/dashboard/cycle-header';
import { ObjectiveSection } from '@/components/dashboard/objective-section';
import { CreateObjectiveDialog } from '@/components/okr/create-objective-dialog';
import { EmptyState } from '@/components/okr/empty-state';
import { HealthSummary } from '@/components/teams/health-summary';
import { Button } from '@/components/ui/button';
import { Target, CalendarDays, Plus } from 'lucide-react';
import type { AssignmentType, ObjectiveType, KRStatus } from '@/types/database';

export const metadata = { title: 'My OKRs' };

interface KRAssigneeJoin {
  user_id: string;
  profile: { id: string; full_name: string; avatar_url: string | null } | null;
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
  key_results: KeyResult[];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get user's profile to find their org
  const { data: profile } = await supabase
    .from('profiles')
    .select('organisation_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organisation_id) {
    return (
      <>
        <AppHeader title="My OKRs" />
        <div className="flex-1 p-6">
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="No organisation yet"
            description="You need to be part of an organisation to see your OKRs. Ask your admin to invite you or create a new organisation in Settings."
          />
        </div>
      </>
    );
  }

  // Get active cycle
  const { data: cycle } = await supabase
    .from('okr_cycles')
    .select('*')
    .eq('organisation_id', profile.organisation_id)
    .eq('is_active', true)
    .single();

  if (!cycle) {
    return (
      <>
        <AppHeader title="My OKRs" />
        <div className="flex-1 p-6">
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="No active cycle"
            description="There's no active OKR cycle. Ask your admin to create and activate one in the Cycles page."
          />
        </div>
      </>
    );
  }

  // Fetch teams and people for the create dialog
  const { data: allTeams } = await supabase
    .from('teams')
    .select('id, name')
    .eq('organisation_id', profile.organisation_id)
    .order('name');

  const { data: allPeople } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('organisation_id', profile.organisation_id)
    .order('full_name');

  // Get user's team memberships
  const { data: memberships } = await supabase
    .from('team_memberships')
    .select('team_id')
    .eq('user_id', user.id);

  const teamIds = memberships?.map((m) => m.team_id) ?? [];

  // Fetch objectives for this cycle relevant to the user
  let query = supabase
    .from('objectives')
    .select(
      '*, key_results(id, title, description, score, status, current_value, target_value, unit, assignee_id, assignment_type, assignee:profiles!key_results_assignee_id_fkey(id, full_name, avatar_url), key_result_assignees(user_id, profile:profiles!key_result_assignees_user_id_profile_fkey(id, full_name, avatar_url)))'
    )
    .eq('cycle_id', cycle.id);

  if (teamIds.length > 0) {
    query = query.or(
      `team_id.in.(${teamIds.join(',')}),owner_id.eq.${user.id}`
    );
  } else {
    query = query.or(`owner_id.eq.${user.id}`);
  }

  const { data: objectives } = await query.order('created_at', { ascending: false });

  const allObjectives: Objective[] = (objectives ?? []) as Objective[];

  const teamObjectives = allObjectives.filter((o) => o.type === 'team');
  const crossCuttingObjectives = allObjectives.filter((o) => o.type === 'cross_cutting');
  const individualObjectives = allObjectives.filter((o) => o.type === 'individual');

  const averageScore =
    allObjectives.length > 0
      ? allObjectives.reduce((sum, o) => sum + Number(o.score), 0) / allObjectives.length
      : 0;

  const hasObjectives = allObjectives.length > 0;

  return (
    <>
      <AppHeader title="My OKRs">
        <CreateObjectiveDialog
          organisationId={profile.organisation_id}
          cycleId={cycle.id}
          teams={allTeams ?? []}
          people={allPeople ?? []}
        >
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Objective
          </Button>
        </CreateObjectiveDialog>
      </AppHeader>
      <div className="flex-1 space-y-6 p-6">
        <CycleHeader
          cycleName={cycle.name}
          startDate={cycle.start_date}
          endDate={cycle.end_date}
          averageScore={Math.round(averageScore * 100) / 100}
          objectiveCount={allObjectives.length}
        />

        {hasObjectives && (
          <HealthSummary objectives={allObjectives} title="Cycle Health" />
        )}

        {!hasObjectives ? (
          <EmptyState
            icon={<Target className="h-10 w-10" />}
            title="No objectives yet"
            description="Your objectives and key results will appear here once they're created for this cycle."
          />
        ) : (
          <div className="space-y-8">
            <ObjectiveSection
              title="Team Objectives"
              objectives={teamObjectives}
              currentUserId={user.id}
              people={allPeople ?? []}
            />
            <ObjectiveSection
              title="Cross-Cutting Objectives"
              objectives={crossCuttingObjectives}
              currentUserId={user.id}
              people={allPeople ?? []}
            />
            <ObjectiveSection
              title="Individual Objectives"
              objectives={individualObjectives}
              currentUserId={user.id}
              people={allPeople ?? []}
            />
          </div>
        )}
      </div>
    </>
  );
}
