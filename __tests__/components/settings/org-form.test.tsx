import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrgForm } from '@/components/settings/org-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/organisations', () => ({
  updateOrganisation: vi.fn().mockResolvedValue({ id: 'org-1' }),
}));

describe('OrgForm', () => {
  it('renders org name input with current value', () => {
    render(<OrgForm organisation={{ id: 'org-1', name: 'Acme Corp' }} />);
    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
  });

  it('has a save button', () => {
    render(<OrgForm organisation={{ id: 'org-1', name: 'Acme Corp' }} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('disables save when name is empty', () => {
    render(<OrgForm organisation={{ id: 'org-1', name: 'Acme Corp' }} />);
    fireEvent.change(screen.getByDisplayValue('Acme Corp'), { target: { value: '' } });
    expect(screen.getByText('Save')).toBeDisabled();
  });
});
