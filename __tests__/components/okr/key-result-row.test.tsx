import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyResultRow } from '@/components/okr/key-result-row';

describe('KeyResultRow', () => {
  const defaultProps = {
    title: 'Reduce incidents to < 5/month',
    currentValue: 75,
    targetValue: 100,
    unit: '%',
    score: 0.75,
    status: 'on_track' as const,
  };

  it('renders title and progress values', () => {
    render(<KeyResultRow {...defaultProps} />);
    expect(screen.getByText('Reduce incidents to < 5/month')).toBeInTheDocument();
    expect(screen.getByText('75 / 100 %')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<KeyResultRow {...defaultProps} />);
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('renders assignee avatar with initials', () => {
    render(
      <KeyResultRow
        {...defaultProps}
        assignee={{ full_name: 'Jane Doe', avatar_url: null }}
      />
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<KeyResultRow {...defaultProps} onClick={handleClick} />);
    fireEvent.click(screen.getByText(defaultProps.title));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders without assignee', () => {
    render(<KeyResultRow {...defaultProps} assignee={null} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });
});
