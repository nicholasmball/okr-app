import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { EmptyState } from '@/components/okr/empty-state';
import { CycleCard } from '@/components/cycles/cycle-card';
import { CreateCycleDialog } from '@/components/cycles/create-cycle-dialog';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus } from 'lucide-react';

export const metadata = { title: 'Cycles' };

export default async function CyclesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organisation_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.organisation_id) {
    return (
      <>
        <AppHeader title="Cycles" />
        <div className="flex-1 p-6">
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="No organisation yet"
            description="You need to be part of an organisation to manage OKR cycles."
          />
        </div>
      </>
    );
  }

  // Fetch all cycles
  const { data: cycles } = await supabase
    .from('okr_cycles')
    .select('*')
    .eq('organisation_id', profile.organisation_id)
    .order('start_date', { ascending: false });

  // Fetch objectives with key results for all cycles to compute stats
  const { data: objectives } = await supabase
    .from('objectives')
    .select('id, cycle_id, score, status, key_results(id, status)')
    .eq('organisation_id', profile.organisation_id);

  const allCycles = (cycles ?? []).map((c) => ({ id: c.id, name: c.name }));

  // Compute stats per cycle
  const cycleStats = new Map<
    string,
    {
      totalObjectives: number;
      averageScore: number;
      completionRate: number;
      onTrackCount: number;
      atRiskCount: number;
      offTrackCount: number;
    }
  >();

  for (const cycle of cycles ?? []) {
    const cycleObjs = (objectives ?? []).filter((o) => o.cycle_id === cycle.id);
    const totalObjectives = cycleObjs.length;
    const averageScore =
      totalObjectives > 0
        ? cycleObjs.reduce((sum, o) => sum + Number(o.score), 0) / totalObjectives
        : 0;
    const completedCount = cycleObjs.filter((o) => o.status === 'completed').length;
    const completionRate = totalObjectives > 0 ? (completedCount / totalObjectives) * 100 : 0;

    // RAG counts from key results
    const allKRs = cycleObjs.flatMap((o) => o.key_results ?? []);
    const onTrackCount = allKRs.filter((kr) => kr.status === 'on_track').length;
    const atRiskCount = allKRs.filter((kr) => kr.status === 'at_risk').length;
    const offTrackCount = allKRs.filter((kr) => kr.status === 'off_track').length;

    cycleStats.set(cycle.id, {
      totalObjectives,
      averageScore,
      completionRate,
      onTrackCount,
      atRiskCount,
      offTrackCount,
    });
  }

  const canManage = profile.role === 'admin' || profile.role === 'team_lead';

  return (
    <>
      <AppHeader title="Cycles">
        {canManage && (
          <CreateCycleDialog organisationId={profile.organisation_id}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New Cycle
            </Button>
          </CreateCycleDialog>
        )}
      </AppHeader>
      <div className="flex-1 p-6">
        {(cycles ?? []).length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="No cycles yet"
            description="Create your first OKR cycle to start tracking objectives."
            action={
              canManage ? (
                <CreateCycleDialog organisationId={profile.organisation_id}>
                  <Button size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Create First Cycle
                  </Button>
                </CreateCycleDialog>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(cycles ?? []).map((cycle) => (
              <CycleCard
                key={cycle.id}
                cycle={cycle}
                stats={cycleStats.get(cycle.id) ?? {
                  totalObjectives: 0,
                  averageScore: 0,
                  completionRate: 0,
                  onTrackCount: 0,
                  atRiskCount: 0,
                  offTrackCount: 0,
                }}
                allCycles={allCycles}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
