import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/app-header';
import { EmptyState } from '@/components/okr/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarGroup } from '@/components/okr/avatar-group';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export const metadata = { title: 'Teams' };

export default async function TeamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organisation_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organisation_id) {
    return (
      <>
        <AppHeader title="Teams" />
        <div className="flex-1 p-6">
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No organisation yet"
            description="Join an organisation to see teams."
          />
        </div>
      </>
    );
  }

  const { data: teams } = await supabase
    .from('teams')
    .select(
      '*, team_lead:profiles!teams_team_lead_id_fkey(id, full_name, avatar_url), team_memberships(user_id, profile:profiles(id, full_name, avatar_url))'
    )
    .eq('organisation_id', profile.organisation_id)
    .order('name');

  if (!teams || teams.length === 0) {
    return (
      <>
        <AppHeader title="Teams" />
        <div className="flex-1 p-6">
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No teams yet"
            description="Teams will be listed here once they're created in settings."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Teams" />
      <div className="flex-1 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const members = (team.team_memberships ?? []).map((m: { profile: { id: string; full_name: string; avatar_url: string | null } }) => ({
              id: m.profile.id,
              full_name: m.profile.full_name,
              avatar_url: m.profile.avatar_url,
            }));

            return (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="transition-colors hover:border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    {team.team_lead && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">
                          {(team.team_lead as { full_name: string }).full_name}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          Lead
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <AvatarGroup members={members} max={5} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {members.length} member{members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
