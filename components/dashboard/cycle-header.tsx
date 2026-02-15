import { CalendarDays } from 'lucide-react';
import { ScoreRing } from '@/components/okr/score-ring';

interface CycleHeaderProps {
  cycleName: string;
  startDate: string;
  endDate: string;
  averageScore: number;
  objectiveCount: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function CycleHeader({
  cycleName,
  startDate,
  endDate,
  averageScore,
  objectiveCount,
}: CycleHeaderProps) {
  const daysRemaining = getDaysRemaining(endDate);

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={averageScore} size={56} strokeWidth={5} />
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">{cycleName}</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(startDate)} &ndash; {formatDate(endDate)}
          </p>
        </div>
      </div>
      <div className="flex gap-6 text-center">
        <div>
          <p className="text-lg font-semibold tabular-nums">{objectiveCount}</p>
          <p className="text-xs text-muted-foreground">Objectives</p>
        </div>
        <div>
          <p className="text-lg font-semibold tabular-nums">{daysRemaining}</p>
          <p className="text-xs text-muted-foreground">Days left</p>
        </div>
      </div>
    </div>
  );
}
