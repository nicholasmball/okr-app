import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditObjectiveDialog } from '@/components/okr/edit-objective-dialog';

vi.mock('@/lib/actions/objectives', () => ({
  updateObjective: vi.fn().mockResolvedValue({ id: 'obj-1' }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

const objective = {
  id: 'obj-1',
  title: 'Improve reliability',
  description: 'Reduce downtime',
  status: 'active' as const,
};

describe('EditObjectiveDialog', () => {
  it('renders trigger', () => {
    render(
      <EditObjectiveDialog objective={objective}>
        <button>Edit</button>
      </EditObjectiveDialog>
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('opens dialog with pre-filled fields', () => {
    render(
      <EditObjectiveDialog objective={objective}>
        <button>Edit</button>
      </EditObjectiveDialog>
    );
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Objective')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Improve reliability')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Reduce downtime')).toBeInTheDocument();
  });

  it('has Save Changes and Cancel buttons', () => {
    render(
      <EditObjectiveDialog objective={objective}>
        <button>Edit</button>
      </EditObjectiveDialog>
    );
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
