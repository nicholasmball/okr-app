'use client';

import { useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreRing } from '@/components/okr/score-ring';
import { StatusBadge } from '@/components/okr/status-badge';
import { ProgressBar } from '@/components/okr/progress-bar';
import { KeyResultRow } from '@/components/okr/key-result-row';
import { CheckInSheet } from '@/components/okr/check-in-sheet';
import { EditKeyResultSheet } from '@/components/okr/edit-kr-sheet';
import { EditObjectiveDialog } from '@/components/okr/edit-objective-dialog';
import { AvatarGroup } from '@/components/okr/avatar-group';
import type { AssignmentType, KRStatus, ObjectiveType, ObjectiveStatus } from '@/types/database';
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

interface KRAssigneeJoin {
  user_id: string;
  profile: { id: string; full_name: string; avatar_url: string | null } | null;
}

interface Assignee {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface KeyResult {
  id: string;
  title: string;
  description?: string | null;
  score: number;
  status: KRStatus;
  current_value: number;
  target_value: number;
  unit: string;
  assignee_id: string | null;
  assignment_type?: AssignmentType;
  assignee?: Assignee | null;
  key_result_assignees?: KRAssigneeJoin[];
}

interface Objective {
  id: string;
  title: string;
  description?: string | null;
  type: ObjectiveType;
  score: number;
  status: string;
  team_id?: string | null;
  key_results: KeyResult[];
}

interface ObjectiveSectionProps {
  title: string;
  objectives: Objective[];
  currentUserId: string;
  people?: Person[];
  teamName?: string;
}

function getAssigneesFromKR(kr: KeyResult): Assignee[] {
  if (kr.key_result_assignees && kr.key_result_assignees.length > 0) {
    return kr.key_result_assignees
      .filter((a): a is KRAssigneeJoin & { profile: NonNullable<KRAssigneeJoin['profile']> } => a.profile != null)
      .map((a) => a.profile);
  }
  if (kr.assignee) return [kr.assignee];
  return [];
}

function isUserAssigned(kr: KeyResult, userId: string): boolean {
  if (kr.key_result_assignees && kr.key_result_assignees.length > 0) {
    return kr.key_result_assignees.some((a) => a.user_id === userId);
  }
  return kr.assignee_id === userId;
}

function ExpandableObjective({
  objective,
  currentUserId,
  people,
  teamName,
  onKRClick,
  onKREdit,
}: {
  objective: Objective;
  currentUserId: string;
  people?: Person[];
  teamName?: string;
  onKRClick: (kr: KeyResult) => void;
  onKREdit: (kr: KeyResult) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const krStatus = objective.key_results.length > 0
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
        <div className="flex shrink-0 items-center gap-3">
          {(() => {
            const assignees = objective.key_results.flatMap(getAssigneesFromKR);
            const unique = assignees.filter(
              (a, i, arr) => arr.findIndex((x) => x.id === a.id) === i
            );
            return unique.length > 0 ? <AvatarGroup members={unique} max={3} size="sm" /> : null;
          })()}
          <EditObjectiveDialog
            objective={{
              id: objective.id,
              title: objective.title,
              description: objective.description ?? null,
              status: objective.status as ObjectiveStatus,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
              aria-label="Edit objective"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </EditObjectiveDialog>
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
                  isUserAssigned(kr, currentUserId) && 'bg-primary/5 ring-1 ring-primary/20'
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
                  assignmentType={kr.assignment_type}
                  assignees={getAssigneesFromKR(kr)}
                  people={people}
                  teamName={teamName}
                  objectiveTeamId={objective.team_id}
                  onClick={() => onKRClick(kr)}
                  onEdit={() => onKREdit(kr)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function ObjectiveSection({ title, objectives, currentUserId, people, teamName }: ObjectiveSectionProps) {
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editKR, setEditKR] = useState<KeyResult | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  if (objectives.length === 0) return null;

  function handleKRClick(kr: KeyResult) {
    setSelectedKR(kr);
    setSheetOpen(true);
  }

  function handleKREdit(kr: KeyResult) {
    setEditKR(kr);
    setEditSheetOpen(true);
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
            people={people}
            teamName={teamName}
            onKRClick={handleKRClick}
            onKREdit={handleKREdit}
          />
        ))}
      </div>
      <CheckInSheet
        kr={selectedKR}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        currentUserId={currentUserId}
      />
      <EditKeyResultSheet
        kr={editKR}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </section>
  );
}
