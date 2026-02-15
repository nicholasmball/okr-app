'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeleteConfirmation } from '@/components/okr/delete-confirmation';
import {
  createTeam,
  updateTeam,
  deleteTeam,
  assignTeamLead,
  addTeamMember,
  removeTeamMember,
} from '@/lib/actions/teams';

interface Member {
  id: string;
  full_name: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  team_lead_id: string | null;
  members: Member[];
}

interface TeamManagementProps {
  organisationId: string;
  teams: Team[];
  allPeople: Member[];
}

function CreateTeamDialog({
  organisationId,
  children,
}: {
  organisationId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createTeam({ name: name.trim(), description: description.trim() || undefined, organisationId });
        setName('');
        setDescription('');
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create team');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Name</Label>
            <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-desc">Description</Label>
            <Textarea id="team-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTeamDialog({
  team,
  children,
}: {
  team: { id: string; name: string; description: string | null };
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateTeam({ id: team.id, name: name.trim(), description: description.trim() });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update team');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-team-name">Name</Label>
            <Input id="edit-team-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-team-desc">Description</Label>
            <Textarea id="edit-team-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamRow({ team, allPeople }: { team: Team; allPeople: Member[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const nonMembers = allPeople.filter((p) => !team.members.some((m) => m.id === p.id));
  const leadName = allPeople.find((p) => p.id === team.team_lead_id)?.full_name;

  function handleAssignLead(userId: string) {
    startTransition(async () => {
      await assignTeamLead(team.id, userId);
      router.refresh();
    });
  }

  function handleAddMember() {
    if (!selectedUserId) return;
    startTransition(async () => {
      await addTeamMember(team.id, selectedUserId);
      setSelectedUserId('');
      setAddMemberOpen(false);
      router.refresh();
    });
  }

  function handleRemoveMember(userId: string) {
    startTransition(async () => {
      await removeTeamMember(team.id, userId);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <h4 className="text-sm font-semibold">{team.name}</h4>
          {team.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{team.description}</p>
          )}
          {leadName && (
            <div className="mt-1 flex items-center gap-1">
              <Badge variant="secondary" className="text-[10px]">Lead</Badge>
              <span className="text-xs text-muted-foreground">{leadName}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <EditTeamDialog team={team}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </EditTeamDialog>
          <DeleteConfirmation
            title="Delete Team"
            description={`Are you sure you want to delete "${team.name}"? This will remove all team memberships.`}
            onConfirm={() => deleteTeam(team.id)}
          >
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </DeleteConfirmation>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Members */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
            </span>
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs" disabled={nonMembers.length === 0}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {nonMembers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddMember} disabled={isPending || !selectedUserId}>
                      {isPending ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
              <div>
                <span className="font-medium">{member.full_name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{member.email}</span>
              </div>
              <div className="flex items-center gap-1">
                {team.team_lead_id !== member.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Set as lead"
                    onClick={() => handleAssignLead(member.id)}
                    disabled={isPending}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  title="Remove"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamManagement({ organisationId, teams, allPeople }: TeamManagementProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Teams</h3>
        <CreateTeamDialog organisationId={organisationId}>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Team
          </Button>
        </CreateTeamDialog>
      </div>
      {teams.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No teams yet. Create one to get started.</p>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <TeamRow key={team.id} team={team} allPeople={allPeople} />
          ))}
        </div>
      )}
    </div>
  );
}
