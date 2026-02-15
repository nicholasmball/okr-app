import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckInSheet } from '@/components/okr/check-in-sheet';

// Slider uses ResizeObserver which is not available in jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/lib/actions/check-ins', () => ({
  createCheckIn: vi.fn().mockResolvedValue({ id: 'ci-1' }),
}));

// Mock fetch for check-in history
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([]),
});

const kr = {
  id: 'kr-1',
  title: 'Reduce p95 latency to 200ms',
  score: 0.6,
  status: 'at_risk' as const,
  current_value: 60,
  target_value: 100,
  unit: '%',
};

describe('CheckInSheet', () => {
  it('renders nothing when kr is null', () => {
    const { container } = render(
      <CheckInSheet kr={null} open={false} onOpenChange={() => {}} currentUserId="user-1" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders KR title when open', () => {
    render(
      <CheckInSheet kr={kr} open={true} onOpenChange={() => {}} currentUserId="user-1" />
    );
    expect(screen.getByText('Reduce p95 latency to 200ms')).toBeInTheDocument();
  });

  it('renders check-in form elements', () => {
    render(
      <CheckInSheet kr={kr} open={true} onOpenChange={() => {}} currentUserId="user-1" />
    );
    expect(screen.getByText('Check In')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Save Check-in')).toBeInTheDocument();
  });

  it('renders RAG status options', () => {
    render(
      <CheckInSheet kr={kr} open={true} onOpenChange={() => {}} currentUserId="user-1" />
    );
    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByText('At Risk')).toBeInTheDocument();
    expect(screen.getByText('Off Track')).toBeInTheDocument();
  });

  it('renders check-in history section', () => {
    render(
      <CheckInSheet kr={kr} open={true} onOpenChange={() => {}} currentUserId="user-1" />
    );
    expect(screen.getByText('Check-in History')).toBeInTheDocument();
  });
});
