import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthSummary } from '@/components/teams/health-summary';

describe('HealthSummary', () => {
  it('calculates percentages correctly', () => {
    const objectives = [
      {
        key_results: [
          { status: 'on_track' as const },
          { status: 'on_track' as const },
          { status: 'on_track' as const },
          { status: 'at_risk' as const },
          { status: 'off_track' as const },
        ],
      },
    ];

    render(<HealthSummary objectives={objectives} />);
    expect(screen.getByText('Team Health')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument(); // on_track: 3/5
    expect(screen.getAllByText('20%')).toHaveLength(2); // at_risk and off_track both 1/5
  });

  it('returns null when no KRs', () => {
    const { container } = render(<HealthSummary objectives={[{ key_results: [] }]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders counts in parentheses', () => {
    const objectives = [
      {
        key_results: [
          { status: 'on_track' as const },
          { status: 'on_track' as const },
          { status: 'on_track' as const },
        ],
      },
    ];

    render(<HealthSummary objectives={objectives} />);
    expect(screen.getByText('(3)')).toBeInTheDocument();
  });
});
