import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarGroupMember {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface AvatarGroupProps {
  members: AvatarGroupMember[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const sizeClasses = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
};

export function AvatarGroup({ members, max = 5, size = 'sm', className }: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((member) => (
        <Avatar
          key={member.id}
          className={cn('ring-2 ring-background', sizeClasses[size])}
        >
          {member.avatar_url && (
            <AvatarImage src={member.avatar_url} alt={member.full_name} />
          )}
          <AvatarFallback className={sizeClasses[size]}>
            {getInitials(member.full_name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <Avatar className={cn('ring-2 ring-background', sizeClasses[size])}>
          <AvatarFallback className={cn('bg-muted text-muted-foreground', sizeClasses[size])}>
            +{overflow}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
