import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/okr/progress-bar';

describe('ProgressBar', () => {
  it('renders with correct width percentage', () => {
    const { container } = render(<ProgressBar value={0.5} />);
    const bar = container.querySelector('[style]');
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('renders with custom max value', () => {
    const { container } = render(<ProgressBar value={75} max={100} />);
    const bar = container.querySelector('[style]');
    expect(bar).toHaveStyle({ width: '75%' });
  });

  it('caps at 100% when value exceeds max', () => {
    const { container } = render(<ProgressBar value={120} max={100} />);
    const bar = container.querySelector('[style]');
    expect(bar).toHaveStyle({ width: '100%' });
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={0.75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    render(<ProgressBar value={0.75} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('handles zero max gracefully', () => {
    const { container } = render(<ProgressBar value={50} max={0} />);
    const bar = container.querySelector('[style]');
    expect(bar).toHaveStyle({ width: '0%' });
  });
});
