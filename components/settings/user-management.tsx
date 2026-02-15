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
import { updateUserRole } from '@/lib/actions/profiles';
import type { UserRole } from '@/types/database';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
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

function UserRow({ user, currentUserId }: { user: User; currentUserId: string }) {
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

  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <div>
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
              <UserRow key={user.id} user={user} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
