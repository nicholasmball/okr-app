import { cn } from '@/lib/utils';
import { countRAGDistribution } from '@/lib/scoring';
import type { KRStatus } from '@/types/database';

interface HealthSummaryProps {
  objectives: Array<{
    score: number;
    key_results: Array<{ status: KRStatus }>;
  }>;
  title?: string;
}

export function HealthSummary({ objectives, title = 'Team Health' }: HealthSummaryProps) {
  const allKRs = objectives.flatMap((o) => o.key_results);
  const dist = countRAGDistribution(allKRs.map((kr) => kr.status));

  if (dist.total === 0) return null;

  const avgObjScore = objectives.length > 0
    ? objectives.reduce((sum, o) => sum + Number(o.score), 0) / objectives.length
    : 0;

  const items = [
    { label: 'On Track', count: dist.onTrack, pct: dist.pctOnTrack, color: 'bg-status-on-track' },
    { label: 'At Risk', count: dist.atRisk, pct: dist.pctAtRisk, color: 'bg-status-at-risk' },
    { label: 'Off Track', count: dist.offTrack, pct: dist.pctOffTrack, color: 'bg-status-off-track' },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-muted">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn('transition-all', item.color)}
            style={{ width: `${item.pct}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="flex items-center gap-1.5">
              <div className={cn('h-2 w-2 rounded-full', item.color)} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">
              {item.pct}%{' '}
              <span className="font-normal text-muted-foreground">({item.count})</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
