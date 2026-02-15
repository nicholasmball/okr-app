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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { carryForwardObjectives } from '@/lib/actions/cycles';

interface CarryForwardDialogProps {
  fromCycleId: string;
  fromCycleName: string;
  availableCycles: { id: string; name: string }[];
  children: React.ReactNode;
}

export function CarryForwardDialog({
  fromCycleId,
  fromCycleName,
  availableCycles,
  children,
}: CarryForwardDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [targetCycleId, setTargetCycleId] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const targets = availableCycles.filter((c) => c.id !== fromCycleId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const carried = await carryForwardObjectives(fromCycleId, targetCycleId);
        setResult(`${carried.length} objective${carried.length !== 1 ? 's' : ''} carried forward.`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to carry forward objectives');
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setResult(null);
          setError(null);
          setTargetCycleId('');
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Carry Forward Objectives</DialogTitle>
        </DialogHeader>
        {result ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{result}</p>
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy all incomplete objectives (draft and active) from{' '}
              <span className="font-medium text-foreground">{fromCycleName}</span> to another cycle.
              Key results will be carried over with progress reset to zero.
            </p>
            <div className="space-y-2">
              <Label>Target Cycle</Label>
              {targets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No other cycles available. Create a new cycle first.
                </p>
              ) : (
                <Select value={targetCycleId} onValueChange={setTargetCycleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {targets.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !targetCycleId || targets.length === 0}>
                {isPending ? 'Carrying forward...' : 'Carry Forward'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
