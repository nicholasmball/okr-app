import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/okr/avatar-group';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface TeamHeaderProps {
  name: string;
  description?: string | null;
  teamLead?: TeamMember | null;
  members: TeamMember[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TeamHeader({ name, description, teamLead, members }: TeamHeaderProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-3 flex items-center gap-4">
          {teamLead && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {teamLead.avatar_url && (
                  <AvatarImage src={teamLead.avatar_url} alt={teamLead.full_name} />
                )}
                <AvatarFallback className="text-[10px]">
                  {getInitials(teamLead.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{teamLead.full_name}</span>
              <Badge variant="secondary" className="text-[10px]">
                Lead
              </Badge>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <AvatarGroup members={members} max={6} size="md" />
        <span className="text-xs text-muted-foreground">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
