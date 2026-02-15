import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreRing } from '@/components/okr/score-ring';
import { StatusBadge } from '@/components/okr/status-badge';
import { Badge } from '@/components/ui/badge';
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

interface PersonCardProps {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  teamName: string | null;
  role: string;
  score: number;
  krCount: number;
}

export function PersonCard({
  id,
  fullName,
  avatarUrl,
  teamName,
  role,
  score,
  krCount,
}: PersonCardProps) {
  return (
    <Link href={`/people/${id}`}>
      <Card className="transition-colors hover:border-primary/30">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-10 w-10">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            <div className="flex items-center gap-1.5">
              {teamName && (
                <span className="truncate text-xs text-muted-foreground">{teamName}</span>
              )}
              {role === 'team_lead' && (
                <Badge variant="secondary" className="text-[10px]">
                  Lead
                </Badge>
              )}
              {role === 'admin' && (
                <Badge variant="secondary" className="text-[10px]">
                  Admin
                </Badge>
              )}
            </div>
          </div>
          {krCount > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              <ScoreRing score={score} size={40} strokeWidth={3} />
              <StatusBadge status={getOverallStatus(score)} />
            </div>
          ) : (
            <span className="shrink-0 text-xs text-muted-foreground">No KRs</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
