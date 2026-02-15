import type { KRStatus } from '@/types/database';

// =============================================================================
// RAG Thresholds
// =============================================================================
// Green (On Track):  score >= 0.7
// Amber (At Risk):   score >= 0.3
// Red (Off Track):   score < 0.3
// =============================================================================

export type RAGStatus = 'on_track' | 'at_risk' | 'off_track';

/** Determine RAG status from a 0.0–1.0 score */
export function scoreToRAG(score: number): RAGStatus {
  if (score >= 0.7) return 'on_track';
  if (score >= 0.3) return 'at_risk';
  return 'off_track';
}

/** Calculate KR score: current / target, capped at 1.0 */
export function calculateKRScore(currentValue: number, targetValue: number): number {
  if (targetValue <= 0) return 0;
  return Math.round(Math.min(currentValue / targetValue, 1) * 100) / 100;
}

/** Calculate objective score: average of KR scores */
export function calculateObjectiveScore(krScores: number[]): number {
  if (krScores.length === 0) return 0;
  const avg = krScores.reduce((sum, s) => sum + s, 0) / krScores.length;
  return Math.round(avg * 100) / 100;
}

/** Derive RAG status from a list of KR statuses (worst wins) */
export function deriveObjectiveRAG(krStatuses: KRStatus[]): KRStatus {
  if (krStatuses.length === 0) return 'on_track';
  if (krStatuses.some((s) => s === 'off_track')) return 'off_track';
  if (krStatuses.some((s) => s === 'at_risk')) return 'at_risk';
  return 'on_track';
}

/** Count RAG distribution from a list of statuses */
export function countRAGDistribution(statuses: KRStatus[]) {
  const onTrack = statuses.filter((s) => s === 'on_track').length;
  const atRisk = statuses.filter((s) => s === 'at_risk').length;
  const offTrack = statuses.filter((s) => s === 'off_track').length;
  const total = statuses.length;

  return {
    onTrack,
    atRisk,
    offTrack,
    total,
    pctOnTrack: total > 0 ? Math.round((onTrack / total) * 100) : 0,
    pctAtRisk: total > 0 ? Math.round((atRisk / total) * 100) : 0,
    pctOffTrack: total > 0 ? Math.round((offTrack / total) * 100) : 0,
  };
}
