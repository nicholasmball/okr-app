import { StatusBadge } from '@/components/okr/status-badge';
import type { KRStatus } from '@/types/database';

interface CheckIn {
  id: string;
  value: number;
  status: KRStatus;
  comment: string | null;
  created_at: string;
  author: { full_name: string } | null;
}

interface CheckInTimelineProps {
  checkIns: CheckIn[];
  unit: string;
  targetValue: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CheckInTimeline({ checkIns, unit, targetValue }: CheckInTimelineProps) {
  if (checkIns.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No check-ins recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {checkIns.map((checkIn, index) => (
        <div key={checkIn.id} className="relative flex gap-3 pb-4">
          {index < checkIns.length - 1 && (
            <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
          )}
          <div className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                {checkIn.value} / {targetValue} {unit}
              </span>
              <StatusBadge status={checkIn.status} />
            </div>
            {checkIn.comment && (
              <p className="mt-1 text-sm text-foreground">{checkIn.comment}</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {checkIn.author?.full_name ?? 'Unknown'} · {formatDate(checkIn.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
