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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, X, Check, Users, User, UsersRound } from 'lucide-react';
import {
  setKRAssignmentTeam,
  setKRAssignmentIndividual,
  setKRAssignmentMulti,
  unassignKeyResult,
} from '@/lib/actions/key-results';
import type { AssignmentType } from '@/types/database';
import { cn } from '@/lib/utils';

interface Person {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

interface AssigneePickerProps {
  krId: string;
  assignmentType?: AssignmentType;
  assignees?: Person[];
  people: Person[];
  teamName?: string;
  objectiveTeamId?: string | null;
}

type Mode = 'team' | 'individual' | 'multi';

function assignmentTypeToMode(at?: AssignmentType): Mode | null {
  if (at === 'team') return 'team';
  if (at === 'individual') return 'individual';
  if (at === 'multi_individual') return 'multi';
  return null;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AssigneePicker({
  krId,
  assignmentType,
  assignees = [],
  people,
  teamName,
  objectiveTeamId,
}: AssigneePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentMode = assignmentTypeToMode(assignmentType);
  const [activeMode, setActiveMode] = useState<Mode | null>(currentMode);
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [multiSelected, setMultiSelected] = useState<string[]>(
    assignmentType === 'multi_individual' ? assignees.map((a) => a.id) : []
  );

  const hasExistingAssignees = assignees.length > 0 || assignmentType === 'team';

  function handleModeSwitch(newMode: Mode) {
    if (newMode === activeMode) return;
    if (hasExistingAssignees) {
      setPendingMode(newMode);
      setShowConfirm(true);
    } else {
      applyModeSwitch(newMode);
    }
  }

  function applyModeSwitch(newMode: Mode) {
    setActiveMode(newMode);
    setMultiSelected([]);
    if (newMode === 'team') {
      startTransition(async () => {
        await setKRAssignmentTeam(krId);
        router.refresh();
      });
      setOpen(false);
    }
  }

  function confirmModeSwitch() {
    if (pendingMode) {
      applyModeSwitch(pendingMode);
    }
    setShowConfirm(false);
    setPendingMode(null);
  }

  function handleSelectIndividual(userId: string) {
    setOpen(false);
    startTransition(async () => {
      await setKRAssignmentIndividual(krId, userId);
      router.refresh();
    });
  }

  function handleUnassign() {
    setOpen(false);
    startTransition(async () => {
      await unassignKeyResult(krId);
      router.refresh();
    });
  }

  function toggleMultiPerson(userId: string) {
    setMultiSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function handleConfirmMulti() {
    setOpen(false);
    startTransition(async () => {
      if (multiSelected.length === 0) {
        await unassignKeyResult(krId);
      } else {
        await setKRAssignmentMulti(krId, multiSelected);
      }
      router.refresh();
    });
  }

  // Determine trigger display
  const triggerContent = (() => {
    if (assignmentType === 'team' && teamName) {
      return (
        <Badge variant="secondary" className="h-6 gap-1 text-[10px]">
          <Users className="h-3 w-3" />
          {teamName}
        </Badge>
      );
    }
    if (assignees.length === 1) {
      const person = assignees[0];
      return (
        <Avatar className="h-6 w-6">
          {person.avatar_url && (
            <AvatarImage src={person.avatar_url} alt={person.full_name} />
          )}
          <AvatarFallback className="text-[10px]">
            {getInitials(person.full_name)}
          </AvatarFallback>
        </Avatar>
      );
    }
    if (assignees.length > 1) {
      return (
        <div className="flex -space-x-1.5">
          {assignees.slice(0, 3).map((person) => (
            <Avatar key={person.id} className="h-6 w-6 ring-2 ring-background">
              {person.avatar_url && (
                <AvatarImage src={person.avatar_url} alt={person.full_name} />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(person.full_name)}
              </AvatarFallback>
            </Avatar>
          ))}
          {assignees.length > 3 && (
            <Avatar className="h-6 w-6 ring-2 ring-background">
              <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                +{assignees.length - 3}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      );
    }
    return <UserPlus className="h-3 w-3" />;
  })();

  const hasAssignment = assignees.length > 0 || assignmentType === 'team';
  const triggerTitle = hasAssignment
    ? assignmentType === 'team'
      ? `Assigned to ${teamName ?? 'team'}`
      : assignees.length === 1
        ? `Assigned to ${assignees[0].full_name}`
        : `Assigned to ${assignees.length} people`
    : 'Assign to someone';

  const modes: { key: Mode; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    ...(objectiveTeamId
      ? [{ key: 'team' as Mode, label: 'Team', icon: <Users className="h-3.5 w-3.5" /> }]
      : []),
    { key: 'individual' as Mode, label: 'Individual', icon: <User className="h-3.5 w-3.5" /> },
    { key: 'multi' as Mode, label: 'Multi', icon: <UsersRound className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full transition-opacity',
              isPending && 'opacity-50',
              hasAssignment
                ? 'hover:ring-2 hover:ring-primary/30'
                : 'h-6 w-6 border border-dashed border-muted-foreground/40 text-muted-foreground/40 hover:border-primary hover:text-primary'
            )}
            title={triggerTitle}
          >
            {triggerContent}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-0"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mode selector */}
          <div className="flex gap-1 border-b p-2">
            {modes.map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => handleModeSwitch(mode.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  activeMode === mode.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>

          {/* Team mode content */}
          {activeMode === 'team' && (
            <div className="p-3 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Assigned to team</p>
              {teamName && (
                <p className="text-xs text-muted-foreground">{teamName}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-muted-foreground"
                onClick={handleUnassign}
              >
                <X className="mr-1 h-3 w-3" />
                Unassign
              </Button>
            </div>
          )}

          {/* Individual mode content */}
          {activeMode === 'individual' && (
            <Command>
              <CommandInput placeholder="Search people..." />
              <CommandList>
                <CommandEmpty>No people found.</CommandEmpty>
                <CommandGroup>
                  {assignees.length > 0 && (
                    <CommandItem
                      onSelect={handleUnassign}
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
                      onSelect={() => handleSelectIndividual(person.id)}
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
                      {assignees.some((a) => a.id === person.id) && (
                        <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}

          {/* Multi mode content */}
          {activeMode === 'multi' && (
            <div>
              <Command>
                <CommandInput placeholder="Search people..." />
                <CommandList>
                  <CommandEmpty>No people found.</CommandEmpty>
                  <CommandGroup>
                    {people.map((person) => (
                      <CommandItem
                        key={person.id}
                        value={person.full_name}
                        onSelect={() => toggleMultiPerson(person.id)}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                            multiSelected.includes(person.id)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40'
                          )}
                        >
                          {multiSelected.includes(person.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <Avatar className="mr-2 h-5 w-5">
                          {person.avatar_url && (
                            <AvatarImage src={person.avatar_url} alt={person.full_name} />
                          )}
                          <AvatarFallback className="text-[8px]">
                            {getInitials(person.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 truncate text-sm">{person.full_name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="border-t p-2">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleConfirmMulti}
                  disabled={isPending}
                >
                  {multiSelected.length === 0
                    ? 'Unassign'
                    : `Assign ${multiSelected.length} ${multiSelected.length === 1 ? 'person' : 'people'}`}
                </Button>
              </div>
            </div>
          )}

          {/* No mode selected yet */}
          {activeMode === null && (
            <div className="p-3 text-center text-sm text-muted-foreground">
              Choose an assignment mode above
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Mode switch confirmation dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Change assignment mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching modes will clear the current assignees. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeSwitch}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
