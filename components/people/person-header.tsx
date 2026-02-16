import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/okr/score-ring';
import { StatusBadge } from '@/components/okr/status-badge';
import { scoreToRAG } from '@/lib/scoring';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface PersonHeaderProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  teamNames: string[];
  score: number;
  krCount: number;
  manager?: { id: string; full_name: string } | null;
  directReports?: { id: string; full_name: string; avatar_url: string | null }[];
}

export function PersonHeader({
  fullName,
  email,
  avatarUrl,
  role,
  teamNames,
  score,
  krCount,
  manager,
  directReports = [],
}: PersonHeaderProps) {
  return (
    <div className="space-y-3">
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
          {manager && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Reports to{' '}
              <Link href={`/people/${manager.id}`} className="font-medium text-foreground hover:underline">
                {manager.full_name}
              </Link>
            </p>
          )}
        </div>
        {krCount > 0 && (
          <div className="flex shrink-0 items-center gap-3">
            <ScoreRing score={score} size={56} strokeWidth={4} />
            <div className="text-right">
              <StatusBadge status={scoreToRAG(score)} />
              <p className="mt-1 text-xs text-muted-foreground">
                {krCount} KR{krCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>
      {directReports.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Direct reports:</span>
          {directReports.map((report) => (
            <Link
              key={report.id}
              href={`/people/${report.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Avatar className="h-4 w-4">
                {report.avatar_url && <AvatarImage src={report.avatar_url} alt={report.full_name} />}
                <AvatarFallback className="text-[8px]">{getInitials(report.full_name)}</AvatarFallback>
              </Avatar>
              {report.full_name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
