import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreRing } from '@/components/okr/score-ring';

describe('ScoreRing', () => {
  it('displays score as percentage text', () => {
    render(<ScoreRing score={0.75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders SVG with correct size', () => {
    const { container } = render(<ScoreRing score={0.5} size={64} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('renders two circles (background and progress)', () => {
    const { container } = render(<ScoreRing score={0.5} />);
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
  });

  it('caps display at 100% for scores above 1', () => {
    render(<ScoreRing score={1.2} />);
    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('shows 0% for zero score', () => {
    render(<ScoreRing score={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
