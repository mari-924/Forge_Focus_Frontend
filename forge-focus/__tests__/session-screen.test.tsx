import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';

jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('@expo-google-fonts/hammersmith-one', () => ({
  HammersmithOne_400Regular: {},
}));

jest.mock('expo-image', () => ({
  Image: ({ testID, source }: { testID?: string; source: any }) => {
    const TestImage = require('react-native').View;
    return <TestImage testID={testID} />;
  },
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
  useLocalSearchParams: jest.fn(() => ({
    duration: '30',
    sessionId: '123',
    from: 'explore',
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
}));

global.fetch = jest.fn();

import SessionScreen from '@/app/(tabs)/session';
import { router, useLocalSearchParams } from 'expo-router';

describe('SessionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (router.push as jest.Mock).mockImplementation(mockPush);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the FOCUS SESSION title', () => {
    render(<SessionScreen />);
    expect(screen.getByText('FOCUS SESSION')).toBeTruthy();
  });

  it('displays initial timer value based on duration param', () => {
    render(<SessionScreen />);
    expect(screen.getByText('30:00')).toBeTruthy();
  });

  it('renders control buttons', () => {
    render(<SessionScreen />);
    expect(screen.getByText('START')).toBeTruthy();
    expect(screen.getByText('RESET')).toBeTruthy();
    expect(screen.getByText('END SESSION')).toBeTruthy();
  });

  it('changes START button to PAUSE when timer is playing', () => {
    render(<SessionScreen />);
    const startButton = screen.getByText('START');
    fireEvent.press(startButton);
    expect(screen.getByText('PAUSE')).toBeTruthy();
  });

  it('counts down when START is pressed', () => {
    render(<SessionScreen />);
    const startButton = screen.getByText('START');
    
    act(() => {
      fireEvent.press(startButton);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('29:59')).toBeTruthy();
  });

  it('pauses timer when PAUSE is pressed', () => {
    render(<SessionScreen />);
    
    act(() => {
      fireEvent.press(screen.getByText('START'));
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      fireEvent.press(screen.getByText('PAUSE'));
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('29:59')).toBeTruthy();
  });

  it('resets timer when RESET is pressed', () => {
    render(<SessionScreen />);
    
    act(() => {
      fireEvent.press(screen.getByText('START'));
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    act(() => {
      fireEvent.press(screen.getByText('RESET'));
    });

    expect(screen.getByText('30:00')).toBeTruthy();
    expect(screen.getByText('START')).toBeTruthy();
  });

  it('calls complete session API when END SESSION is pressed', async () => {
    render(<SessionScreen />);
    
    const endButton = screen.getByText('END SESSION');
    
    await act(async () => {
      fireEvent.press(endButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions/123/complete'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-jwt-token',
          }),
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('handles different duration values', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      duration: '60',
      sessionId: '456',
    });

    render(<SessionScreen />);
    expect(screen.getByText('60:00')).toBeTruthy();
  });

  it('handles missing sessionId gracefully', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      duration: '30',
      sessionId: undefined,
    });

    render(<SessionScreen />);
    
    const endButton = screen.getByText('END SESSION');
    
    await act(async () => {
      fireEvent.press(endButton);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('stops timer when reaching 0', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      duration: '0.1',
      sessionId: '123',
    });

    render(<SessionScreen />);
    
    act(() => {
      fireEvent.press(screen.getByText('START'));
    });

    act(() => {
      jest.advanceTimersByTime(7000);
    });

    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('formats time correctly', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      duration: '5',
      sessionId: '123',
    });

    render(<SessionScreen />);
    
    expect(screen.getByText('05:00')).toBeTruthy();
    
    act(() => {
      fireEvent.press(screen.getByText('START'));
    });

    act(() => {
      jest.advanceTimersByTime(65000);
    });

    expect(screen.getByText('03:55')).toBeTruthy();
  });
});
