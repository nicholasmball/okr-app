import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
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

describe('Key Results actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getKeyResults returns KRs for an objective', async () => {
    const mockKRs = [
      { id: 'kr1', title: 'Reduce incidents', assignee: null },
      { id: 'kr2', title: 'Test coverage', assignee: null },
    ];
    mockOrder.mockResolvedValue({ data: mockKRs, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getKeyResults } = await import('@/lib/actions/key-results');
    const result = await getKeyResults('o1');

    expect(mockFrom).toHaveBeenCalledWith('key_results');
    expect(result).toEqual(mockKRs);
  });

  it('createKeyResult inserts a new KR with defaults', async () => {
    const mockKR = { id: 'kr1', title: 'New KR', target_value: 100, unit: '%' };
    mockSingle.mockResolvedValue({ data: mockKR, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { createKeyResult } = await import('@/lib/actions/key-results');
    const result = await createKeyResult({
      objectiveId: 'o1',
      title: 'New KR',
    });

    expect(result).toEqual(mockKR);
    expect(mockInsert).toHaveBeenCalledWith({
      objective_id: 'o1',
      title: 'New KR',
      description: null,
      target_value: 100,
      current_value: 0,
      unit: '%',
      assignee_id: null,
      score: 0,
      status: 'on_track',
    });
  });

  it('createKeyResult accepts custom target and unit', async () => {
    const mockKR = { id: 'kr1', target_value: 5, unit: 'incidents/month' };
    mockSingle.mockResolvedValue({ data: mockKR, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { createKeyResult } = await import('@/lib/actions/key-results');
    await createKeyResult({
      objectiveId: 'o1',
      title: 'Reduce incidents',
      targetValue: 5,
      unit: 'incidents/month',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ target_value: 5, unit: 'incidents/month' })
    );
  });

  it('assignKeyResult updates the assignee', async () => {
    const mockKR = { id: 'kr1', assignee_id: 'u1' };
    mockSingle.mockResolvedValue({ data: mockKR, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { assignKeyResult } = await import('@/lib/actions/key-results');
    const result = await assignKeyResult('kr1', 'u1');

    expect(result).toEqual(mockKR);
    expect(mockUpdate).toHaveBeenCalledWith({ assignee_id: 'u1' });
  });

  it('assignKeyResult can unassign with null', async () => {
    const mockKR = { id: 'kr1', assignee_id: null };
    mockSingle.mockResolvedValue({ data: mockKR, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { assignKeyResult } = await import('@/lib/actions/key-results');
    const result = await assignKeyResult('kr1', null);

    expect(result).toEqual(mockKR);
    expect(mockUpdate).toHaveBeenCalledWith({ assignee_id: null });
  });

  it('deleteKeyResult removes the KR', async () => {
    // First call: get objective_id
    const mockGetSingle = vi.fn().mockResolvedValue({ data: { objective_id: 'o1' }, error: null });
    const mockGetEq = vi.fn().mockReturnValue({ single: mockGetSingle });
    const mockGetSelect = vi.fn().mockReturnValue({ eq: mockGetEq });

    // Second call: delete
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockDeleteFn = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    // Third call: recalculate (select KR scores)
    const mockRecalcEq = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockRecalcSelect = vi.fn().mockReturnValue({ eq: mockRecalcEq });

    // Fourth call: update objective score
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    mockFrom
      .mockReturnValueOnce({ select: mockGetSelect })
      .mockReturnValueOnce({ delete: mockDeleteFn })
      .mockReturnValueOnce({ select: mockRecalcSelect })
      .mockReturnValueOnce({ update: mockUpdateFn });

    const { deleteKeyResult } = await import('@/lib/actions/key-results');
    await deleteKeyResult('kr1');

    expect(mockFrom).toHaveBeenCalledWith('key_results');
  });
});
