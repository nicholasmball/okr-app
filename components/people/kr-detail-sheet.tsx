'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScoreBadge } from '@/components/okr/score-badge';
import { StatusBadge } from '@/components/okr/status-badge';
import { ProgressBar } from '@/components/okr/progress-bar';
import { CheckInTimeline } from '@/components/people/check-in-timeline';
import type { KRStatus } from '@/types/database';

interface CheckIn {
  id: string;
  value: number;
  status: KRStatus;
  comment: string | null;
  created_at: string;
  author: { full_name: string } | null;
}

interface KRDetail {
  id: string;
  title: string;
  score: number;
  status: KRStatus;
  current_value: number;
  target_value: number;
  unit: string;
}

interface KRDetailSheetProps {
  kr: KRDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KRDetailSheet({ kr, open, onOpenChange }: KRDetailSheetProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!kr || !open) {
      setCheckIns([]);
      return;
    }

    setLoading(true);
    fetch(`/api/check-ins?krId=${kr.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCheckIns(data))
      .catch(() => setCheckIns([]))
      .finally(() => setLoading(false));
  }, [kr, open]);

  if (!kr) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left text-base">{kr.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <ProgressBar value={kr.current_value} max={kr.target_value} className="flex-1" />
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {kr.current_value} / {kr.target_value} {kr.unit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ScoreBadge score={kr.score} />
            <StatusBadge status={kr.status} />
          </div>
          <div className="border-t pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Check-in History
            </h3>
            {loading ? (
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
      </SheetContent>
    </Sheet>
  );
}
