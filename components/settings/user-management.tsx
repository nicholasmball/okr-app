'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUserRole, setManager } from '@/lib/actions/profiles';
import type { UserRole } from '@/types/database';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  manager_id: string | null;
}

interface UserManagementProps {
  users: User[];
  currentUserId: string;
}

const roleBadgeClasses: Record<UserRole, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  team_lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-muted text-muted-foreground',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  team_lead: 'Team Lead',
  member: 'Member',
};

function UserRow({
  user,
  currentUserId,
  allUsers,
}: {
  user: User;
  currentUserId: string;
  allUsers: User[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isCurrentUser = user.id === currentUserId;

  function handleRoleChange(newRole: string) {
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRole({ userId: user.id, role: newRole as UserRole });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
      }
    });
  }

  function handleManagerChange(value: string) {
    setError(null);
    startTransition(async () => {
      try {
        await setManager({ userId: user.id, managerId: value === 'none' ? null : value });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update manager');
      }
    });
  }

  // Possible managers: everyone except this user
  const possibleManagers = allUsers.filter((u) => u.id !== user.id);

  return (
    <div className="flex items-center gap-3 rounded-md border px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user.full_name}</span>
          {isCurrentUser && (
            <Badge variant="outline" className="text-[10px]">You</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{user.email}</span>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <Select
        value={user.manager_id ?? 'none'}
        onValueChange={handleManagerChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="No manager">
            {user.manager_id
              ? possibleManagers.find((u) => u.id === user.manager_id)?.full_name ?? 'Unknown'
              : 'No manager'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No manager</SelectItem>
          {possibleManagers.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={user.role}
        onValueChange={handleRoleChange}
        disabled={isPending || isCurrentUser}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue>
            <Badge variant="outline" className={roleBadgeClasses[user.role]}>
              {roleLabels[user.role]}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="team_lead">Team Lead</SelectItem>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function UserManagement({ users, currentUserId }: UserManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Users</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No users in this organisation.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <UserRow key={user.id} user={user} currentUserId={currentUserId} allUsers={users} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
