import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssigneePicker } from '@/components/okr/assignee-picker';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/lib/actions/key-results', () => ({
  assignKeyResult: vi.fn(),
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

  it('renders an assign button when no assignee', () => {
    render(<AssigneePicker krId="kr-1" assignee={null} people={people} />);
    const button = screen.getByTitle('Assign to someone');
    expect(button).toBeInTheDocument();
  });

  it('renders assignee initials when assigned', () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignee={{ id: 'u1', full_name: 'Alice Smith', avatar_url: null }}
        people={people}
      />
    );
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('opens popover and shows people list when clicked', async () => {
    render(<AssigneePicker krId="kr-1" assignee={null} people={people} />);
    fireEvent.click(screen.getByTitle('Assign to someone'));
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
  });

  it('shows unassign option when assignee is set', async () => {
    render(
      <AssigneePicker
        krId="kr-1"
        assignee={{ id: 'u1', full_name: 'Alice Smith', avatar_url: null }}
        people={people}
      />
    );
    fireEvent.click(screen.getByTitle('Assigned to Alice Smith'));
    expect(await screen.findByText('Unassign')).toBeInTheDocument();
  });

  it('does not show unassign when no assignee', async () => {
    render(<AssigneePicker krId="kr-1" assignee={null} people={people} />);
    fireEvent.click(screen.getByTitle('Assign to someone'));
    await screen.findByText('Alice Smith');
    expect(screen.queryByText('Unassign')).not.toBeInTheDocument();
  });

  it('shows search input', async () => {
    render(<AssigneePicker krId="kr-1" assignee={null} people={people} />);
    fireEvent.click(screen.getByTitle('Assign to someone'));
    expect(await screen.findByPlaceholderText('Search people...')).toBeInTheDocument();
  });
});
