import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamHeader } from '@/components/teams/team-header';

describe('TeamHeader', () => {
  it('renders team name', () => {
    render(<TeamHeader name="Engineering" members={[]} />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<TeamHeader name="Engineering" description="Backend team" members={[]} />);
    expect(screen.getByText('Backend team')).toBeInTheDocument();
  });

  it('renders team lead with badge', () => {
    render(
      <TeamHeader
        name="Engineering"
        teamLead={{ id: '1', full_name: 'Jane Doe', avatar_url: null }}
        members={[]}
      />
    );
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
  });

  it('renders member count', () => {
    const members = [
      { id: '1', full_name: 'Alice', avatar_url: null },
      { id: '2', full_name: 'Bob', avatar_url: null },
    ];
    render(<TeamHeader name="Engineering" members={members} />);
    expect(screen.getByText('2 members')).toBeInTheDocument();
  });

  it('renders singular member for count of 1', () => {
    render(
      <TeamHeader name="Engineering" members={[{ id: '1', full_name: 'Alice', avatar_url: null }]} />
    );
    expect(screen.getByText('1 member')).toBeInTheDocument();
  });
});
