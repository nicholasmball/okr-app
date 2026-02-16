import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/settings/profile-form';
import { OrgForm } from '@/components/settings/org-form';
import { TeamManagement } from '@/components/settings/team-management';
import { UserManagement } from '@/components/settings/user-management';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, organisation_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const isAdmin = profile.role === 'admin';
  const isAdminOrLead = profile.role === 'admin' || profile.role === 'team_lead';

  // Fetch org data
  let organisation = null;
  if (profile.organisation_id) {
    const { data } = await supabase
      .from('organisations')
      .select('id, name')
      .eq('id', profile.organisation_id)
      .single();
    organisation = data;
  }

  // Fetch teams with members for team management
  let teams: {
    id: string;
    name: string;
    description: string | null;
    team_lead_id: string | null;
    members: { id: string; full_name: string; email: string }[];
  }[] = [];

  if (profile.organisation_id && isAdminOrLead) {
    const { data: teamsData } = await supabase
      .from('teams')
      .select(
        'id, name, description, team_lead_id, team_memberships(user_id, profile:profiles(id, full_name, email))'
      )
      .eq('organisation_id', profile.organisation_id)
      .order('name');

    teams = (teamsData ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      team_lead_id: t.team_lead_id,
      members: (t.team_memberships ?? []).map(
        (m: { profile: { id: string; full_name: string; email: string }[] | { id: string; full_name: string; email: string } }) => {
          const p = Array.isArray(m.profile) ? m.profile[0] : m.profile;
          return { id: p.id, full_name: p.full_name, email: p.email };
        }
      ),
    }));
  }

  // Fetch all people in org
  let allPeople: { id: string; full_name: string; email: string; role: string; manager_id: string | null }[] = [];
  if (profile.organisation_id) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, manager_id')
      .eq('organisation_id', profile.organisation_id)
      .order('full_name');
    allPeople = (data ?? []) as typeof allPeople;
  }

  return (
    <>
      <AppHeader title="Settings" />
      <div className="flex-1 p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isAdminOrLead && <TabsTrigger value="teams">Teams</TabsTrigger>}
            {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
            {isAdmin && organisation && <TabsTrigger value="organisation">Organisation</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile">
            <div className="max-w-lg">
              <ProfileForm
                profile={{ id: profile.id, full_name: profile.full_name, email: profile.email }}
              />
            </div>
          </TabsContent>

          {isAdminOrLead && (
            <TabsContent value="teams">
              <div className="max-w-2xl">
                <TeamManagement
                  organisationId={profile.organisation_id!}
                  teams={teams}
                  allPeople={allPeople.map((p) => ({ id: p.id, full_name: p.full_name, email: p.email }))}
                />
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="users">
              <div className="max-w-2xl">
                <UserManagement
                  users={allPeople.map((p) => ({
                    id: p.id,
                    full_name: p.full_name,
                    email: p.email,
                    role: p.role as 'admin' | 'team_lead' | 'member',
                    manager_id: p.manager_id,
                  }))}
                  currentUserId={user.id}
                />
              </div>
            </TabsContent>
          )}

          {isAdmin && organisation && (
            <TabsContent value="organisation">
              <div className="max-w-lg">
                <OrgForm organisation={organisation} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}
