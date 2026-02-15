'use client';

import { cn } from '@/lib/utils';
import { scoreToRAG } from '@/lib/scoring';

const strokeMap = { on_track: 'stroke-status-on-track', at_risk: 'stroke-status-at-risk', off_track: 'stroke-status-off-track' };
const fillMap = { on_track: 'fill-status-on-track', at_risk: 'fill-status-at-risk', off_track: 'fill-status-off-track' };

function getStrokeColour(score: number): string { return strokeMap[scoreToRAG(score)]; }
function getTextColour(score: number): string { return fillMap[scoreToRAG(score)]; }

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreRing({ score, size = 48, strokeWidth = 4, className }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(score, 1));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('shrink-0', className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={getStrokeColour(score)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className={cn('text-xs font-semibold', getTextColour(score))}
      >
        {Math.round(score * 100)}%
      </text>
    </svg>
  );
}
