import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserManagement } from '@/components/settings/user-management';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/profiles', () => ({
  updateUserRole: vi.fn().mockResolvedValue({ id: 'u-1' }),
  setManager: vi.fn().mockResolvedValue({ id: 'u-1' }),
}));

const users = [
  { id: 'u-1', full_name: 'Nick Ball', email: 'nick@test.com', role: 'admin' as const, manager_id: null },
  { id: 'u-2', full_name: 'Jane Doe', email: 'jane@test.com', role: 'member' as const, manager_id: 'u-1' },
];

describe('UserManagement', () => {
  it('renders all users', () => {
    render(<UserManagement users={users} currentUserId="u-1" />);
    // Nick Ball may appear as a name and in Jane's manager dropdown
    expect(screen.getAllByText('Nick Ball').length).toBeGreaterThanOrEqual(1);
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

  it('shows manager name in dropdown', () => {
    render(<UserManagement users={users} currentUserId="u-1" />);
    // Jane Doe's manager is Nick Ball
    expect(screen.getAllByText('Nick Ball').length).toBeGreaterThanOrEqual(2);
  });

  it('shows "No manager" when manager_id is null', () => {
    render(<UserManagement users={users} currentUserId="u-1" />);
    // Nick Ball has no manager
    expect(screen.getByText('No manager')).toBeInTheDocument();
  });
});
