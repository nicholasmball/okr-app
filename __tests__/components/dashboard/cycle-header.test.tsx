import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CycleHeader } from '@/components/dashboard/cycle-header';

describe('CycleHeader', () => {
  const defaultProps = {
    cycleName: 'Q1 2026',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    averageScore: 0.65,
    objectiveCount: 5,
  };

  it('renders cycle name', () => {
    render(<CycleHeader {...defaultProps} />);
    expect(screen.getByText('Q1 2026')).toBeInTheDocument();
  });

  it('renders date range', () => {
    render(<CycleHeader {...defaultProps} />);
    expect(screen.getByText(/1 Jan 2026/)).toBeInTheDocument();
    expect(screen.getByText(/31 Mar 2026/)).toBeInTheDocument();
  });

  it('renders objective count', () => {
    render(<CycleHeader {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Objectives')).toBeInTheDocument();
  });

  it('renders score ring with percentage', () => {
    render(<CycleHeader {...defaultProps} />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('renders days remaining', () => {
    render(<CycleHeader {...defaultProps} />);
    expect(screen.getByText('Days left')).toBeInTheDocument();
  });
});
