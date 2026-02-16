import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PeopleFilter } from '@/components/people/people-filter';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const teams = [
  { id: 't-1', name: 'Engineering' },
  { id: 't-2', name: 'Design' },
];

describe('PeopleFilter', () => {
  it('renders search input and team filter', () => {
    render(<PeopleFilter teams={teams} />);
    expect(screen.getByPlaceholderText('Search people...')).toBeInTheDocument();
    expect(screen.getByText('All teams')).toBeInTheDocument();
  });

  it('does not show My Reports filter when hasReports is false', () => {
    render(<PeopleFilter teams={teams} hasReports={false} />);
    expect(screen.queryByText('Everyone')).not.toBeInTheDocument();
  });

  it('shows My Reports filter when hasReports is true', () => {
    render(<PeopleFilter teams={teams} hasReports={true} />);
    expect(screen.getByText('Everyone')).toBeInTheDocument();
  });
});
