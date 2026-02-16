import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ObjectiveSection } from '@/components/dashboard/objective-section';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/check-ins', () => ({
  createCheckIn: vi.fn().mockResolvedValue({ id: 'ci-1' }),
}));
vi.mock('@/lib/actions/key-results', () => ({
  setKRAssignmentTeam: vi.fn(),
  setKRAssignmentIndividual: vi.fn(),
  setKRAssignmentMulti: vi.fn(),
  unassignKeyResult: vi.fn(),
}));

const mockObjectives = [
  {
    id: 'o1',
    title: 'Ship v2 platform',
    type: 'team' as const,
    score: 0.6,
    status: 'active',
    key_results: [
      {
        id: 'kr1',
        title: 'Complete API migration',
        score: 0.8,
        status: 'on_track' as const,
        current_value: 80,
        target_value: 100,
        unit: '%',
        assignee_id: 'user1',
      },
      {
        id: 'kr2',
        title: 'Reduce p95 latency',
        score: 0.4,
        status: 'at_risk' as const,
        current_value: 200,
        target_value: 100,
        unit: 'ms',
        assignee_id: 'user2',
      },
    ],
  },
  {
    id: 'o2',
    title: 'Improve developer experience',
    type: 'team' as const,
    score: 0.3,
    status: 'active',
    key_results: [],
  },
];

describe('ObjectiveSection', () => {
  it('renders section title and objectives', () => {
    render(
      <ObjectiveSection
        title="Team Objectives"
        objectives={mockObjectives}
        currentUserId="user1"
      />
    );
    expect(screen.getByText('Team Objectives')).toBeInTheDocument();
    expect(screen.getByText('Ship v2 platform')).toBeInTheDocument();
    expect(screen.getByText('Improve developer experience')).toBeInTheDocument();
  });

  it('returns null when objectives is empty', () => {
    const { container } = render(
      <ObjectiveSection title="Empty" objectives={[]} currentUserId="user1" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows KR count on each objective', () => {
    render(
      <ObjectiveSection
        title="Team Objectives"
        objectives={mockObjectives}
        currentUserId="user1"
      />
    );
    expect(screen.getByText('2 KRs')).toBeInTheDocument();
    expect(screen.getByText('0 KRs')).toBeInTheDocument();
  });

  it('expands to show KRs when objective is clicked', () => {
    render(
      <ObjectiveSection
        title="Team Objectives"
        objectives={mockObjectives}
        currentUserId="user1"
      />
    );

    expect(screen.queryByText('Complete API migration')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Ship v2 platform'));

    expect(screen.getByText('Complete API migration')).toBeInTheDocument();
    expect(screen.getByText('Reduce p95 latency')).toBeInTheDocument();
  });

  it('collapses KRs when objective is clicked again', () => {
    render(
      <ObjectiveSection
        title="Team Objectives"
        objectives={mockObjectives}
        currentUserId="user1"
      />
    );

    fireEvent.click(screen.getByText('Ship v2 platform'));
    expect(screen.getByText('Complete API migration')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ship v2 platform'));
    expect(screen.queryByText('Complete API migration')).not.toBeInTheDocument();
  });
});
