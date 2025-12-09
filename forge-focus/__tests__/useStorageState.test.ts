import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useStorageState, setStorageItemAsync } from '@/hooks/useStorageState';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

describe('useStorageState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios'; // Default to non-web platform
  });

  it('returns initial state with loading true and value null', () => {
    mockGetItemAsync.mockResolvedValue(null);
    
    const { result } = renderHook(() => useStorageState('testKey'));
    
    const [[isLoading, value]] = result.current;
    expect(isLoading).toBe(true);
    expect(value).toBeNull();
  });

  it('loads value from SecureStore on native platform', async () => {
    mockGetItemAsync.mockResolvedValue('stored-value');
    
    const { result } = renderHook(() => useStorageState('testKey'));
    
    await waitFor(() => {
      const [[isLoading, value]] = result.current;
      expect(isLoading).toBe(false);
      expect(value).toBe('stored-value');
    });

    expect(mockGetItemAsync).toHaveBeenCalledWith('testKey');
  });

  it('stores value using setValue', async () => {
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useStorageState('testKey'));
    
    await waitFor(() => {
      const [[isLoading]] = result.current;
      expect(isLoading).toBe(false);
    });

    const [, setValue] = result.current;
    
    act(() => {
      setValue('new-value');
    });

    await waitFor(() => {
      expect(mockSetItemAsync).toHaveBeenCalledWith('testKey', 'new-value');
    });
  });

  it('deletes value when setting to null', async () => {
    mockGetItemAsync.mockResolvedValue('existing-value');
    mockDeleteItemAsync.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useStorageState('testKey'));
    
    await waitFor(() => {
      const [[isLoading]] = result.current;
      expect(isLoading).toBe(false);
    });

    const [, setValue] = result.current;
    
    act(() => {
      setValue(null);
    });

    await waitFor(() => {
      expect(mockDeleteItemAsync).toHaveBeenCalledWith('testKey');
    });
  });

  it('handles web platform with localStorage', async () => {
    Platform.OS = 'web';
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('web-value'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    const { result } = renderHook(() => useStorageState('webKey'));
    
    await waitFor(() => {
      const [[isLoading, value]] = result.current;
      expect(isLoading).toBe(false);
      expect(value).toBe('web-value');
    });

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('webKey');
  });

  it('handles localStorage errors gracefully', async () => {
    Platform.OS = 'web';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      writable: true,
    });

    renderHook(() => useStorageState('errorKey'));
    
    // Should not throw, just log error
    await waitFor(() => {
      expect(consoleErrorSpy).not.toHaveBeenCalled(); // localStorage is undefined, not throwing
    });

    consoleErrorSpy.mockRestore();
  });
});

describe('setStorageItemAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('sets item in SecureStore on native platform', async () => {
    mockSetItemAsync.mockResolvedValue(undefined);
    
    await setStorageItemAsync('key', 'value');
    
    expect(mockSetItemAsync).toHaveBeenCalledWith('key', 'value');
  });

  it('deletes item in SecureStore when value is null', async () => {
    mockDeleteItemAsync.mockResolvedValue(undefined);
    
    await setStorageItemAsync('key', null);
    
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('key');
  });

  it('sets item in localStorage on web platform', async () => {
    Platform.OS = 'web';
    const mockLocalStorage = {
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    await setStorageItemAsync('webKey', 'webValue');
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('webKey', 'webValue');
  });

  it('removes item from localStorage when value is null on web', async () => {
    Platform.OS = 'web';
    const mockLocalStorage = {
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    await setStorageItemAsync('webKey', null);
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('webKey');
  });
});
