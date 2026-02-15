import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase server client
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

describe('Team actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTeams returns all teams ordered by name', async () => {
    const mockTeams = [
      { id: 't1', name: 'Alpha', team_lead: null },
      { id: 't2', name: 'Beta', team_lead: null },
    ];
    mockOrder.mockResolvedValue({ data: mockTeams, error: null });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getTeams } = await import('@/lib/actions/teams');
    const result = await getTeams();

    expect(mockFrom).toHaveBeenCalledWith('teams');
    expect(result).toEqual(mockTeams);
  });

  it('getTeams throws on error', async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getTeams } = await import('@/lib/actions/teams');
    await expect(getTeams()).rejects.toThrow('DB error');
  });

  it('createTeam inserts a new team', async () => {
    const mockTeam = { id: 't1', name: 'New Team', organisation_id: 'org-1' };
    mockSingle.mockResolvedValue({ data: mockTeam, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { createTeam } = await import('@/lib/actions/teams');
    const result = await createTeam({
      name: 'New Team',
      organisationId: 'org-1',
    });

    expect(result).toEqual(mockTeam);
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'New Team',
      description: null,
      organisation_id: 'org-1',
    });
  });

  it('deleteTeam deletes the team', async () => {
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    const { deleteTeam } = await import('@/lib/actions/teams');
    await deleteTeam('t1');

    expect(mockFrom).toHaveBeenCalledWith('teams');
  });

  it('addTeamMember inserts a membership', async () => {
    const mockMembership = { id: 'tm1', team_id: 't1', user_id: 'u1' };
    mockSingle.mockResolvedValue({ data: mockMembership, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { addTeamMember } = await import('@/lib/actions/teams');
    const result = await addTeamMember('t1', 'u1');

    expect(result).toEqual(mockMembership);
    expect(mockInsert).toHaveBeenCalledWith({ team_id: 't1', user_id: 'u1' });
  });

  it('removeTeamMember deletes the membership', async () => {
    const mockSecondEq = vi.fn().mockResolvedValue({ error: null });
    mockEq.mockReturnValue({ eq: mockSecondEq });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    const { removeTeamMember } = await import('@/lib/actions/teams');
    await removeTeamMember('t1', 'u1');

    expect(mockFrom).toHaveBeenCalledWith('team_memberships');
  });

  it('assignTeamLead updates the team lead', async () => {
    const mockTeam = { id: 't1', team_lead_id: 'u1' };
    mockSingle.mockResolvedValue({ data: mockTeam, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { assignTeamLead } = await import('@/lib/actions/teams');
    const result = await assignTeamLead('t1', 'u1');

    expect(result).toEqual(mockTeam);
    expect(mockUpdate).toHaveBeenCalledWith({ team_lead_id: 'u1' });
  });

  it('getTeamMembers returns members for a team', async () => {
    const mockMembers = [
      { id: 'tm1', joined_at: '', profile: { id: 'u1', full_name: 'Jane' } },
    ];
    mockOrder.mockResolvedValue({ data: mockMembers, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getTeamMembers } = await import('@/lib/actions/teams');
    const result = await getTeamMembers('t1');

    expect(result).toEqual(mockMembers);
    expect(mockFrom).toHaveBeenCalledWith('team_memberships');
  });
});
