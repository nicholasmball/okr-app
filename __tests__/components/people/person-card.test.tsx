import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonCard } from '@/components/people/person-card';

describe('PersonCard', () => {
  const baseProps = {
    id: 'user-1',
    fullName: 'Jane Doe',
    avatarUrl: null,
    teamName: 'Engineering',
    role: 'member',
    score: 0.75,
    krCount: 4,
  };

  it('renders person name and team', () => {
    render(<PersonCard {...baseProps} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('renders score ring when KRs exist', () => {
    render(<PersonCard {...baseProps} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('renders "No KRs" when krCount is 0', () => {
    render(<PersonCard {...baseProps} krCount={0} score={0} />);
    expect(screen.getByText('No KRs')).toBeInTheDocument();
  });

  it('renders Lead badge for team leads', () => {
    render(<PersonCard {...baseProps} role="team_lead" />);
    expect(screen.getByText('Lead')).toBeInTheDocument();
  });

  it('renders Admin badge for admins', () => {
    render(<PersonCard {...baseProps} role="admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('links to person detail page', () => {
    render(<PersonCard {...baseProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/people/user-1');
  });
});
