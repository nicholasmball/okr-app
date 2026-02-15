import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamManagement } from '@/components/settings/team-management';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/teams', () => ({
  createTeam: vi.fn().mockResolvedValue({ id: 't-new' }),
  updateTeam: vi.fn().mockResolvedValue({ id: 't-1' }),
  deleteTeam: vi.fn().mockResolvedValue(undefined),
  assignTeamLead: vi.fn().mockResolvedValue({ id: 't-1' }),
  addTeamMember: vi.fn().mockResolvedValue({ id: 'tm-1' }),
  removeTeamMember: vi.fn().mockResolvedValue(undefined),
}));

const teams = [
  {
    id: 't-1',
    name: 'Engineering',
    description: 'Dev team',
    team_lead_id: 'u-1',
    members: [
      { id: 'u-1', full_name: 'Nick Ball', email: 'nick@test.com' },
      { id: 'u-2', full_name: 'Jane Doe', email: 'jane@test.com' },
    ],
  },
];

const allPeople = [
  { id: 'u-1', full_name: 'Nick Ball', email: 'nick@test.com' },
  { id: 'u-2', full_name: 'Jane Doe', email: 'jane@test.com' },
  { id: 'u-3', full_name: 'Bob Smith', email: 'bob@test.com' },
];

describe('TeamManagement', () => {
  it('renders teams with member count', () => {
    render(<TeamManagement organisationId="org-1" teams={teams} allPeople={allPeople} />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('2 members')).toBeInTheDocument();
  });

  it('renders New Team button', () => {
    render(<TeamManagement organisationId="org-1" teams={teams} allPeople={allPeople} />);
    expect(screen.getByText('New Team')).toBeInTheDocument();
  });

  it('shows empty state when no teams', () => {
    render(<TeamManagement organisationId="org-1" teams={[]} allPeople={allPeople} />);
    expect(screen.getByText('No teams yet. Create one to get started.')).toBeInTheDocument();
  });

  it('renders member names', () => {
    render(<TeamManagement organisationId="org-1" teams={teams} allPeople={allPeople} />);
    expect(screen.getAllByText('Nick Ball').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('opens create team dialog', () => {
    render(<TeamManagement organisationId="org-1" teams={teams} allPeople={allPeople} />);
    fireEvent.click(screen.getByText('New Team'));
    expect(screen.getByRole('heading', { name: 'Create Team' })).toBeInTheDocument();
  });
});
