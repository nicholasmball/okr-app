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

describe('Profile actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updateProfile updates full_name and returns profile data', async () => {
    const mockProfile = {
      id: 'u1',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
    };
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { updateProfile } = await import('@/lib/actions/profiles');
    const result = await updateProfile({ id: 'u1', fullName: 'John Doe' });

    expect(result).toEqual(mockProfile);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ full_name: 'John Doe' });
  });

  it('updateProfile throws on error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Profile not found' },
    });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { updateProfile } = await import('@/lib/actions/profiles');
    await expect(
      updateProfile({ id: 'u1', fullName: 'John Doe' }),
    ).rejects.toThrow('Profile not found');
  });

  it('updateUserRole updates role and returns data', async () => {
    const mockProfile = {
      id: 'u1',
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    };
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { updateUserRole } = await import('@/lib/actions/profiles');
    const result = await updateUserRole({ userId: 'u1', role: 'admin' });

    expect(result).toEqual(mockProfile);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ role: 'admin' });
  });

  it('updateUserRole throws on error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Invalid role' },
    });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { updateUserRole } = await import('@/lib/actions/profiles');
    await expect(
      updateUserRole({ userId: 'u1', role: 'admin' }),
    ).rejects.toThrow('Invalid role');
  });

  it('getOrgProfiles returns profiles ordered by full_name', async () => {
    const mockProfiles = [
      {
        id: 'u1',
        full_name: 'Alice Smith',
        email: 'alice@example.com',
        avatar_url: null,
        role: 'admin',
      },
      {
        id: 'u2',
        full_name: 'Bob Jones',
        email: 'bob@example.com',
        avatar_url: null,
        role: 'member',
      },
    ];
    mockOrder.mockResolvedValue({ data: mockProfiles, error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getOrgProfiles } = await import('@/lib/actions/profiles');
    const result = await getOrgProfiles('org-1');

    expect(result).toEqual(mockProfiles);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockSelect).toHaveBeenCalledWith(
      'id, full_name, email, avatar_url, role',
    );
  });

  it('setManager updates manager_id and returns data', async () => {
    const mockProfile = {
      id: 'u2',
      full_name: 'Jane Doe',
      manager_id: 'u1',
    };
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { setManager } = await import('@/lib/actions/profiles');
    const result = await setManager({ userId: 'u2', managerId: 'u1' });

    expect(result).toEqual(mockProfile);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ manager_id: 'u1' });
  });

  it('setManager clears manager when null', async () => {
    const mockProfile = {
      id: 'u2',
      full_name: 'Jane Doe',
      manager_id: null,
    };
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { setManager } = await import('@/lib/actions/profiles');
    const result = await setManager({ userId: 'u2', managerId: null });

    expect(result).toEqual(mockProfile);
    expect(mockUpdate).toHaveBeenCalledWith({ manager_id: null });
  });

  it('getOrgProfiles throws on error', async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: 'Organisation not found' },
    });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const { getOrgProfiles } = await import('@/lib/actions/profiles');
    await expect(getOrgProfiles('org-1')).rejects.toThrow(
      'Organisation not found',
    );
  });
});
