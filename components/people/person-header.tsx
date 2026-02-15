import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/okr/score-ring';
import { StatusBadge } from '@/components/okr/status-badge';
import type { KRStatus } from '@/types/database';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getOverallStatus(score: number): KRStatus {
  if (score >= 0.7) return 'on_track';
  if (score >= 0.3) return 'at_risk';
  return 'off_track';
}

interface PersonHeaderProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  teamNames: string[];
  score: number;
  krCount: number;
}

export function PersonHeader({
  fullName,
  email,
  avatarUrl,
  role,
  teamNames,
  score,
  krCount,
}: PersonHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-14 w-14">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
        <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{fullName}</h1>
          {role === 'team_lead' && (
            <Badge variant="secondary" className="text-[10px]">
              Team Lead
            </Badge>
          )}
          {role === 'admin' && (
            <Badge variant="secondary" className="text-[10px]">
              Admin
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{email}</p>
        {teamNames.length > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {teamNames.join(' · ')}
          </p>
        )}
      </div>
      {krCount > 0 && (
        <div className="flex shrink-0 items-center gap-3">
          <ScoreRing score={score} size={56} strokeWidth={4} />
          <div className="text-right">
            <StatusBadge status={getOverallStatus(score)} />
            <p className="mt-1 text-xs text-muted-foreground">
              {krCount} KR{krCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
