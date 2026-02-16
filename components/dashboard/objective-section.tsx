'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScoreRing } from '@/components/okr/score-ring';
import { StatusBadge } from '@/components/okr/status-badge';
import { ProgressBar } from '@/components/okr/progress-bar';
import { KeyResultRow } from '@/components/okr/key-result-row';
import { CheckInSheet } from '@/components/okr/check-in-sheet';
import { AvatarGroup } from '@/components/okr/avatar-group';
import type { KRStatus, ObjectiveType } from '@/types/database';
import { cn } from '@/lib/utils';

const typeLabels: Record<ObjectiveType, string> = {
  team: 'Team',
  cross_cutting: 'Cross-Cutting',
  individual: 'Individual',
};

interface Assignee {
  id: string;
  full_name: string;
  avatar_url: string | null;
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
  assignee?: Assignee | null;
}

interface Objective {
  id: string;
  title: string;
  type: ObjectiveType;
  score: number;
  status: string;
  key_results: KeyResult[];
}

interface ObjectiveSectionProps {
  title: string;
  objectives: Objective[];
  currentUserId: string;
}

function ExpandableObjective({
  objective,
  currentUserId,
  onKRClick,
}: {
  objective: Objective;
  currentUserId: string;
  onKRClick: (kr: KeyResult) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const krStatus = objective.key_results.length > 0
    ? (objective.key_results.find((kr) => kr.status === 'off_track')?.status ??
       objective.key_results.find((kr) => kr.status === 'at_risk')?.status ??
       'on_track')
    : ('on_track' as KRStatus);

  return (
    <Card>
      <CardHeader
        className="flex cursor-pointer flex-row items-start gap-4 space-y-0 pb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <ScoreRing score={objective.score} size={48} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {typeLabels[objective.type]}
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-tight">{objective.title}</h3>
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar value={objective.score} className="flex-1" />
            <StatusBadge status={krStatus as KRStatus} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {(() => {
            const assignees = objective.key_results
              .filter((kr): kr is KeyResult & { assignee: Assignee } => kr.assignee != null)
              .map((kr) => kr.assignee);
            const unique = assignees.filter(
              (a, i, arr) => arr.findIndex((x) => x.id === a.id) === i
            );
            return unique.length > 0 ? <AvatarGroup members={unique} max={3} size="sm" /> : null;
          })()}
          <span className="text-xs text-muted-foreground">
            {objective.key_results.length} KR{objective.key_results.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </CardHeader>
      {expanded && objective.key_results.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-1 border-t pt-3">
            {objective.key_results.map((kr) => (
              <div
                key={kr.id}
                className={cn(
                  'rounded-md',
                  kr.assignee_id === currentUserId && 'bg-primary/5 ring-1 ring-primary/20'
                )}
              >
                <KeyResultRow
                  title={kr.title}
                  currentValue={kr.current_value}
                  targetValue={kr.target_value}
                  unit={kr.unit}
                  score={kr.score}
                  status={kr.status}
                  assignee={kr.assignee}
                  onClick={() => onKRClick(kr)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ObjectiveSection({ title, objectives, currentUserId }: ObjectiveSectionProps) {
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (objectives.length === 0) return null;

  function handleKRClick(kr: KeyResult) {
    setSelectedKR(kr);
    setSheetOpen(true);
  }

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3">
        {objectives.map((obj) => (
          <ExpandableObjective
            key={obj.id}
            objective={obj}
            currentUserId={currentUserId}
            onKRClick={handleKRClick}
          />
        ))}
      </div>
      <CheckInSheet
        kr={selectedKR}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currentUserId={currentUserId}
      />
    </section>
  );
}
