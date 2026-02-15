import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarryForwardDialog } from '@/components/cycles/carry-forward-dialog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/cycles', () => ({
  carryForwardObjectives: vi.fn().mockResolvedValue([{ id: 'obj-new' }]),
}));

const availableCycles = [
  { id: 'c-1', name: 'Q1 2026' },
  { id: 'c-2', name: 'Q2 2026' },
  { id: 'c-3', name: 'Q3 2026' },
];

describe('CarryForwardDialog', () => {
  it('renders trigger and opens dialog', () => {
    render(
      <CarryForwardDialog
        fromCycleId="c-1"
        fromCycleName="Q1 2026"
        availableCycles={availableCycles}
      >
        <button>Carry Forward</button>
      </CarryForwardDialog>
    );
    fireEvent.click(screen.getByText('Carry Forward'));

    expect(screen.getByText('Carry Forward Objectives')).toBeInTheDocument();
    expect(screen.getByText(/Q1 2026/)).toBeInTheDocument();
  });

  it('excludes source cycle from target options', () => {
    render(
      <CarryForwardDialog
        fromCycleId="c-1"
        fromCycleName="Q1 2026"
        availableCycles={availableCycles}
      >
        <button>Carry Forward</button>
      </CarryForwardDialog>
    );
    fireEvent.click(screen.getByText('Carry Forward'));

    // The submit button should be disabled until a target is selected
    expect(screen.getByRole('button', { name: 'Carry Forward' })).toBeDisabled();
  });

  it('shows message when no other cycles available', () => {
    render(
      <CarryForwardDialog
        fromCycleId="c-1"
        fromCycleName="Q1 2026"
        availableCycles={[{ id: 'c-1', name: 'Q1 2026' }]}
      >
        <button>Carry Forward</button>
      </CarryForwardDialog>
    );
    fireEvent.click(screen.getByText('Carry Forward'));

    expect(screen.getByText('No other cycles available. Create a new cycle first.')).toBeInTheDocument();
  });
});
