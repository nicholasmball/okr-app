import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateObjectiveDialog } from '@/components/okr/create-objective-dialog';

// Mock server actions
vi.mock('@/lib/actions/objectives', () => ({
  createObjective: vi.fn().mockResolvedValue({ id: 'obj-1' }),
}));
vi.mock('@/lib/actions/key-results', () => ({
  createKeyResult: vi.fn().mockResolvedValue({ id: 'kr-1' }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

const baseProps = {
  organisationId: 'org-1',
  cycleId: 'cycle-1',
  teams: [
    { id: 'team-1', name: 'Engineering' },
    { id: 'team-2', name: 'Design' },
  ],
  people: [
    { id: 'user-1', full_name: 'Alice Smith' },
    { id: 'user-2', full_name: 'Bob Jones' },
  ],
};

describe('CreateObjectiveDialog', () => {
  it('renders trigger button', () => {
    render(
      <CreateObjectiveDialog {...baseProps}>
        <button>New Objective</button>
      </CreateObjectiveDialog>
    );
    expect(screen.getByText('New Objective')).toBeInTheDocument();
  });

  it('opens dialog and shows type selector', () => {
    render(
      <CreateObjectiveDialog {...baseProps}>
        <button>New Objective</button>
      </CreateObjectiveDialog>
    );
    fireEvent.click(screen.getByText('New Objective'));
    expect(screen.getByText('Create Objective')).toBeInTheDocument();
    expect(screen.getByText('Team Objective')).toBeInTheDocument();
    expect(screen.getByText('Cross-Cutting')).toBeInTheDocument();
    expect(screen.getByText('Individual')).toBeInTheDocument();
  });

  it('navigates to details step on next', () => {
    render(
      <CreateObjectiveDialog {...baseProps}>
        <button>New Objective</button>
      </CreateObjectiveDialog>
    );
    fireEvent.click(screen.getByText('New Objective'));
    fireEvent.click(screen.getByText('Team Objective'));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('skips type step when defaultType is provided', () => {
    render(
      <CreateObjectiveDialog {...baseProps} defaultType="team">
        <button>New Objective</button>
      </CreateObjectiveDialog>
    );
    fireEvent.click(screen.getByText('New Objective'));
    // Should start on details step directly
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('shows team selector for team type on details step', () => {
    render(
      <CreateObjectiveDialog {...baseProps} defaultType="team">
        <button>New Objective</button>
      </CreateObjectiveDialog>
    );
    fireEvent.click(screen.getByText('New Objective'));
    expect(screen.getByText('Team')).toBeInTheDocument();
  });
});
