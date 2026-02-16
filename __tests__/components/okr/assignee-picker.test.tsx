import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssigneePicker } from '@/components/okr/assignee-picker';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/lib/actions/key-results', () => ({
  setKRAssignmentTeam: vi.fn(),
  setKRAssignmentIndividual: vi.fn(),
  setKRAssignmentMulti: vi.fn(),
  unassignKeyResult: vi.fn(),
}));

const people = [
  { id: 'u1', full_name: 'Alice Smith', avatar_url: null },
  { id: 'u2', full_name: 'Bob Jones', avatar_url: null },
  { id: 'u3', full_name: 'Charlie Brown', avatar_url: null },
];

describe('AssigneePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an assign button when no assignees', () => {
    render(<AssigneePicker krId="kr-1" people={people} />);
    const button = screen.getByTitle('Assign to someone');
    expect(button).toBeInTheDocument();
  });

  it('renders assignee initials when single assignee', () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="individual"
        assignees={[{ id: 'u1', full_name: 'Alice Smith', avatar_url: null }]}
        people={people}
      />
    );
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('shows mode selector buttons when popover is opened', async () => {
    render(<AssigneePicker krId="kr-1" people={people} objectiveTeamId="team-1" />);
    fireEvent.click(screen.getByTitle('Assign to someone'));
    expect(await screen.findByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Multi')).toBeInTheDocument();
  });

  it('hides team mode when no objectiveTeamId', async () => {
    render(<AssigneePicker krId="kr-1" people={people} />);
    fireEvent.click(screen.getByTitle('Assign to someone'));
    await screen.findByText('Individual');
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
  });

  it('shows individual mode people list when individual mode is active', async () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="individual"
        assignees={[]}
        people={people}
      />
    );
    fireEvent.click(screen.getByTitle('Assign to someone'));
    // The activeMode starts as 'individual' because assignmentType is 'individual'
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('shows unassign option when individual mode has assignees', async () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="individual"
        assignees={[{ id: 'u1', full_name: 'Alice Smith', avatar_url: null }]}
        people={people}
      />
    );
    fireEvent.click(screen.getByTitle('Assigned to Alice Smith'));
    expect(await screen.findByText('Unassign')).toBeInTheDocument();
  });

  it('shows search input in individual mode', async () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="individual"
        assignees={[]}
        people={people}
      />
    );
    fireEvent.click(screen.getByTitle('Assign to someone'));
    expect(await screen.findByPlaceholderText('Search people...')).toBeInTheDocument();
  });

  it('shows multi mode with checkboxes and confirm button', async () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="multi_individual"
        assignees={[
          { id: 'u1', full_name: 'Alice Smith', avatar_url: null },
          { id: 'u2', full_name: 'Bob Jones', avatar_url: null },
        ]}
        people={people}
      />
    );
    fireEvent.click(screen.getByTitle('Assigned to 2 people'));
    expect(await screen.findByText('Assign 2 people')).toBeInTheDocument();
  });

  it('renders team badge when assignment type is team', () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="team"
        people={people}
        teamName="Engineering"
        objectiveTeamId="team-1"
      />
    );
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows confirmation dialog when switching modes with existing assignees', async () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="individual"
        assignees={[{ id: 'u1', full_name: 'Alice Smith', avatar_url: null }]}
        people={people}
        objectiveTeamId="team-1"
      />
    );
    fireEvent.click(screen.getByTitle('Assigned to Alice Smith'));
    // Click the Team mode button
    const teamButton = await screen.findByText('Team');
    fireEvent.click(teamButton);
    expect(await screen.findByText('Change assignment mode?')).toBeInTheDocument();
  });

  it('renders avatar group for multiple assignees', () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignmentType="multi_individual"
        assignees={[
          { id: 'u1', full_name: 'Alice Smith', avatar_url: null },
          { id: 'u2', full_name: 'Bob Jones', avatar_url: null },
        ]}
        people={people}
      />
    );
    expect(screen.getByText('AS')).toBeInTheDocument();
    expect(screen.getByText('BJ')).toBeInTheDocument();
  });
});
