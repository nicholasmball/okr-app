import { describe, it, expect } from 'vitest';
import {
  scoreToRAG,
  calculateKRScore,
  calculateObjectiveScore,
  deriveObjectiveRAG,
  countRAGDistribution,
} from '@/lib/scoring';

describe('scoreToRAG', () => {
  it('returns on_track for scores >= 0.7', () => {
    expect(scoreToRAG(0.7)).toBe('on_track');
    expect(scoreToRAG(0.85)).toBe('on_track');
    expect(scoreToRAG(1)).toBe('on_track');
  });

  it('returns at_risk for scores >= 0.3 and < 0.7', () => {
    expect(scoreToRAG(0.3)).toBe('at_risk');
    expect(scoreToRAG(0.5)).toBe('at_risk');
    expect(scoreToRAG(0.69)).toBe('at_risk');
  });

  it('returns off_track for scores < 0.3', () => {
    expect(scoreToRAG(0)).toBe('off_track');
    expect(scoreToRAG(0.1)).toBe('off_track');
    expect(scoreToRAG(0.29)).toBe('off_track');
  });
});

describe('calculateKRScore', () => {
  it('returns ratio of current to target capped at 1.0', () => {
    expect(calculateKRScore(50, 100)).toBe(0.5);
    expect(calculateKRScore(100, 100)).toBe(1);
    expect(calculateKRScore(150, 100)).toBe(1);
  });

  it('returns 0 for zero or negative target', () => {
    expect(calculateKRScore(50, 0)).toBe(0);
    expect(calculateKRScore(50, -10)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateKRScore(1, 3)).toBe(0.33);
    expect(calculateKRScore(2, 3)).toBe(0.67);
  });
});

describe('calculateObjectiveScore', () => {
  it('returns average of KR scores', () => {
    expect(calculateObjectiveScore([0.5, 1.0])).toBe(0.75);
    expect(calculateObjectiveScore([0.8])).toBe(0.8);
  });

  it('returns 0 for empty array', () => {
    expect(calculateObjectiveScore([])).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateObjectiveScore([0.33, 0.33, 0.34])).toBe(0.33);
  });
});

describe('deriveObjectiveRAG', () => {
  it('returns off_track if any KR is off_track', () => {
    expect(deriveObjectiveRAG(['on_track', 'off_track', 'at_risk'])).toBe('off_track');
  });

  it('returns at_risk if any KR is at_risk and none off_track', () => {
    expect(deriveObjectiveRAG(['on_track', 'at_risk'])).toBe('at_risk');
  });

  it('returns on_track if all KRs are on_track', () => {
    expect(deriveObjectiveRAG(['on_track', 'on_track'])).toBe('on_track');
  });

  it('returns on_track for empty array', () => {
    expect(deriveObjectiveRAG([])).toBe('on_track');
  });
});

describe('countRAGDistribution', () => {
  it('counts each status correctly', () => {
    const result = countRAGDistribution(['on_track', 'on_track', 'at_risk', 'off_track']);
    expect(result.onTrack).toBe(2);
    expect(result.atRisk).toBe(1);
    expect(result.offTrack).toBe(1);
    expect(result.total).toBe(4);
  });

  it('calculates percentages', () => {
    const result = countRAGDistribution(['on_track', 'on_track', 'at_risk', 'off_track']);
    expect(result.pctOnTrack).toBe(50);
    expect(result.pctAtRisk).toBe(25);
    expect(result.pctOffTrack).toBe(25);
  });

  it('returns zeros for empty array', () => {
    const result = countRAGDistribution([]);
    expect(result.total).toBe(0);
    expect(result.pctOnTrack).toBe(0);
    expect(result.pctAtRisk).toBe(0);
    expect(result.pctOffTrack).toBe(0);
  });
});
