import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserManagement } from '@/components/settings/user-management';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/profiles', () => ({
  updateUserRole: vi.fn().mockResolvedValue({ id: 'u-1' }),
}));

const users = [
  { id: 'u-1', full_name: 'Nick Ball', email: 'nick@test.com', role: 'admin' as const },
  { id: 'u-2', full_name: 'Jane Doe', email: 'jane@test.com', role: 'member' as const },
];

describe('UserManagement', () => {
  it('renders all users', () => {
    render(<UserManagement users={users} currentUserId="u-1" />);
    expect(screen.getByText('Nick Ball')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows "You" badge for current user', () => {
    render(<UserManagement users={users} currentUserId="u-1" />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('shows empty state when no users', () => {
    render(<UserManagement users={[]} currentUserId="u-1" />);
    expect(screen.getByText('No users in this organisation.')).toBeInTheDocument();
  });

  it('renders role badges', () => {
    render(<UserManagement users={users} currentUserId="u-1" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
  });
});
