import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonObjectives } from '@/components/people/person-objectives';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock('@/lib/actions/key-results', () => ({
  updateKeyResult: vi.fn().mockResolvedValue({ id: 'kr-1' }),
}));
vi.mock('@/lib/actions/objectives', () => ({
  updateObjective: vi.fn().mockResolvedValue({ id: 'obj-1' }),
}));

describe('PersonObjectives', () => {
  const objectives = [
    {
      id: 'obj-1',
      title: 'Improve platform reliability',
      type: 'team' as const,
      score: 0.7,
      status: 'active',
      key_results: [
        {
          id: 'kr-1',
          title: 'Reduce P1 incidents to <2/month',
          score: 0.8,
          status: 'on_track' as const,
          current_value: 80,
          target_value: 100,
          unit: '%',
          assignee_id: 'user-1',
        },
      ],
    },
    {
      id: 'obj-2',
      title: 'Personal development',
      type: 'individual' as const,
      score: 0.4,
      status: 'active',
      key_results: [
        {
          id: 'kr-2',
          title: 'Complete 3 courses',
          score: 0.33,
          status: 'at_risk' as const,
          current_value: 1,
          target_value: 3,
          unit: 'courses',
          assignee_id: 'user-1',
        },
      ],
    },
  ];

  it('renders section headers for each objective type', () => {
    render(<PersonObjectives objectives={objectives} personId="user-1" />);
    expect(screen.getByText('Team Objectives')).toBeInTheDocument();
    expect(screen.getByText('Individual Objectives')).toBeInTheDocument();
  });

  it('renders objective titles', () => {
    render(<PersonObjectives objectives={objectives} personId="user-1" />);
    expect(screen.getByText('Improve platform reliability')).toBeInTheDocument();
    expect(screen.getByText('Personal development')).toBeInTheDocument();
  });

  it('expands objective to show KRs on click', () => {
    render(<PersonObjectives objectives={objectives} personId="user-1" />);

    expect(screen.queryByText('Reduce P1 incidents to <2/month')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Improve platform reliability'));
    expect(screen.getByText('Reduce P1 incidents to <2/month')).toBeInTheDocument();
  });

  it('does not render empty sections', () => {
    const teamOnly = objectives.filter((o) => o.type === 'team');
    render(<PersonObjectives objectives={teamOnly} personId="user-1" />);
    expect(screen.queryByText('Individual Objectives')).not.toBeInTheDocument();
    expect(screen.queryByText('Cross-Cutting Objectives')).not.toBeInTheDocument();
  });

  it('renders edit objective buttons', () => {
    render(<PersonObjectives objectives={objectives} personId="user-1" />);
    const editButtons = screen.getAllByRole('button', { name: 'Edit objective' });
    expect(editButtons.length).toBe(2);
  });

  it('renders edit KR buttons when objective is expanded', () => {
    render(<PersonObjectives objectives={objectives} personId="user-1" />);
    fireEvent.click(screen.getByText('Improve platform reliability'));
    expect(screen.getByRole('button', { name: 'Edit key result' })).toBeInTheDocument();
  });

  it('renders ObjectiveStatusBadge on each card', () => {
    render(<PersonObjectives objectives={objectives} personId="user-1" />);
    const badges = screen.getAllByText('Active');
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it('hides non-active objectives by default and shows with toggle', () => {
    const mixed = [
      ...objectives,
      {
        id: 'obj-3',
        title: 'Cancelled goal',
        type: 'team' as const,
        score: 0,
        status: 'cancelled',
        key_results: [],
      },
    ];
    render(<PersonObjectives objectives={mixed} personId="user-1" />);
    expect(screen.queryByText('Cancelled goal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Show all (3)'));
    expect(screen.getByText('Cancelled goal')).toBeInTheDocument();
  });

  it('disables edit/check-in for non-active objectives', () => {
    const completed = [
      {
        id: 'obj-4',
        title: 'Completed objective',
        type: 'team' as const,
        score: 1,
        status: 'completed',
        key_results: [
          {
            id: 'kr-3',
            title: 'Done KR',
            score: 1,
            status: 'on_track' as const,
            current_value: 100,
            target_value: 100,
            unit: '%',
            assignee_id: 'user-1',
          },
        ],
      },
    ];
    render(<PersonObjectives objectives={completed} personId="user-1" />);
    fireEvent.click(screen.getByText('Show all (1)'));
    fireEvent.click(screen.getByText('Completed objective'));
    expect(screen.getByText('Done KR')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit key result' })).not.toBeInTheDocument();
  });
});
