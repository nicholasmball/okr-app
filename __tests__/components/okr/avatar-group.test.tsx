import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarGroup } from '@/components/okr/avatar-group';

const members = [
  { id: '1', full_name: 'Alice Johnson', avatar_url: null },
  { id: '2', full_name: 'Bob Smith', avatar_url: null },
  { id: '3', full_name: 'Charlie Brown', avatar_url: null },
  { id: '4', full_name: 'Diana Prince', avatar_url: null },
  { id: '5', full_name: 'Eve Wilson', avatar_url: null },
  { id: '6', full_name: 'Frank Castle', avatar_url: null },
];

describe('AvatarGroup', () => {
  it('renders initials for each visible member', () => {
    render(<AvatarGroup members={members.slice(0, 3)} />);
    expect(screen.getByText('AJ')).toBeInTheDocument();
    expect(screen.getByText('BS')).toBeInTheDocument();
    expect(screen.getByText('CB')).toBeInTheDocument();
  });

  it('shows overflow count when exceeding max', () => {
    render(<AvatarGroup members={members} max={3} />);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('does not show overflow when within max', () => {
    render(<AvatarGroup members={members.slice(0, 3)} max={5} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it('defaults to max of 5', () => {
    render(<AvatarGroup members={members} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
