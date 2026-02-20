'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DeleteConfirmation } from '@/components/okr/delete-confirmation';
import { updateKeyResult, deleteKeyResult } from '@/lib/actions/key-results';

interface KRData {
  id: string;
  title: string;
  description?: string | null;
  target_value: number;
  unit: string;
}

interface EditKeyResultSheetProps {
  kr: KRData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditKRForm({
  kr,
  onOpenChange,
}: {
  kr: KRData;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(kr.title);
  const [description, setDescription] = useState(kr.description ?? '');
  const [targetValue, setTargetValue] = useState(kr.target_value);
  const [unit, setUnit] = useState(kr.unit);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateKeyResult({
          id: kr.id,
          title: title.trim(),
          description: description.trim() || undefined,
          targetValue,
          unit: unit.trim() || '%',
        });
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update key result');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 px-4 pt-2">
        <div className="space-y-2">
          <Label htmlFor="edit-kr-title">Title</Label>
          <Input
            id="edit-kr-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-kr-desc">Description (optional)</Label>
          <Textarea
            id="edit-kr-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What does this key result measure?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-kr-target">Target Value</Label>
            <Input
              id="edit-kr-target"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              min={0}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-kr-unit">Unit</Label>
            <Input
              id="edit-kr-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="%"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <SheetFooter className="flex-row items-center justify-between border-t">
        <DeleteConfirmation
          title="Delete Key Result"
          description="This will permanently delete this key result and all its check-ins. The objective score will be recalculated."
          onConfirm={async () => {
            await deleteKeyResult(kr.id);
            onOpenChange(false);
          }}
        >
          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete key result</span>
          </Button>
        </DeleteConfirmation>
        <Button type="submit" disabled={isPending || !title.trim()}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </SheetFooter>
    </form>
  );
}

export function EditKeyResultSheet({ kr, open, onOpenChange }: EditKeyResultSheetProps) {
  if (!kr) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left text-base">Edit Key Result</SheetTitle>
        </SheetHeader>
        <EditKRForm key={kr.id} kr={kr} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
