import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase server client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockGetUser = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Chain helpers
function chainReturning(data: unknown, error: unknown = null) {
  mockSingle.mockResolvedValue({ data, error });
  mockEq.mockReturnValue({ select: () => ({ single: mockSingle }), single: mockSingle });
  mockSelect.mockReturnValue({ single: mockSingle });
  mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
  mockUpdate.mockReturnValue({ eq: mockEq });
}

describe('Organisation actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOrganisation returns the org for the current user', async () => {
    const mockOrg = { id: 'org-1', name: 'Acme', created_at: '', updated_at: '' };
    mockSingle.mockResolvedValue({ data: mockOrg, error: null });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate });

    const { getOrganisation } = await import('@/lib/actions/organisations');
    const result = await getOrganisation();

    expect(mockFrom).toHaveBeenCalledWith('organisations');
    expect(result).toEqual(mockOrg);
  });

  it('getOrganisation throws on error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate });

    const { getOrganisation } = await import('@/lib/actions/organisations');
    await expect(getOrganisation()).rejects.toThrow('Not found');
  });

  it('createOrganisation creates org and updates profile to admin', async () => {
    const mockOrg = { id: 'org-1', name: 'New Org' };

    mockSingle.mockResolvedValue({ data: mockOrg, error: null });
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockFrom.mockReturnValueOnce({ select: mockSelect, insert: mockInsert, update: mockUpdate });

    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    const mockProfileUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockFrom.mockReturnValueOnce({ select: mockSelect, insert: mockInsert, update: mockProfileUpdate });

    const { createOrganisation } = await import('@/lib/actions/organisations');
    const result = await createOrganisation('New Org');

    expect(result).toEqual(mockOrg);
  });

  it('updateOrganisation updates the org name', async () => {
    const mockOrg = { id: 'org-1', name: 'Updated' };
    mockSingle.mockResolvedValue({ data: mockOrg, error: null });
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert, update: mockUpdate });

    const { updateOrganisation } = await import('@/lib/actions/organisations');
    const result = await updateOrganisation('org-1', 'Updated');

    expect(mockFrom).toHaveBeenCalledWith('organisations');
    expect(result).toEqual(mockOrg);
  });
});
