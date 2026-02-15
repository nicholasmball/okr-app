'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, User, Globe, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { createObjective } from '@/lib/actions/objectives';
import { createKeyResult } from '@/lib/actions/key-results';
import type { ObjectiveType } from '@/types/database';
import { cn } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
}

interface Person {
  id: string;
  full_name: string;
}

interface KRDraft {
  tempId: string;
  title: string;
  targetValue: number;
  unit: string;
  assigneeId: string;
}

interface CreateObjectiveDialogProps {
  organisationId: string;
  cycleId: string;
  teams: Team[];
  people: Person[];
  children: React.ReactNode;
  defaultType?: ObjectiveType;
  defaultTeamId?: string;
}

const typeConfig = {
  team: {
    icon: Users,
    label: 'Team Objective',
    description: 'Shared objective for a specific team',
  },
  cross_cutting: {
    icon: Globe,
    label: 'Cross-Cutting',
    description: 'Organisation-wide, assigned across teams',
  },
  individual: {
    icon: User,
    label: 'Individual',
    description: 'Personal objective for one person',
  },
} as const;

type Step = 'type' | 'details' | 'krs' | 'review';
const steps: Step[] = ['type', 'details', 'krs', 'review'];

export function CreateObjectiveDialog({
  organisationId,
  cycleId,
  teams,
  people,
  children,
  defaultType,
  defaultTeamId,
}: CreateObjectiveDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [step, setStep] = useState<Step>(defaultType ? 'details' : 'type');
  const [type, setType] = useState<ObjectiveType>(defaultType ?? 'team');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(defaultTeamId ?? '');
  const [ownerId, setOwnerId] = useState('');
  const [keyResults, setKeyResults] = useState<KRDraft[]>([]);

  // KR form
  const [krTitle, setKrTitle] = useState('');
  const [krTarget, setKrTarget] = useState(100);
  const [krUnit, setKrUnit] = useState('%');
  const [krAssignee, setKrAssignee] = useState('');

  function reset() {
    setStep(defaultType ? 'details' : 'type');
    setType(defaultType ?? 'team');
    setTitle('');
    setDescription('');
    setTeamId(defaultTeamId ?? '');
    setOwnerId('');
    setKeyResults([]);
    setKrTitle('');
    setKrTarget(100);
    setKrUnit('%');
    setKrAssignee('');
    setError(null);
  }

  function addKR() {
    if (!krTitle.trim()) return;
    setKeyResults((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        title: krTitle.trim(),
        targetValue: krTarget,
        unit: krUnit,
        assigneeId: krAssignee,
      },
    ]);
    setKrTitle('');
    setKrTarget(100);
    setKrUnit('%');
    setKrAssignee('');
  }

  function removeKR(tempId: string) {
    setKeyResults((prev) => prev.filter((kr) => kr.tempId !== tempId));
  }

  const stepIndex = steps.indexOf(step);
  const canGoNext = (() => {
    switch (step) {
      case 'type':
        return true;
      case 'details':
        if (!title.trim()) return false;
        if (type === 'team' && !teamId) return false;
        if (type === 'individual' && !ownerId) return false;
        return true;
      case 'krs':
        return true; // KRs are optional at creation time
      case 'review':
        return true;
      default:
        return false;
    }
  })();

  function goNext() {
    if (step === 'review') return handleSubmit();
    const nextStep = steps[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  }

  function goBack() {
    const prevStep = steps[stepIndex - 1];
    if (prevStep) setStep(prevStep);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const obj = await createObjective({
          organisationId,
          cycleId,
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          teamId: type === 'team' ? teamId : undefined,
          ownerId: type === 'individual' ? ownerId : undefined,
        });

        // Create KRs
        for (const kr of keyResults) {
          await createKeyResult({
            objectiveId: obj.id,
            title: kr.title,
            targetValue: kr.targetValue,
            unit: kr.unit,
            assigneeId: kr.assigneeId || undefined,
          });
        }

        setOpen(false);
        reset();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create objective');
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Objective</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  i <= stepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'h-px w-6',
                    i < stepIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step: Type Selection */}
        {step === 'type' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">What type of objective?</p>
            {(Object.keys(typeConfig) as ObjectiveType[]).map((t) => {
              const config = typeConfig[t];
              const Icon = config.icon;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    type === t
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="obj-title">Title</Label>
              <Input
                id="obj-title"
                placeholder="e.g. Improve customer satisfaction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obj-desc">Description (optional)</Label>
              <Textarea
                id="obj-desc"
                placeholder="What does success look like?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            {type === 'team' && (
              <div className="space-y-2">
                <Label>Team</Label>
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger>
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
              </div>
            )}
            {type === 'individual' && (
              <div className="space-y-2">
                <Label>Owner</Label>
                <Select value={ownerId} onValueChange={setOwnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step: Key Results */}
        {step === 'krs' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add key results to measure progress. You can also add them later.
            </p>

            {keyResults.length > 0 && (
              <div className="space-y-2">
                {keyResults.map((kr) => (
                  <div
                    key={kr.tempId}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{kr.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {kr.targetValue} {kr.unit}
                        {kr.assigneeId &&
                          ` · ${people.find((p) => p.id === kr.assigneeId)?.full_name ?? 'Unassigned'}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeKR(kr.tempId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 rounded-md border bg-muted/30 p-3">
              <div className="space-y-2">
                <Label htmlFor="kr-title">KR Title</Label>
                <Input
                  id="kr-title"
                  placeholder="e.g. Increase NPS from 30 to 50"
                  value={krTitle}
                  onChange={(e) => setKrTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKR();
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="kr-target">Target</Label>
                  <Input
                    id="kr-target"
                    type="number"
                    value={krTarget}
                    onChange={(e) => setKrTarget(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kr-unit">Unit</Label>
                  <Input
                    id="kr-unit"
                    placeholder="%"
                    value={krUnit}
                    onChange={(e) => setKrUnit(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assignee (optional)</Label>
                <Select value={krAssignee} onValueChange={setKrAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addKR}
                disabled={!krTitle.trim()}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add KR
              </Button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {typeConfig[type].label}
              </Badge>
              <h3 className="text-sm font-semibold">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
              {type === 'team' && teamId && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Team: {teams.find((t) => t.id === teamId)?.name}
                </p>
              )}
              {type === 'individual' && ownerId && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Owner: {people.find((p) => p.id === ownerId)?.full_name}
                </p>
              )}
            </div>

            {keyResults.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Results ({keyResults.length})
                </p>
                <div className="space-y-1.5">
                  {keyResults.map((kr, i) => (
                    <div key={kr.tempId} className="rounded-md border px-3 py-2">
                      <p className="text-sm">
                        {i + 1}. {kr.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Target: {kr.targetValue} {kr.unit}
                        {kr.assigneeId &&
                          ` · ${people.find((p) => p.id === kr.assigneeId)?.full_name}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {keyResults.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No key results added yet. You can add them after creating the objective.
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            disabled={stepIndex === 0 || isPending}
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={goNext}
            disabled={!canGoNext || isPending}
          >
            {step === 'review' ? (
              <>
                <Check className="mr-1 h-3.5 w-3.5" />
                {isPending ? 'Creating...' : 'Create Objective'}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
