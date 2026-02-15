'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Team {
  id: string;
  name: string;
}

interface TeamSelectorProps {
  teams: Team[];
  currentTeamId: string;
}

export function TeamSelector({ teams, currentTeamId }: TeamSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(teamId: string) {
    const basePath = pathname.split('/').slice(0, 2).join('/');
    router.push(`${basePath}/${teamId}`);
  }

  return (
    <Select value={currentTeamId} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            {team.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
