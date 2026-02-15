import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CycleCard } from '@/components/cycles/cycle-card';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/cycles', () => ({
  setActiveCycle: vi.fn().mockResolvedValue({}),
  closeCycle: vi.fn().mockResolvedValue({}),
  carryForwardObjectives: vi.fn().mockResolvedValue([]),
}));

const activeCycle = {
  id: 'c-1',
  name: 'Q1 2026',
  start_date: '2026-01-01',
  end_date: '2026-03-31',
  is_active: true,
  organisation_id: 'org-1',
};

const pastCycle = {
  id: 'c-2',
  name: 'Q4 2025',
  start_date: '2025-10-01',
  end_date: '2025-12-31',
  is_active: false,
  organisation_id: 'org-1',
};

const stats = {
  totalObjectives: 3,
  averageScore: 0.65,
  completionRate: 33,
  onTrackCount: 4,
  atRiskCount: 2,
  offTrackCount: 1,
};

const allCycles = [
  { id: 'c-1', name: 'Q1 2026' },
  { id: 'c-2', name: 'Q4 2025' },
];

describe('CycleCard', () => {
  it('renders cycle name and date range', () => {
    render(<CycleCard cycle={activeCycle} stats={stats} allCycles={allCycles} />);
    expect(screen.getByText('Q1 2026')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows stats (objectives, avg score, completion rate)', () => {
    render(<CycleCard cycle={activeCycle} stats={stats} allCycles={allCycles} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('shows RAG breakdown', () => {
    render(<CycleCard cycle={activeCycle} stats={stats} allCycles={allCycles} />);
    expect(screen.getByText('4 on track')).toBeInTheDocument();
    expect(screen.getByText('2 at risk')).toBeInTheDocument();
    expect(screen.getByText('1 off track')).toBeInTheDocument();
  });

  it('shows Close Cycle button for active cycle', () => {
    render(<CycleCard cycle={activeCycle} stats={stats} allCycles={allCycles} />);
    expect(screen.getByText('Close Cycle')).toBeInTheDocument();
    expect(screen.queryByText('Set Active')).not.toBeInTheDocument();
  });

  it('shows Set Active and Carry Forward buttons for past cycle', () => {
    render(<CycleCard cycle={pastCycle} stats={stats} allCycles={allCycles} />);
    expect(screen.getByText('Set Active')).toBeInTheDocument();
    expect(screen.getByText('Carry Forward')).toBeInTheDocument();
    expect(screen.queryByText('Close Cycle')).not.toBeInTheDocument();
  });
});
