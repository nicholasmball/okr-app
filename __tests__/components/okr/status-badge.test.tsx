import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/okr/status-badge';

describe('StatusBadge', () => {
  it('renders "On Track" for on_track status', () => {
    render(<StatusBadge status="on_track" />);
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('renders "At Risk" for at_risk status', () => {
    render(<StatusBadge status="at_risk" />);
    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });

  it('renders "Off Track" for off_track status', () => {
    render(<StatusBadge status="off_track" />);
    expect(screen.getByText('Off Track')).toBeInTheDocument();
  });
});
