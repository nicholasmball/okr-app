import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObjectiveCard } from '@/components/okr/objective-card';

describe('ObjectiveCard', () => {
  it('renders objective title and type', () => {
    render(<ObjectiveCard title="Ship v2" type="team" score={0.6} />);
    expect(screen.getByText('Ship v2')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('renders cross-cutting type label', () => {
    render(<ObjectiveCard title="Improve NPS" type="cross_cutting" score={0.4} />);
    expect(screen.getByText('Cross-Cutting')).toBeInTheDocument();
  });

  it('renders individual type label', () => {
    render(<ObjectiveCard title="Learn Rust" type="individual" score={0.2} />);
    expect(screen.getByText('Individual')).toBeInTheDocument();
  });

  it('displays team name when provided', () => {
    render(<ObjectiveCard title="Ship v2" type="team" score={0.5} teamName="Engineering" />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('displays KR count when provided', () => {
    render(<ObjectiveCard title="Ship v2" type="team" score={0.5} krCount={3} />);
    expect(screen.getByText('3 Key Results')).toBeInTheDocument();
  });

  it('uses singular "Key Result" for count of 1', () => {
    render(<ObjectiveCard title="Ship v2" type="team" score={0.5} krCount={1} />);
    expect(screen.getByText('1 Key Result')).toBeInTheDocument();
  });

  it('renders status badge when status is provided', () => {
    render(<ObjectiveCard title="Ship v2" type="team" score={0.5} status="on_track" />);
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ObjectiveCard title="Ship v2" type="team" score={0.5} onClick={handleClick} />);
    fireEvent.click(screen.getByText('Ship v2'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders children instead of KR count', () => {
    render(
      <ObjectiveCard title="Ship v2" type="team" score={0.5} krCount={3}>
        <p>Custom content</p>
      </ObjectiveCard>
    );
    expect(screen.getByText('Custom content')).toBeInTheDocument();
    expect(screen.queryByText('3 Key Results')).not.toBeInTheDocument();
  });
});
