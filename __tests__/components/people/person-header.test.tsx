import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PersonHeader } from '@/components/people/person-header';

describe('PersonHeader', () => {
  const baseProps = {
    fullName: 'John Smith',
    email: 'john@example.com',
    avatarUrl: null,
    role: 'member',
    teamNames: ['Engineering', 'Platform'],
    score: 0.65,
    krCount: 5,
  };

  it('renders name and email', () => {
    render(<PersonHeader {...baseProps} />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders team names joined by dot', () => {
    render(<PersonHeader {...baseProps} />);
    expect(screen.getByText('Engineering · Platform')).toBeInTheDocument();
  });

  it('renders score ring and KR count', () => {
    render(<PersonHeader {...baseProps} />);
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByText('5 KRs')).toBeInTheDocument();
  });

  it('renders singular KR for count of 1', () => {
    render(<PersonHeader {...baseProps} krCount={1} />);
    expect(screen.getByText('1 KR')).toBeInTheDocument();
  });

  it('renders Team Lead badge', () => {
    render(<PersonHeader {...baseProps} role="team_lead" />);
    expect(screen.getByText('Team Lead')).toBeInTheDocument();
  });

  it('does not render score section when no KRs', () => {
    render(<PersonHeader {...baseProps} krCount={0} score={0} />);
    expect(screen.queryByText('0 KRs')).not.toBeInTheDocument();
  });
});
