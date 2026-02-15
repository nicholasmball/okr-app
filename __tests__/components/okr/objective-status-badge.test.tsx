import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ObjectiveStatusBadge } from '@/components/okr/objective-status-badge';

describe('ObjectiveStatusBadge', () => {
  it('renders "Draft" for draft status', () => {
    render(<ObjectiveStatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders "Active" for active status', () => {
    render(<ObjectiveStatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders "Completed" for completed status', () => {
    render(<ObjectiveStatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders "Cancelled" for cancelled status', () => {
    render(<ObjectiveStatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});
