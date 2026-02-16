import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from '@/components/okr/score-badge';
import { StatusBadge } from '@/components/okr/status-badge';
import { ProgressBar } from '@/components/okr/progress-bar';
import { AvatarGroup } from '@/components/okr/avatar-group';
import { AssigneePicker } from '@/components/okr/assignee-picker';
import type { AssignmentType, KRStatus } from '@/types/database';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Person {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface KeyResultRowProps {
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  score: number;
  status: KRStatus;
  krId?: string;
  assignmentType?: AssignmentType;
  assignees?: Person[];
  assignee?: Person | null;
  people?: Person[];
  teamName?: string;
  objectiveTeamId?: string | null;
  className?: string;
  onClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function KeyResultRow({
  title,
  currentValue,
  targetValue,
  unit,
  score,
  status,
  krId,
  assignmentType,
  assignees = [],
  assignee,
  people,
  teamName,
  objectiveTeamId,
  className,
  onClick,
}: KeyResultRowProps) {
  const canAssign = krId && people;

  // Build resolved assignees list: prefer junction-based assignees, fall back to legacy assignee
  const resolvedAssignees =
    assignees.length > 0
      ? assignees
      : assignee
        ? [assignee]
        : [];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors',
        onClick && 'cursor-pointer hover:border-border hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <ProgressBar value={currentValue} max={targetValue} className="max-w-48" />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {currentValue} / {targetValue} {unit}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ScoreBadge score={score} />
        <StatusBadge status={status} />
        {canAssign ? (
          <AssigneePicker
            krId={krId}
            assignmentType={assignmentType}
            assignees={resolvedAssignees}
            people={people}
            teamName={teamName}
            objectiveTeamId={objectiveTeamId}
          />
        ) : assignmentType === 'team' && teamName ? (
          <Badge variant="secondary" className="h-6 gap-1 text-[10px]">
            <Users className="h-3 w-3" />
            {teamName}
          </Badge>
        ) : resolvedAssignees.length > 1 ? (
          <AvatarGroup members={resolvedAssignees} max={3} size="sm" />
        ) : resolvedAssignees.length === 1 ? (
          <Avatar className="h-6 w-6">
            {resolvedAssignees[0].avatar_url && (
              <AvatarImage src={resolvedAssignees[0].avatar_url} alt={resolvedAssignees[0].full_name} />
            )}
            <AvatarFallback className="text-[10px]">
              {getInitials(resolvedAssignees[0].full_name)}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}
