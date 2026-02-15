import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Check-in actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCheckIns returns check-ins for a KR ordered by most recent', async () => {
    const mockCheckIns = [
      { id: 'ci2', value: 80, status: 'on_track', created_at: '2026-02-15' },
      { id: 'ci1', value: 50, status: 'at_risk', created_at: '2026-02-10' },
    ];
    mockOrder.mockResolvedValue({ data: mockCheckIns, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getCheckIns } = await import('@/lib/actions/check-ins');
    const result = await getCheckIns('kr1');

    expect(mockFrom).toHaveBeenCalledWith('check_ins');
    expect(result).toEqual(mockCheckIns);
  });

  it('createCheckIn creates entry and updates KR + objective scores', async () => {
    const mockCheckIn = { id: 'ci1', value: 75, status: 'on_track' };

    // 1. Insert check-in
    const mockInsertSingle = vi.fn().mockResolvedValue({ data: mockCheckIn, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockInsertSingle }) });

    // 2. Get KR target_value
    const mockKrSingle = vi.fn().mockResolvedValue({
      data: { target_value: 100, objective_id: 'o1' },
      error: null,
    });
    const mockKrEq = vi.fn().mockReturnValue({ single: mockKrSingle });
    const mockKrSelect = vi.fn().mockReturnValue({ eq: mockKrEq });

    // 3. Update KR current_value/status/score
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    // 4. Recalculate: get all KR scores
    const mockRecalcEq = vi.fn().mockResolvedValue({
      data: [{ score: 0.75 }],
      error: null,
    });
    const mockRecalcSelect = vi.fn().mockReturnValue({ eq: mockRecalcEq });

    // 5. Update objective score
    const mockObjUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockObjUpdate = vi.fn().mockReturnValue({ eq: mockObjUpdateEq });

    mockFrom
      .mockReturnValueOnce({ insert: mockInsert }) // check_ins insert
      .mockReturnValueOnce({ select: mockKrSelect }) // key_results select
      .mockReturnValueOnce({ update: mockUpdateFn }) // key_results update
      .mockReturnValueOnce({ select: mockRecalcSelect }) // key_results scores
      .mockReturnValueOnce({ update: mockObjUpdate }); // objectives update

    const { createCheckIn } = await import('@/lib/actions/check-ins');
    const result = await createCheckIn({
      keyResultId: 'kr1',
      authorId: 'u1',
      value: 75,
      status: 'on_track',
      comment: 'Good progress this week',
    });

    expect(result).toEqual(mockCheckIn);
    // Verify KR was updated with correct score (75/100 = 0.75)
    expect(mockUpdateFn).toHaveBeenCalledWith({
      current_value: 75,
      status: 'on_track',
      score: 0.75,
    });
  });

  it('createCheckIn caps score at 1.0 when value exceeds target', async () => {
    const mockCheckIn = { id: 'ci1', value: 120, status: 'on_track' };

    const mockInsertSingle = vi.fn().mockResolvedValue({ data: mockCheckIn, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockInsertSingle }) });

    const mockKrSingle = vi.fn().mockResolvedValue({
      data: { target_value: 100, objective_id: 'o1' },
      error: null,
    });
    const mockKrEq = vi.fn().mockReturnValue({ single: mockKrSingle });
    const mockKrSelect = vi.fn().mockReturnValue({ eq: mockKrEq });

    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    const mockRecalcEq = vi.fn().mockResolvedValue({ data: [{ score: 1.0 }], error: null });
    const mockRecalcSelect = vi.fn().mockReturnValue({ eq: mockRecalcEq });

    const mockObjUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockObjUpdate = vi.fn().mockReturnValue({ eq: mockObjUpdateEq });

    mockFrom
      .mockReturnValueOnce({ insert: mockInsert })
      .mockReturnValueOnce({ select: mockKrSelect })
      .mockReturnValueOnce({ update: mockUpdateFn })
      .mockReturnValueOnce({ select: mockRecalcSelect })
      .mockReturnValueOnce({ update: mockObjUpdate });

    const { createCheckIn } = await import('@/lib/actions/check-ins');
    await createCheckIn({
      keyResultId: 'kr1',
      authorId: 'u1',
      value: 120,
      status: 'on_track',
    });

    // Score should be capped at 1.0
    expect(mockUpdateFn).toHaveBeenCalledWith({
      current_value: 120,
      status: 'on_track',
      score: 1,
    });
  });
});
