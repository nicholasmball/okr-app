import { Badge } from '@/components/ui/badge';
import type { ObjectiveStatus } from '@/types/database';
import { cn } from '@/lib/utils';

const statusConfig: Record<ObjectiveStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  completed: { label: 'Completed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
};

interface ObjectiveStatusBadgeProps {
  status: ObjectiveStatus;
  className?: string;
}

export function ObjectiveStatusBadge({ status, className }: ObjectiveStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn('text-xs', className)}>
      {config.label}
    </Badge>
  );
}
