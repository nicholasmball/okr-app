import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/okr/empty-state';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No objectives yet" />);
    expect(screen.getByText('No objectives yet')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState title="No objectives yet" description="Create your first objective to get started." />
    );
    expect(screen.getByText('Create your first objective to get started.')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState title="No objectives" action={<button>Create</button>} />
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No objectives" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });
});
