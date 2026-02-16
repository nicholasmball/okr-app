'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, X, Check } from 'lucide-react';
import { assignKeyResult } from '@/lib/actions/key-results';
import { cn } from '@/lib/utils';

interface Person {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface AssigneePickerProps {
  krId: string;
  assignee?: Person | null;
  people: Person[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AssigneePicker({ krId, assignee, people }: AssigneePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSelect(userId: string | null) {
    setOpen(false);
    startTransition(async () => {
      await assignKeyResult(krId, userId);
      router.refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full transition-opacity',
            isPending && 'opacity-50',
            assignee
              ? 'h-6 w-6 hover:ring-2 hover:ring-primary/30'
              : 'h-6 w-6 border border-dashed border-muted-foreground/40 text-muted-foreground/40 hover:border-primary hover:text-primary'
          )}
          title={assignee ? `Assigned to ${assignee.full_name}` : 'Assign to someone'}
        >
          {assignee ? (
            <Avatar className="h-6 w-6">
              {assignee.avatar_url && (
                <AvatarImage src={assignee.avatar_url} alt={assignee.full_name} />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(assignee.full_name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <UserPlus className="h-3 w-3" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Search people..." />
          <CommandList>
            <CommandEmpty>No people found.</CommandEmpty>
            <CommandGroup>
              {assignee && (
                <CommandItem
                  onSelect={() => handleSelect(null)}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-3.5 w-3.5" />
                  Unassign
                </CommandItem>
              )}
              {people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.full_name}
                  onSelect={() => handleSelect(person.id)}
                >
                  <Avatar className="mr-2 h-5 w-5">
                    {person.avatar_url && (
                      <AvatarImage src={person.avatar_url} alt={person.full_name} />
                    )}
                    <AvatarFallback className="text-[8px]">
                      {getInitials(person.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-sm">{person.full_name}</span>
                  {assignee?.id === person.id && (
                    <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
