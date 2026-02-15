import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmation } from '@/components/okr/delete-confirmation';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

describe('DeleteConfirmation', () => {
  it('renders trigger button', () => {
    render(
      <DeleteConfirmation
        title="Delete Objective?"
        description="This cannot be undone."
        onConfirm={async () => {}}
      >
        <button>Delete</button>
      </DeleteConfirmation>
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('opens alert dialog with title and description', () => {
    render(
      <DeleteConfirmation
        title="Delete Objective?"
        description="This action cannot be undone."
        onConfirm={async () => {}}
      >
        <button>Delete</button>
      </DeleteConfirmation>
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Delete Objective?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('shows Cancel and Delete buttons in dialog', () => {
    render(
      <DeleteConfirmation
        title="Delete?"
        description="Are you sure?"
        onConfirm={async () => {}}
      >
        <button>Delete</button>
      </DeleteConfirmation>
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    // There should be two "Delete" elements - the trigger and the confirm button
    expect(screen.getAllByText('Delete')).toHaveLength(2);
  });

  it('calls onConfirm when confirmed', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <DeleteConfirmation
        title="Delete?"
        description="Are you sure?"
        onConfirm={onConfirm}
      >
        <button>Trigger Delete</button>
      </DeleteConfirmation>
    );
    fireEvent.click(screen.getByText('Trigger Delete'));
    // Click the confirm "Delete" button in the dialog
    const deleteButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent === 'Delete'
    );
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    expect(onConfirm).toHaveBeenCalled();
  });
});
