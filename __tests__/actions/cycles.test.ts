import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
const mockIn = vi.fn();

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Cycle actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCycles returns all cycles for an org ordered by start_date desc', async () => {
    const mockCycles = [
      { id: 'c2', name: 'Q2', start_date: '2026-04-01' },
      { id: 'c1', name: 'Q1', start_date: '2026-01-01' },
    ];
    mockOrder.mockResolvedValue({ data: mockCycles, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getCycles } = await import('@/lib/actions/cycles');
    const result = await getCycles('org-1');

    expect(mockFrom).toHaveBeenCalledWith('okr_cycles');
    expect(result).toEqual(mockCycles);
  });

  it('getActiveCycle returns the active cycle', async () => {
    const mockCycle = { id: 'c1', name: 'Q1', is_active: true };
    mockSingle.mockResolvedValue({ data: mockCycle, error: null });
    const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ eq: mockEq2 });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getActiveCycle } = await import('@/lib/actions/cycles');
    const result = await getActiveCycle('org-1');

    expect(result).toEqual(mockCycle);
  });

  it('getActiveCycle returns null when no active cycle (PGRST116)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'no rows' } });
    const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ eq: mockEq2 });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getActiveCycle } = await import('@/lib/actions/cycles');
    const result = await getActiveCycle('org-1');

    expect(result).toBeNull();
  });

  it('createCycle inserts a new cycle', async () => {
    const mockCycle = { id: 'c1', name: 'Q1 2026' };
    mockSingle.mockResolvedValue({ data: mockCycle, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { createCycle } = await import('@/lib/actions/cycles');
    const result = await createCycle({
      organisationId: 'org-1',
      name: 'Q1 2026',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
    });

    expect(result).toEqual(mockCycle);
    expect(mockInsert).toHaveBeenCalledWith({
      organisation_id: 'org-1',
      name: 'Q1 2026',
      start_date: '2026-01-01',
      end_date: '2026-03-31',
    });
  });

  it('setActiveCycle deactivates current and activates target', async () => {
    // First call: deactivate current active
    const mockDeactivateEq2 = vi.fn().mockResolvedValue({ error: null });
    const mockDeactivateEq1 = vi.fn().mockReturnValue({ eq: mockDeactivateEq2 });
    const mockDeactivateUpdate = vi.fn().mockReturnValue({ eq: mockDeactivateEq1 });

    // Second call: activate target
    const mockActivateSingle = vi.fn().mockResolvedValue({
      data: { id: 'c2', is_active: true },
      error: null,
    });
    const mockActivateSelect = vi.fn().mockReturnValue({ single: mockActivateSingle });
    const mockActivateEq = vi.fn().mockReturnValue({ select: mockActivateSelect });
    const mockActivateUpdate = vi.fn().mockReturnValue({ eq: mockActivateEq });

    mockFrom
      .mockReturnValueOnce({ update: mockDeactivateUpdate })
      .mockReturnValueOnce({ update: mockActivateUpdate });

    const { setActiveCycle } = await import('@/lib/actions/cycles');
    const result = await setActiveCycle('org-1', 'c2');

    expect(result).toEqual({ id: 'c2', is_active: true });
  });

  it('closeCycle deactivates a cycle', async () => {
    const mockCycle = { id: 'c1', is_active: false };
    mockSingle.mockResolvedValue({ data: mockCycle, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { closeCycle } = await import('@/lib/actions/cycles');
    const result = await closeCycle('c1');

    expect(result).toEqual(mockCycle);
    expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
  });

  it('getCycle returns a single cycle', async () => {
    const mockCycle = { id: 'c1', name: 'Q1', start_date: '2026-01-01' };
    mockSingle.mockResolvedValue({ data: mockCycle, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getCycle } = await import('@/lib/actions/cycles');
    const result = await getCycle('c1');

    expect(mockFrom).toHaveBeenCalledWith('okr_cycles');
    expect(result).toEqual(mockCycle);
  });

  it('updateCycle updates cycle fields', async () => {
    const mockCycle = { id: 'c1', name: 'Q2 Renamed' };
    mockSingle.mockResolvedValue({ data: mockCycle, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { updateCycle } = await import('@/lib/actions/cycles');
    const result = await updateCycle({ id: 'c1', name: 'Q2 Renamed' });

    expect(result).toEqual(mockCycle);
    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Q2 Renamed' });
  });

  it('carryForwardObjectives carries objectives with KRs to new cycle', async () => {
    const mockObjectives = [
      {
        id: 'o1',
        organisation_id: 'org-1',
        title: 'Ship v2',
        description: 'Ship it',
        type: 'team',
        team_id: 't1',
        owner_id: null,
        key_results: [
          { title: 'Complete migration', description: null, target_value: 100, unit: '%', assignee_id: 'u1' },
        ],
      },
    ];

    // First call: fetch objectives
    mockIn.mockResolvedValue({ data: mockObjectives, error: null });
    mockEq.mockReturnValue({ in: mockIn });
    mockSelect.mockReturnValue({ eq: mockEq });

    // Second call: insert new objective
    const mockNewObj = { id: 'o2', title: 'Ship v2', cycle_id: 'c2', score: 0 };
    const mockObjSingle = vi.fn().mockResolvedValue({ data: mockNewObj, error: null });
    const mockObjInsert = vi.fn().mockReturnValue({ select: () => ({ single: mockObjSingle }) });

    // Third call: insert KRs
    const mockKRsInsert = vi.fn().mockResolvedValue({ error: null });

    mockFrom
      .mockReturnValueOnce({ select: mockSelect })
      .mockReturnValueOnce({ insert: mockObjInsert })
      .mockReturnValueOnce({ insert: mockKRsInsert });

    const { carryForwardObjectives } = await import('@/lib/actions/cycles');
    const result = await carryForwardObjectives('c1', 'c2');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockNewObj);
  });

  it('carryForwardObjectives returns empty array when no incomplete objectives', async () => {
    mockIn.mockResolvedValue({ data: [], error: null });
    mockEq.mockReturnValue({ in: mockIn });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { carryForwardObjectives } = await import('@/lib/actions/cycles');
    const result = await carryForwardObjectives('c1', 'c2');

    expect(result).toEqual([]);
  });
});
