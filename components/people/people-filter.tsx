'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Team {
  id: string;
  name: string;
}

interface PeopleFilterProps {
  teams: Team[];
  hasReports?: boolean;
}

export function PeopleFilter({ teams, hasReports }: PeopleFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/people?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search people..."
          defaultValue={searchParams.get('q') ?? ''}
          className="pl-9"
          onChange={(e) => updateParams('q', e.target.value)}
        />
      </div>
      {hasReports && (
        <Select
          value={searchParams.get('view') ?? 'all'}
          onValueChange={(value) => updateParams('view', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Everyone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="reports">My Reports</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Select
        value={searchParams.get('team') ?? 'all'}
        onValueChange={(value) => updateParams('team', value)}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All teams</SelectItem>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
