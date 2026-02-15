import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from '@/components/okr/score-badge';

describe('ScoreBadge', () => {
  it('displays score as decimal by default', () => {
    render(<ScoreBadge score={0.75} />);
    expect(screen.getByText('0.75')).toBeInTheDocument();
  });

  it('displays score as percentage when showPercentage is true', () => {
    render(<ScoreBadge score={0.75} showPercentage />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies green colour class for high scores (>= 0.7)', () => {
    const { container } = render(<ScoreBadge score={0.85} />);
    expect(container.firstChild).toHaveClass('bg-status-on-track-muted');
    expect(container.firstChild).toHaveClass('text-status-on-track');
  });

  it('applies amber colour class for medium scores (0.3 - 0.7)', () => {
    const { container } = render(<ScoreBadge score={0.5} />);
    expect(container.firstChild).toHaveClass('bg-status-at-risk-muted');
    expect(container.firstChild).toHaveClass('text-status-at-risk');
  });

  it('applies red colour class for low scores (< 0.3)', () => {
    const { container } = render(<ScoreBadge score={0.1} />);
    expect(container.firstChild).toHaveClass('bg-status-off-track-muted');
    expect(container.firstChild).toHaveClass('text-status-off-track');
  });

  it('handles zero score', () => {
    render(<ScoreBadge score={0} />);
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });
});
