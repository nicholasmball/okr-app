import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckInTimeline } from '@/components/people/check-in-timeline';

describe('CheckInTimeline', () => {
  const checkIns = [
    {
      id: 'ci-1',
      value: 75,
      status: 'on_track' as const,
      comment: 'Good progress this week',
      created_at: '2026-02-10T10:00:00Z',
      author: { full_name: 'Jane Doe' },
    },
    {
      id: 'ci-2',
      value: 50,
      status: 'at_risk' as const,
      comment: null,
      created_at: '2026-02-03T10:00:00Z',
      author: { full_name: 'John Smith' },
    },
  ];

  it('renders check-in values with target', () => {
    render(<CheckInTimeline checkIns={checkIns} unit="%" targetValue={100} />);
    expect(screen.getByText('75 / 100 %')).toBeInTheDocument();
    expect(screen.getByText('50 / 100 %')).toBeInTheDocument();
  });

  it('renders comments when provided', () => {
    render(<CheckInTimeline checkIns={checkIns} unit="%" targetValue={100} />);
    expect(screen.getByText('Good progress this week')).toBeInTheDocument();
  });

  it('renders author names', () => {
    render(<CheckInTimeline checkIns={checkIns} unit="%" targetValue={100} />);
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
  });

  it('renders status badges', () => {
    render(<CheckInTimeline checkIns={checkIns} unit="%" targetValue={100} />);
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });

  it('renders empty message when no check-ins', () => {
    render(<CheckInTimeline checkIns={[]} unit="%" targetValue={100} />);
    expect(screen.getByText('No check-ins recorded yet.')).toBeInTheDocument();
  });
});
