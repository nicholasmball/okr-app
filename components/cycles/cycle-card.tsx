'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, CheckCircle2, Pencil, Play, Square, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditCycleDialog } from '@/components/cycles/edit-cycle-dialog';
import { CarryForwardDialog } from '@/components/cycles/carry-forward-dialog';
import { setActiveCycle, closeCycle } from '@/lib/actions/cycles';
import { cn } from '@/lib/utils';

interface CycleStats {
  totalObjectives: number;
  averageScore: number;
  completionRate: number;
  onTrackCount: number;
  atRiskCount: number;
  offTrackCount: number;
}

interface CycleCardProps {
  cycle: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    organisation_id: string;
  };
  stats: CycleStats;
  allCycles: { id: string; name: string }[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCycleStatus(cycle: { start_date: string; end_date: string; is_active: boolean }) {
  const now = new Date();
  const start = new Date(cycle.start_date + 'T00:00:00');
  const end = new Date(cycle.end_date + 'T23:59:59');

  if (cycle.is_active) return 'active';
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'inactive';
}

const statusConfig = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  upcoming: { label: 'Upcoming', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  past: { label: 'Past', className: 'bg-muted text-muted-foreground' },
  inactive: { label: 'Inactive', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

export function CycleCard({ cycle, stats, allCycles }: CycleCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const status = getCycleStatus(cycle);
  const config = statusConfig[status];

  function handleSetActive() {
    startTransition(async () => {
      await setActiveCycle(cycle.organisation_id, cycle.id);
      router.refresh();
    });
  }

  function handleClose() {
    startTransition(async () => {
      await closeCycle(cycle.id);
      router.refresh();
    });
  }

  return (
    <Card className={cn(cycle.is_active && 'ring-1 ring-primary/30')}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-sm font-semibold">{cycle.name}</h3>
            <Badge variant="outline" className={cn('text-[10px]', config.className)}>
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDate(cycle.start_date)} — {formatDate(cycle.end_date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditCycleDialog cycle={cycle}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </EditCycleDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md bg-muted/50 p-2.5 text-center">
            <p className="text-lg font-semibold">{stats.totalObjectives}</p>
            <p className="text-[10px] text-muted-foreground">Objectives</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2.5 text-center">
            <p className="text-lg font-semibold">{Math.round(stats.averageScore * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">Avg Score</p>
          </div>
          <div className="rounded-md bg-muted/50 p-2.5 text-center">
            <p className="text-lg font-semibold">{Math.round(stats.completionRate)}%</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* RAG breakdown */}
        {stats.totalObjectives > 0 && (
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-status-on-track" />
              {stats.onTrackCount} on track
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-status-at-risk" />
              {stats.atRiskCount} at risk
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-status-off-track" />
              {stats.offTrackCount} off track
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t pt-3">
          {!cycle.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetActive}
              disabled={isPending}
            >
              <Play className="mr-1 h-3.5 w-3.5" />
              Set Active
            </Button>
          )}
          {cycle.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              <Square className="mr-1 h-3.5 w-3.5" />
              Close Cycle
            </Button>
          )}
          {status === 'past' || !cycle.is_active ? (
            <CarryForwardDialog
              fromCycleId={cycle.id}
              fromCycleName={cycle.name}
              availableCycles={allCycles}
            >
              <Button variant="outline" size="sm">
                <ArrowRight className="mr-1 h-3.5 w-3.5" />
                Carry Forward
              </Button>
            </CarryForwardDialog>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
