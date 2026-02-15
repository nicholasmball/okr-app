import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
const mockOr = vi.fn();

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Objectives actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getObjectives returns objectives for an org', async () => {
    const mockObjectives = [
      { id: 'o1', title: 'Ship v2', type: 'team' },
      { id: 'o2', title: 'Improve NPS', type: 'cross_cutting' },
    ];
    mockOrder.mockResolvedValue({ data: mockObjectives, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getObjectives } = await import('@/lib/actions/objectives');
    const result = await getObjectives('org-1');

    expect(mockFrom).toHaveBeenCalledWith('objectives');
    expect(result).toEqual(mockObjectives);
  });

  it('getObjectives applies filters', async () => {
    const mockObjectives = [{ id: 'o1', type: 'team' }];
    mockOrder.mockResolvedValue({ data: mockObjectives, error: null });

    // Chain: select -> eq(org) -> eq(cycle) -> eq(type) -> order
    const mockEqType = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEqCycle = vi.fn().mockReturnValue({ eq: mockEqType });
    mockEq.mockReturnValue({ eq: mockEqCycle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getObjectives } = await import('@/lib/actions/objectives');
    const result = await getObjectives('org-1', {
      cycleId: 'c1',
      type: 'team',
    });

    expect(result).toEqual(mockObjectives);
  });

  it('getObjective returns a single objective with KRs and check-ins', async () => {
    const mockObj = { id: 'o1', title: 'Ship v2', key_results: [] };
    mockSingle.mockResolvedValue({ data: mockObj, error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getObjective } = await import('@/lib/actions/objectives');
    const result = await getObjective('o1');

    expect(result).toEqual(mockObj);
  });

  it('createObjective inserts a team objective', async () => {
    const mockObj = {
      id: 'o1',
      type: 'team',
      title: 'Ship v2',
      team_id: 't1',
      status: 'draft',
    };
    mockSingle.mockResolvedValue({ data: mockObj, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { createObjective } = await import('@/lib/actions/objectives');
    const result = await createObjective({
      organisationId: 'org-1',
      cycleId: 'c1',
      type: 'team',
      title: 'Ship v2',
      teamId: 't1',
    });

    expect(result).toEqual(mockObj);
    expect(mockInsert).toHaveBeenCalledWith({
      organisation_id: 'org-1',
      cycle_id: 'c1',
      type: 'team',
      title: 'Ship v2',
      description: null,
      team_id: 't1',
      owner_id: null,
      status: 'draft',
      score: 0,
    });
  });

  it('createObjective inserts an individual objective', async () => {
    const mockObj = { id: 'o2', type: 'individual', owner_id: 'u1' };
    mockSingle.mockResolvedValue({ data: mockObj, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { createObjective } = await import('@/lib/actions/objectives');
    const result = await createObjective({
      organisationId: 'org-1',
      cycleId: 'c1',
      type: 'individual',
      title: 'Learn Rust',
      ownerId: 'u1',
    });

    expect(result).toEqual(mockObj);
  });

  it('updateObjective updates status and score', async () => {
    const mockObj = { id: 'o1', status: 'active', score: 0.5 };
    mockSingle.mockResolvedValue({ data: mockObj, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { updateObjective } = await import('@/lib/actions/objectives');
    const result = await updateObjective({
      id: 'o1',
      status: 'active',
      score: 0.5,
    });

    expect(result).toEqual(mockObj);
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'active', score: 0.5 });
  });

  it('deleteObjective deletes the objective', async () => {
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    const { deleteObjective } = await import('@/lib/actions/objectives');
    await deleteObjective('o1');

    expect(mockFrom).toHaveBeenCalledWith('objectives');
  });
});
