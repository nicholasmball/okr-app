import { cn } from '@/lib/utils';

function getBarColour(score: number): string {
  if (score >= 0.7) return 'bg-status-on-track';
  if (score >= 0.3) return 'bg-status-at-risk';
  return 'bg-status-off-track';
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 1, className, showLabel = false }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const score = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', getBarColour(score))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs tabular-nums text-muted-foreground">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}
