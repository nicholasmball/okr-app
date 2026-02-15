import { cn } from '@/lib/utils';
import { scoreToRAG } from '@/lib/scoring';

const textMap = { on_track: 'text-status-on-track', at_risk: 'text-status-at-risk', off_track: 'text-status-off-track' };
const bgMap = { on_track: 'bg-status-on-track-muted', at_risk: 'bg-status-at-risk-muted', off_track: 'bg-status-off-track-muted' };

function getScoreColour(score: number): string { return textMap[scoreToRAG(score)]; }
function getScoreBgColour(score: number): string { return bgMap[scoreToRAG(score)]; }

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
