import { Badge } from '@/components/ui/badge';
import type { KRStatus } from '@/types/database';
import { cn } from '@/lib/utils';

const statusConfig: Record<KRStatus, { label: string; className: string }> = {
  on_track: {
    label: 'On Track',
    className: 'bg-status-on-track text-status-on-track-foreground hover:bg-status-on-track/90',
  },
  at_risk: {
    label: 'At Risk',
    className: 'bg-status-at-risk text-status-at-risk-foreground hover:bg-status-at-risk/90',
  },
  off_track: {
    label: 'Off Track',
    className: 'bg-status-off-track text-status-off-track-foreground hover:bg-status-off-track/90',
  },
};

interface StatusBadgeProps {
  status: KRStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={cn('text-xs font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
}
