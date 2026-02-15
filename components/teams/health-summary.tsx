import { cn } from '@/lib/utils';
import type { KRStatus } from '@/types/database';

interface HealthSummaryProps {
  objectives: Array<{
    key_results: Array<{ status: KRStatus }>;
  }>;
}

export function HealthSummary({ objectives }: HealthSummaryProps) {
  const allKRs = objectives.flatMap((o) => o.key_results);
  const total = allKRs.length;

  if (total === 0) return null;

  const onTrack = allKRs.filter((kr) => kr.status === 'on_track').length;
  const atRisk = allKRs.filter((kr) => kr.status === 'at_risk').length;
  const offTrack = allKRs.filter((kr) => kr.status === 'off_track').length;

  const pctOnTrack = Math.round((onTrack / total) * 100);
  const pctAtRisk = Math.round((atRisk / total) * 100);
  const pctOffTrack = Math.round((offTrack / total) * 100);

  const items = [
    { label: 'On Track', count: onTrack, pct: pctOnTrack, color: 'bg-status-on-track' },
    { label: 'At Risk', count: atRisk, pct: pctAtRisk, color: 'bg-status-at-risk' },
    { label: 'Off Track', count: offTrack, pct: pctOffTrack, color: 'bg-status-off-track' },
  ];

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Team Health
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
