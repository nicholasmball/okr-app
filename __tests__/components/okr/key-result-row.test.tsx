import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyResultRow } from '@/components/okr/key-result-row';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/lib/actions/key-results', () => ({
  setKRAssignmentTeam: vi.fn(),
  setKRAssignmentIndividual: vi.fn(),
  setKRAssignmentMulti: vi.fn(),
  unassignKeyResult: vi.fn(),
}));

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

  it('renders assignee avatar with initials via legacy assignee prop', () => {
    render(
      <KeyResultRow
        {...defaultProps}
        assignee={{ id: 'user-1', full_name: 'Jane Doe', avatar_url: null }}
      />
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders assignees from junction-based assignees prop', () => {
    render(
      <KeyResultRow
        {...defaultProps}
        assignmentType="multi_individual"
        assignees={[
          { id: 'u1', full_name: 'Alice Smith', avatar_url: null },
          { id: 'u2', full_name: 'Bob Jones', avatar_url: null },
        ]}
      />
    );
    expect(screen.getByText('AS')).toBeInTheDocument();
    expect(screen.getByText('BJ')).toBeInTheDocument();
  });

  it('renders team badge when assignment type is team', () => {
    render(
      <KeyResultRow
        {...defaultProps}
        assignmentType="team"
        teamName="Engineering"
      />
    );
    expect(screen.getByText('Engineering')).toBeInTheDocument();
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

  it('renders edit button when onEdit is provided', () => {
    const handleEdit = vi.fn();
    render(<KeyResultRow {...defaultProps} onEdit={handleEdit} />);
    expect(screen.getByRole('button', { name: 'Edit key result' })).toBeInTheDocument();
  });

  it('does not render edit button when onEdit is not provided', () => {
    render(<KeyResultRow {...defaultProps} />);
    expect(screen.queryByRole('button', { name: 'Edit key result' })).not.toBeInTheDocument();
  });

  it('calls onEdit and stops propagation when edit button is clicked', () => {
    const handleEdit = vi.fn();
    const handleClick = vi.fn();
    render(<KeyResultRow {...defaultProps} onClick={handleClick} onEdit={handleEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit key result' }));
    expect(handleEdit).toHaveBeenCalledOnce();
    expect(handleClick).not.toHaveBeenCalled();
  });
});
