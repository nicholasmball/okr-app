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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateKeyResult } from '@/lib/actions/key-results';

interface Person {
  id: string;
  full_name: string;
}

interface EditKRDialogProps {
  kr: {
    id: string;
    title: string;
    target_value: number;
    unit: string;
    assignee_id: string | null;
  };
  people: Person[];
  children: React.ReactNode;
}

export function EditKRDialog({ kr, people, children }: EditKRDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(kr.title);
  const [targetValue, setTargetValue] = useState(kr.target_value);
  const [unit, setUnit] = useState(kr.unit);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateKeyResult({
          id: kr.id,
          title: title.trim(),
          targetValue,
          unit,
        });
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update key result');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Key Result</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kr-edit-title">Title</Label>
            <Input
              id="kr-edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="kr-edit-target">Target</Label>
              <Input
                id="kr-edit-target"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kr-edit-unit">Unit</Label>
              <Input
                id="kr-edit-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
