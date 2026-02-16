import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScoreBadge } from '@/components/okr/score-badge';
import { StatusBadge } from '@/components/okr/status-badge';
import { ProgressBar } from '@/components/okr/progress-bar';
import { AssigneePicker } from '@/components/okr/assignee-picker';
import type { KRStatus } from '@/types/database';
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
  assignee?: Person | null;
  people?: Person[];
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
  assignee,
  people,
  className,
  onClick,
}: KeyResultRowProps) {
  const canAssign = krId && people;

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
          <AssigneePicker krId={krId} assignee={assignee} people={people} />
        ) : (
          assignee && (
            <Avatar className="h-6 w-6">
              {assignee.avatar_url && <AvatarImage src={assignee.avatar_url} alt={assignee.full_name} />}
              <AvatarFallback className="text-[10px]">
                {getInitials(assignee.full_name)}
              </AvatarFallback>
            </Avatar>
          )
        )}
      </div>
    </div>
  );
}
