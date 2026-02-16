'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScoreRing } from '@/components/okr/score-ring';
import { StatusBadge } from '@/components/okr/status-badge';
import { ProgressBar } from '@/components/okr/progress-bar';
import { KeyResultRow } from '@/components/okr/key-result-row';
import { KRDetailSheet } from '@/components/people/kr-detail-sheet';
import type { KRStatus, ObjectiveType } from '@/types/database';
import { cn } from '@/lib/utils';

const typeLabels: Record<ObjectiveType, string> = {
  team: 'Team',
  cross_cutting: 'Cross-Cutting',
  individual: 'Individual',
};

interface Person {
  id: string;
  full_name: string;
  avatar_url?: string | null;
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
}

interface Objective {
  id: string;
  title: string;
  type: ObjectiveType;
  score: number;
  status: string;
  key_results: KeyResult[];
}

interface PersonObjectivesProps {
  objectives: Objective[];
  personId: string;
  people?: Person[];
}

function ExpandableObjective({
  objective,
  personId,
  people,
  onKRClick,
}: {
  objective: Objective;
  personId: string;
  people?: Person[];
  onKRClick: (kr: KeyResult) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const krStatus =
    objective.key_results.length > 0
      ? (objective.key_results.find((kr) => kr.status === 'off_track')?.status ??
        objective.key_results.find((kr) => kr.status === 'at_risk')?.status ??
        'on_track')
      : ('on_track' as KRStatus);

  return (
    <Card className="overflow-hidden">
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
        <div className="flex shrink-0 items-center gap-2">
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
                  kr.assignee_id === personId && 'bg-primary/5 ring-1 ring-primary/20'
                )}
              >
                <KeyResultRow
                  krId={kr.id}
                  title={kr.title}
                  currentValue={kr.current_value}
                  targetValue={kr.target_value}
                  unit={kr.unit}
                  score={kr.score}
                  status={kr.status}
                  people={people}
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

export function PersonObjectives({ objectives, personId, people }: PersonObjectivesProps) {
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleKRClick(kr: KeyResult) {
    setSelectedKR(kr);
    setSheetOpen(true);
  }

  const grouped = {
    team: objectives.filter((o) => o.type === 'team'),
    cross_cutting: objectives.filter((o) => o.type === 'cross_cutting'),
    individual: objectives.filter((o) => o.type === 'individual'),
  };

  const sections: { title: string; items: Objective[] }[] = [
    { title: 'Team Objectives', items: grouped.team },
    { title: 'Cross-Cutting Objectives', items: grouped.cross_cutting },
    { title: 'Individual Objectives', items: grouped.individual },
  ];

  return (
    <>
      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <section key={section.title}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((obj) => (
                  <ExpandableObjective
                    key={obj.id}
                    objective={obj}
                    personId={personId}
                    people={people}
                    onKRClick={handleKRClick}
                  />
                ))}
              </div>
            </section>
          )
      )}

      <KRDetailSheet kr={selectedKR} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
