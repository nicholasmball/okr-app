import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateCycleDialog } from '@/components/cycles/create-cycle-dialog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/cycles', () => ({
  createCycle: vi.fn().mockResolvedValue({ id: 'c-new' }),
}));

describe('CreateCycleDialog', () => {
  it('renders trigger button', () => {
    render(
      <CreateCycleDialog organisationId="org-1">
        <button>New Cycle</button>
      </CreateCycleDialog>
    );
    expect(screen.getByText('New Cycle')).toBeInTheDocument();
  });

  it('opens dialog with form fields when triggered', () => {
    render(
      <CreateCycleDialog organisationId="org-1">
        <button>New Cycle</button>
      </CreateCycleDialog>
    );
    fireEvent.click(screen.getByText('New Cycle'));
    expect(screen.getByText('Create New Cycle')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('has submit button disabled when form is empty', () => {
    render(
      <CreateCycleDialog organisationId="org-1">
        <button>New Cycle</button>
      </CreateCycleDialog>
    );
    fireEvent.click(screen.getByText('New Cycle'));
    expect(screen.getByText('Create Cycle')).toBeDisabled();
  });

  it('validates end date is after start date', () => {
    render(
      <CreateCycleDialog organisationId="org-1">
        <button>New Cycle</button>
      </CreateCycleDialog>
    );
    fireEvent.click(screen.getByText('New Cycle'));

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Q2 2026' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-06-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-03-01' } });

    fireEvent.submit(screen.getByText('Create Cycle').closest('form')!);

    expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
  });
});
