'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScoreRing } from '@/components/okr/score-ring';
import { StatusBadge } from '@/components/okr/status-badge';
import { ProgressBar } from '@/components/okr/progress-bar';
import type { KRStatus, ObjectiveType } from '@/types/database';
import { cn } from '@/lib/utils';

const typeLabels: Record<ObjectiveType, string> = {
  team: 'Team',
  cross_cutting: 'Cross-Cutting',
  individual: 'Individual',
};

interface ObjectiveCardProps {
  title: string;
  type: ObjectiveType;
  score: number;
  status?: KRStatus;
  krCount?: number;
  teamName?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function ObjectiveCard({
  title,
  type,
  score,
  status,
  krCount,
  teamName,
  className,
  onClick,
  children,
}: ObjectiveCardProps) {
  return (
    <Card
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:border-primary/30',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <ScoreRing score={score} size={48} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {typeLabels[type]}
            </span>
            {teamName && (
              <span className="text-xs text-muted-foreground">{teamName}</span>
            )}
          </div>
          <h3 className="truncate text-sm font-semibold leading-tight">{title}</h3>
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar value={score} className="flex-1" />
            {status && <StatusBadge status={status} />}
          </div>
        </div>
      </CardHeader>
      {(children || krCount !== undefined) && (
        <CardContent className="pt-0">
          {krCount !== undefined && !children && (
            <p className="text-xs text-muted-foreground">
              {krCount} Key Result{krCount !== 1 ? 's' : ''}
            </p>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  );
}
