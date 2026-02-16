'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { Slider } from '@/components/ui/slider';
import { ProgressBar } from '@/components/okr/progress-bar';
import { ScoreBadge } from '@/components/okr/score-badge';
import { CheckInTimeline } from '@/components/people/check-in-timeline';
import { createCheckIn } from '@/lib/actions/check-ins';
import type { KRStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface CheckIn {
  id: string;
  value: number;
  status: KRStatus;
  comment: string | null;
  created_at: string;
  author: { full_name: string } | null;
}

interface KRData {
  id: string;
  title: string;
  score: number;
  status: KRStatus;
  current_value: number;
  target_value: number;
  unit: string;
}

interface CheckInSheetProps {
  kr: KRData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

const statusOptions: { value: KRStatus; label: string; className: string }[] = [
  {
    value: 'on_track',
    label: 'On Track',
    className: 'border-status-on-track/50 bg-status-on-track/10 text-status-on-track hover:bg-status-on-track/20',
  },
  {
    value: 'at_risk',
    label: 'At Risk',
    className: 'border-status-at-risk/50 bg-status-at-risk/10 text-status-at-risk hover:bg-status-at-risk/20',
  },
  {
    value: 'off_track',
    label: 'Off Track',
    className: 'border-status-off-track/50 bg-status-off-track/10 text-status-off-track hover:bg-status-off-track/20',
  },
];

export function CheckInSheet({ kr, open, onOpenChange, currentUserId }: CheckInSheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form state
  const [value, setValue] = useState(0);
  const [status, setStatus] = useState<KRStatus>('on_track');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form when KR changes
  useEffect(() => {
    if (kr && open) {
      setValue(kr.current_value);
      setStatus(kr.status);
      setComment('');
      setError(null);

      // Fetch check-in history
      setLoadingHistory(true);
      fetch(`/api/check-ins?krId=${kr.id}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setCheckIns(data))
        .catch(() => setCheckIns([]))
        .finally(() => setLoadingHistory(false));
    }
  }, [kr, open]);

  if (!kr) return null;

  const percentage = kr.target_value > 0 ? Math.round((value / kr.target_value) * 100) : 0;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await createCheckIn({
          keyResultId: kr!.id,
          authorId: currentUserId,
          value,
          status,
          comment: comment.trim() || undefined,
        });
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create check-in');
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left text-base">Check In</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 px-4 pt-2">
          {/* KR info */}
          <div>
            <p className="text-sm font-medium">{kr.title}</p>
            <div className="mt-2 flex items-center gap-3">
              <ProgressBar value={value} max={kr.target_value} className="flex-1" />
              <ScoreBadge score={kr.target_value > 0 ? Math.min(value / kr.target_value, 1) : 0} />
            </div>
          </div>

          {/* Progress input */}
          <div className="space-y-3">
            <Label>Progress</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[value]}
                onValueChange={([v]) => setValue(v)}
                max={kr.target_value}
                step={kr.target_value <= 10 ? 0.1 : 1}
                className="flex-1"
              />
              <div className="flex shrink-0 items-center gap-1">
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-20 text-right"
                  min={0}
                  max={kr.target_value * 2}
                  step={kr.target_value <= 10 ? 0.1 : 1}
                />
                <span className="text-xs text-muted-foreground">/ {kr.target_value} {kr.unit}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{percentage}% complete</p>
          </div>

          {/* RAG Status selector */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                    status === opt.value
                      ? opt.className
                      : 'border-border bg-background text-muted-foreground hover:border-border/80'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="checkin-comment">Comment (optional)</Label>
            <Textarea
              id="checkin-comment"
              placeholder="What happened since the last check-in?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* History */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Check-in History
            </h3>
            {loadingHistory ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Loading...</p>
            ) : (
              <CheckInTimeline
                checkIns={checkIns}
                unit={kr.unit}
                targetValue={kr.target_value}
              />
            )}
          </div>
        </div>

        <SheetFooter className="border-t">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Saving...' : 'Save Check-in'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
