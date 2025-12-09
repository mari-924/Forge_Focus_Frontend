import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  verifyGoogleToken,
  verifyGithubToken,
  signInOrCreateUser,
  getCurrentUser,
  getAllUsers,
  deleteUser,
} from '@/api/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const API_BASE_URL = 'https://focus-forge-cst438-38b937c199bc.herokuapp.com';

describe('API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('mock-jwt-token');
  });

  describe('verifyGoogleToken', () => {
    it('calls the correct endpoint with token', async () => {
      const mockResponse = { access_token: 'google-jwt-token', user: { id: 1 } };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await verifyGoogleToken('google-id-token-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/google`,
        { token: 'google-id-token-123' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles errors from Google verification', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Invalid token'));

      await expect(verifyGoogleToken('invalid-token')).rejects.toThrow('Invalid token');
    });
  });

  describe('verifyGithubToken', () => {
    it('calls the correct endpoint with token', async () => {
      const mockResponse = { access_token: 'github-access-token' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyGithubToken('github-token-123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/github`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'github-token-123' }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error when verification fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      await expect(verifyGithubToken('invalid-token')).rejects.toThrow(
        'GitHub token verification failed'
      );
    });
  });

  describe('signInOrCreateUser', () => {
    it('calls signin endpoint with auth header', async () => {
      const mockUser = { id: 1, email: 'test@example.com', username: 'testuser' };
      mockedAxios.post.mockResolvedValue({ data: mockUser });

      const result = await signInOrCreateUser();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/signin`,
        {},
        { headers: { Authorization: 'Bearer mock-jwt-token' } }
      );
      expect(result).toEqual(mockUser);
    });

    it('calls without auth header when no JWT exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const mockUser = { id: 2, email: 'new@example.com', username: 'newuser' };
      mockedAxios.post.mockResolvedValue({ data: mockUser });

      const result = await signInOrCreateUser();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/signin`,
        {},
        { headers: {} }
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('getCurrentUser', () => {
    it('fetches current user with auth header', async () => {
      const mockUser = { id: 1, email: 'current@example.com', username: 'currentuser' };
      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const result = await getCurrentUser();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/me`,
        { headers: { Authorization: 'Bearer mock-jwt-token' } }
      );
      expect(result).toEqual(mockUser);
    });

    it('handles errors when fetching user fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getAllUsers', () => {
    it('fetches all users with auth header', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', username: 'user1' },
        { id: 2, email: 'user2@example.com', username: 'user2' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockUsers });

      const result = await getAllUsers();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/users`,
        { headers: { Authorization: 'Bearer mock-jwt-token' } }
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('deleteUser', () => {
    it('deletes user by id with auth header', async () => {
      const mockResponse = { message: 'User deleted successfully' };
      mockedAxios.delete.mockResolvedValue({ data: mockResponse });

      const result = await deleteUser(123);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/123`,
        { headers: { Authorization: 'Bearer mock-jwt-token' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when delete fails', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('User not found'));

      await expect(deleteUser(999)).rejects.toThrow('User not found');
    });
  });

  describe('authHeader helper', () => {
    it('returns auth header when JWT exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-jwt');
      
      const mockUser = { id: 1 };
      mockedAxios.get.mockResolvedValue({ data: mockUser });
      
      await getCurrentUser();
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        { headers: { Authorization: 'Bearer test-jwt' } }
      );
    });

    it('returns empty header when no JWT exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      
      const mockUser = { id: 1 };
      mockedAxios.get.mockResolvedValue({ data: mockUser });
      
      await getCurrentUser();
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        { headers: {} }
      );
    });
  });
});
