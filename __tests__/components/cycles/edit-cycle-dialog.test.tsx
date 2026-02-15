import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditCycleDialog } from '@/components/cycles/edit-cycle-dialog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/cycles', () => ({
  updateCycle: vi.fn().mockResolvedValue({ id: 'c-1' }),
}));

const cycle = {
  id: 'c-1',
  name: 'Q1 2026',
  start_date: '2026-01-01',
  end_date: '2026-03-31',
};

describe('EditCycleDialog', () => {
  it('renders trigger and opens with pre-filled values', () => {
    render(
      <EditCycleDialog cycle={cycle}>
        <button>Edit</button>
      </EditCycleDialog>
    );
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Edit Cycle')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Q1 2026')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-03-31')).toBeInTheDocument();
  });

  it('validates end date is after start date', () => {
    render(
      <EditCycleDialog cycle={cycle}>
        <button>Edit</button>
      </EditCycleDialog>
    );
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.change(screen.getByDisplayValue('2026-03-31'), { target: { value: '2025-12-01' } });
    fireEvent.submit(screen.getByText('Save Changes').closest('form')!);

    expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
  });
});
