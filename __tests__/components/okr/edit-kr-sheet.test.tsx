import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditKeyResultSheet } from '@/components/okr/edit-kr-sheet';

vi.mock('@/lib/actions/key-results', () => ({
  updateKeyResult: vi.fn().mockResolvedValue({ id: 'kr-1' }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const kr = {
  id: 'kr-1',
  title: 'Reduce incidents to < 5/month',
  description: 'Track production incidents',
  target_value: 100,
  unit: '%',
};

describe('EditKeyResultSheet', () => {
  it('renders nothing when kr is null', () => {
    const { container } = render(
      <EditKeyResultSheet kr={null} open={true} onOpenChange={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders sheet with pre-filled fields when open', () => {
    render(
      <EditKeyResultSheet kr={kr} open={true} onOpenChange={vi.fn()} />
    );
    expect(screen.getByText('Edit Key Result')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Reduce incidents to < 5/month')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Track production incidents')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('%')).toBeInTheDocument();
  });

  it('has Save Changes button', () => {
    render(
      <EditKeyResultSheet kr={kr} open={true} onOpenChange={vi.fn()} />
    );
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('disables Save when title is empty', () => {
    render(
      <EditKeyResultSheet kr={{ ...kr, title: '' }} open={true} onOpenChange={vi.fn()} />
    );
    expect(screen.getByText('Save Changes')).toBeDisabled();
  });

  it('allows editing the title', () => {
    render(
      <EditKeyResultSheet kr={kr} open={true} onOpenChange={vi.fn()} />
    );
    const titleInput = screen.getByDisplayValue('Reduce incidents to < 5/month');
    fireEvent.change(titleInput, { target: { value: 'New KR title' } });
    expect(screen.getByDisplayValue('New KR title')).toBeInTheDocument();
  });

  it('handles null description gracefully', () => {
    render(
      <EditKeyResultSheet
        kr={{ ...kr, description: null }}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByText('Edit Key Result')).toBeInTheDocument();
  });
});
