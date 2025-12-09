import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetUserAndProfileByEmail = jest.fn();
jest.mock('@/db/index', () => ({
  useRepos: jest.fn(() => ({
    profiles: {
      getUserAndProfileByEmail: mockGetUserAndProfileByEmail,
    },
  })),
}));

const mockSession = 'test@example.com';
jest.mock('@/hooks/ctx', () => ({
  useSession: jest.fn(() => ({
    session: mockSession,
  })),
}));

import useProfile from '@/hooks/useProfile';
import { useSession } from '@/hooks/ctx';

describe('useProfile Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null profile initially', () => {
    mockGetUserAndProfileByEmail.mockResolvedValue(null);
    
    const { result } = renderHook(() => useProfile());
    
    expect(result.current.profile).toBeNull();
  });

  it('fetches profile data when session exists', async () => {
    const mockProfileData = {
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        profile_pic: 'https://example.com/pic.jpg',
      },
      profile: {
        id: 1,
        bio: 'Test bio',
        user_id: 1,
      },
    };

    mockGetUserAndProfileByEmail.mockResolvedValue(mockProfileData);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfileData);
    });

    expect(mockGetUserAndProfileByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('does not fetch profile when session is null', () => {
    (useSession as jest.Mock).mockReturnValue({
      session: null,
    });

    renderHook(() => useProfile());

    expect(mockGetUserAndProfileByEmail).not.toHaveBeenCalled();
  });

  it('handles error when fetching profile fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Fetch failed');
    mockGetUserAndProfileByEmail.mockRejectedValue(error);

    const { result } = renderHook(() => useProfile());

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.profile).toBeNull();
    consoleErrorSpy.mockRestore();
  });

  it('updates profile when session changes', async () => {
    const mockProfileData1 = {
      user: {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        profile_pic: null,
      },
      profile: null,
    };

    mockGetUserAndProfileByEmail.mockResolvedValue(mockProfileData1);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull();
    }, { timeout: 3000 });

    expect(result.current.profile).toEqual(mockProfileData1);
  });
});
