import { cn } from '@/lib/utils';

function getScoreColour(score: number): string {
  if (score >= 0.7) return 'text-status-on-track';
  if (score >= 0.3) return 'text-status-at-risk';
  return 'text-status-off-track';
}

function getScoreBgColour(score: number): string {
  if (score >= 0.7) return 'bg-status-on-track-muted';
  if (score >= 0.3) return 'bg-status-at-risk-muted';
  return 'bg-status-off-track-muted';
}

interface ScoreBadgeProps {
  score: number;
  className?: string;
  showPercentage?: boolean;
}

export function ScoreBadge({ score, className, showPercentage = false }: ScoreBadgeProps) {
  const displayValue = showPercentage ? `${Math.round(score * 100)}%` : score.toFixed(2);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums',
        getScoreBgColour(score),
        getScoreColour(score),
        className
      )}
    >
      {displayValue}
    </span>
  );
}
