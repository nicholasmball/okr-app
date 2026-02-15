import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileForm } from '@/components/settings/profile-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/profiles', () => ({
  updateProfile: vi.fn().mockResolvedValue({ id: 'u-1' }),
}));

const profile = { id: 'u-1', full_name: 'Nick Ball', email: 'nick@example.com' };

describe('ProfileForm', () => {
  it('renders email (disabled) and name fields', () => {
    render(<ProfileForm profile={profile} />);
    expect(screen.getByDisplayValue('nick@example.com')).toBeDisabled();
    expect(screen.getByDisplayValue('Nick Ball')).toBeInTheDocument();
  });

  it('has a save button', () => {
    render(<ProfileForm profile={profile} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('disables save when name is empty', () => {
    render(<ProfileForm profile={profile} />);
    fireEvent.change(screen.getByDisplayValue('Nick Ball'), { target: { value: '' } });
    expect(screen.getByText('Save')).toBeDisabled();
  });
});
