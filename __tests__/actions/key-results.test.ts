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
      { id: 'kr1', title: 'Reduce incidents', assignee: null, key_result_assignees: [] },
      { id: 'kr2', title: 'Test coverage', assignee: null, key_result_assignees: [] },
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
      assignment_type: 'unassigned',
      score: 0,
      status: 'on_track',
    });
  });

  it('createKeyResult sets assignment_type to individual when assigneeId provided', async () => {
    const mockKR = { id: 'kr1', title: 'KR with assignee' };
    mockSingle.mockResolvedValue({ data: mockKR, error: null });
    // Insert for key_results
    const mockKRInsert = vi.fn().mockReturnValue({ select: () => ({ single: mockSingle }) });
    // Insert for junction table
    const mockJunctionInsert = vi.fn().mockResolvedValue({ error: null });

    mockFrom
      .mockReturnValueOnce({ insert: mockKRInsert })
      .mockReturnValueOnce({ insert: mockJunctionInsert });

    const { createKeyResult } = await import('@/lib/actions/key-results');
    await createKeyResult({
      objectiveId: 'o1',
      title: 'KR with assignee',
      assigneeId: 'u1',
    });

    expect(mockKRInsert).toHaveBeenCalledWith(
      expect.objectContaining({ assignment_type: 'individual', assignee_id: 'u1' })
    );
    expect(mockJunctionInsert).toHaveBeenCalledWith({
      key_result_id: 'kr1',
      user_id: 'u1',
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

  it('assignKeyResult delegates to setKRAssignmentIndividual for non-null userId', async () => {
    // assignKeyResult with userId calls setKRAssignmentIndividual which:
    // 1. Deletes from key_result_assignees
    // 2. Inserts into key_result_assignees
    // 3. Updates key_results

    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockDeleteFn = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    const mockJunctionInsert = vi.fn().mockResolvedValue({ error: null });

    const mockKR = { id: 'kr1', assignee_id: 'u1', assignment_type: 'individual' };
    const mockUpdateSingle = vi.fn().mockResolvedValue({ data: mockKR, error: null });
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    mockFrom
      .mockReturnValueOnce({ delete: mockDeleteFn })
      .mockReturnValueOnce({ insert: mockJunctionInsert })
      .mockReturnValueOnce({ update: mockUpdateFn });

    const { assignKeyResult } = await import('@/lib/actions/key-results');
    const result = await assignKeyResult('kr1', 'u1');

    expect(result).toEqual(mockKR);
    expect(mockUpdateFn).toHaveBeenCalledWith({ assignment_type: 'individual', assignee_id: 'u1' });
  });

  it('assignKeyResult delegates to unassignKeyResult for null userId', async () => {
    // unassignKeyResult:
    // 1. Deletes from key_result_assignees
    // 2. Updates key_results

    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockDeleteFn = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    const mockKR = { id: 'kr1', assignee_id: null, assignment_type: 'unassigned' };
    const mockUpdateSingle = vi.fn().mockResolvedValue({ data: mockKR, error: null });
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    mockFrom
      .mockReturnValueOnce({ delete: mockDeleteFn })
      .mockReturnValueOnce({ update: mockUpdateFn });

    const { assignKeyResult } = await import('@/lib/actions/key-results');
    const result = await assignKeyResult('kr1', null);

    expect(result).toEqual(mockKR);
    expect(mockUpdateFn).toHaveBeenCalledWith({ assignment_type: 'unassigned', assignee_id: null });
  });

  it('setKRAssignmentTeam clears junction and sets team type', async () => {
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockDeleteFn = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    const mockKR = { id: 'kr1', assignment_type: 'team' };
    const mockUpdateSingle = vi.fn().mockResolvedValue({ data: mockKR, error: null });
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    mockFrom
      .mockReturnValueOnce({ delete: mockDeleteFn })
      .mockReturnValueOnce({ update: mockUpdateFn });

    const { setKRAssignmentTeam } = await import('@/lib/actions/key-results');
    const result = await setKRAssignmentTeam('kr1');

    expect(result).toEqual(mockKR);
    expect(mockFrom).toHaveBeenCalledWith('key_result_assignees');
    expect(mockUpdateFn).toHaveBeenCalledWith({ assignment_type: 'team', assignee_id: null });
  });

  it('setKRAssignmentMulti inserts multiple junction rows', async () => {
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const mockDeleteFn = vi.fn().mockReturnValue({ eq: mockDeleteEq });

    const mockJunctionInsert = vi.fn().mockResolvedValue({ error: null });

    const mockKR = { id: 'kr1', assignment_type: 'multi_individual' };
    const mockUpdateSingle = vi.fn().mockResolvedValue({ data: mockKR, error: null });
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    mockFrom
      .mockReturnValueOnce({ delete: mockDeleteFn })
      .mockReturnValueOnce({ insert: mockJunctionInsert })
      .mockReturnValueOnce({ update: mockUpdateFn });

    const { setKRAssignmentMulti } = await import('@/lib/actions/key-results');
    const result = await setKRAssignmentMulti('kr1', ['u1', 'u2', 'u3']);

    expect(result).toEqual(mockKR);
    expect(mockJunctionInsert).toHaveBeenCalledWith([
      { key_result_id: 'kr1', user_id: 'u1' },
      { key_result_id: 'kr1', user_id: 'u2' },
      { key_result_id: 'kr1', user_id: 'u3' },
    ]);
    expect(mockUpdateFn).toHaveBeenCalledWith({ assignment_type: 'multi_individual', assignee_id: null });
  });

  it('getKeyResult returns a single KR with check-ins', async () => {
    const mockKR = {
      id: 'kr1',
      title: 'Reduce incidents',
      assignee: { id: 'u1', full_name: 'Alice' },
      key_result_assignees: [{ user_id: 'u1', profile: { id: 'u1', full_name: 'Alice', avatar_url: null } }],
      check_ins: [{ id: 'ci1', value: 50, status: 'on_track' }],
    };
    mockSingle.mockResolvedValue({ data: mockKR, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getKeyResult } = await import('@/lib/actions/key-results');
    const result = await getKeyResult('kr1');

    expect(mockFrom).toHaveBeenCalledWith('key_results');
    expect(result).toEqual(mockKR);
  });

  it('updateKeyResult updates title without fetching current values', async () => {
    // First call: update KR (no currentValue/targetValue, so no fetch needed)
    const mockUpdatedKR = { id: 'kr1', title: 'New Title', objective_id: 'obj-1' };
    const mockUpdateSingle = vi.fn().mockResolvedValue({ data: mockUpdatedKR, error: null });
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    // Second call: recalculate — fetch KR scores
    const mockScoresEq = vi.fn().mockResolvedValue({ data: [{ score: 0.5 }, { score: 0.7 }], error: null });
    const mockScoresSelect = vi.fn().mockReturnValue({ eq: mockScoresEq });

    // Third call: update objective score
    const mockObjUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockObjUpdate = vi.fn().mockReturnValue({ eq: mockObjUpdateEq });

    mockFrom
      .mockReturnValueOnce({ update: mockUpdateFn })
      .mockReturnValueOnce({ select: mockScoresSelect })
      .mockReturnValueOnce({ update: mockObjUpdate });

    const { updateKeyResult } = await import('@/lib/actions/key-results');
    const result = await updateKeyResult({ id: 'kr1', title: 'New Title' });

    expect(result).toEqual(mockUpdatedKR);
    expect(mockUpdateFn).toHaveBeenCalledWith({ title: 'New Title' });
  });

  it('updateKeyResult recalculates score when currentValue changes', async () => {
    // First call: fetch current KR values for score calc
    const mockFetchSingle = vi.fn().mockResolvedValue({
      data: { current_value: 0, target_value: 100 },
      error: null,
    });
    const mockFetchEq = vi.fn().mockReturnValue({ single: mockFetchSingle });
    const mockFetchSelect = vi.fn().mockReturnValue({ eq: mockFetchEq });

    // Second call: update KR with new value + computed score
    const mockUpdatedKR = { id: 'kr1', current_value: 50, score: 0.5, objective_id: 'obj-1' };
    const mockUpdateSingle = vi.fn().mockResolvedValue({ data: mockUpdatedKR, error: null });
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    // Third call: recalculate — fetch KR scores
    const mockScoresEq = vi.fn().mockResolvedValue({ data: [{ score: 0.5 }], error: null });
    const mockScoresSelect = vi.fn().mockReturnValue({ eq: mockScoresEq });

    // Fourth call: update objective score
    const mockObjUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockObjUpdate = vi.fn().mockReturnValue({ eq: mockObjUpdateEq });

    mockFrom
      .mockReturnValueOnce({ select: mockFetchSelect })
      .mockReturnValueOnce({ update: mockUpdateFn })
      .mockReturnValueOnce({ select: mockScoresSelect })
      .mockReturnValueOnce({ update: mockObjUpdate });

    const { updateKeyResult } = await import('@/lib/actions/key-results');
    const result = await updateKeyResult({ id: 'kr1', currentValue: 50 });

    expect(result).toEqual(mockUpdatedKR);
    expect(mockUpdateFn).toHaveBeenCalledWith({ current_value: 50, score: 0.5 });
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
