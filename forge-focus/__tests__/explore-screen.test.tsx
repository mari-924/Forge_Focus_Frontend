import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

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


const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));


jest.mock('@/hooks/ctx', () => ({
  useSession: jest.fn(() => ({
    session: 'test@example.com',
  })),
}));


jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
}));

global.fetch = jest.fn();

import ExploreScreen from '@/app/(tabs)/explore';
import { router } from 'expo-router';

describe('ExploreScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (router.push as jest.Mock).mockImplementation(mockPush);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 123, title: 'Test Session' }),
    });
  });

  it('renders the FORGE SESSION title', () => {
    render(<ExploreScreen />);
    expect(screen.getByText('FORGE SESSION')).toBeTruthy();
  });

  it('renders all increment options', () => {
    render(<ExploreScreen />);
    expect(screen.getByText('30')).toBeTruthy();
    expect(screen.getByText('45')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
    expect(screen.getByText('60')).toBeTruthy();
  });

  it('renders all audio options', () => {
    render(<ExploreScreen />);
    expect(screen.getByText('NO AUDIO')).toBeTruthy();
    expect(screen.getByText('RAIN')).toBeTruthy();
    expect(screen.getByText('TRAIN')).toBeTruthy();
    expect(screen.getByText('LOFI')).toBeTruthy();
  });

  it('renders section titles', () => {
    render(<ExploreScreen />);
    expect(screen.getByText('Increment By:')).toBeTruthy();
    expect(screen.getByText('Timer:')).toBeTruthy();
    expect(screen.getByText('Audio:')).toBeTruthy();
  });

  it('renders timer with initial value 00:00', () => {
    render(<ExploreScreen />);
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('renders CREATE SESSION and SCHEDULE SESSION buttons', () => {
    render(<ExploreScreen />);
    expect(screen.getByText('CREATE SESSION')).toBeTruthy();
    expect(screen.getByText('SCHEDULE SESSION')).toBeTruthy();
  });

  it('selects an increment when pressed', () => {
    render(<ExploreScreen />);
    const increment30 = screen.getByText('30');
    fireEvent.press(increment30);
  });

  it('selects an audio option when pressed', () => {
    render(<ExploreScreen />);
    const rainOption = screen.getByText('RAIN');
    fireEvent.press(rainOption);
  });

  it('increases timer when up arrow is pressed after selecting increment', () => {
    render(<ExploreScreen />);
    
    const increment30 = screen.getByText('30');
    fireEvent.press(increment30);
    
    const upArrows = screen.getAllByText('⯅');
    fireEvent.press(upArrows[0]);
    
    expect(screen.getByText('30:00')).toBeTruthy();
  });

  it('decreases timer when down arrow is pressed', () => {
    render(<ExploreScreen />);
    
    const increment30 = screen.getByText('30');
    fireEvent.press(increment30);
    
    const upArrows = screen.getAllByText('⯅');
    fireEvent.press(upArrows[0]);
    fireEvent.press(upArrows[0]);
    
    expect(screen.getByText('60:00')).toBeTruthy();
    
    const downArrows = screen.getAllByText('⯆');
    fireEvent.press(downArrows[0]);
    
    expect(screen.getByText('30:00')).toBeTruthy();
  });

  it('does not allow timer to go below 0', () => {
    render(<ExploreScreen />);
    
    const increment30 = screen.getByText('30');
    fireEvent.press(increment30);
    
    const downArrows = screen.getAllByText('⯆');
    fireEvent.press(downArrows[0]);
    
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('creates a session and navigates when CREATE SESSION is pressed', async () => {
    render(<ExploreScreen />);
    
    const increment30 = screen.getByText('30');
    fireEvent.press(increment30);
    
    const upArrows = screen.getAllByText('⯅');
    fireEvent.press(upArrows[0]);
    
    const rainOption = screen.getByText('RAIN');
    fireEvent.press(rainOption);
    
    const createButton = screen.getByText('CREATE SESSION');
    fireEvent.press(createButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/session',
        })
      );
    });
  });

  it('schedules a session when SCHEDULE SESSION is pressed', async () => {
    render(<ExploreScreen />);
    
    const increment30 = screen.getByText('30');
    fireEvent.press(increment30);
    
    const upArrows = screen.getAllByText('⯅');
    fireEvent.press(upArrows[0]);
    
    const scheduleButton = screen.getByText('SCHEDULE SESSION');
    fireEvent.press(scheduleButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('does not create session when timer is 0', async () => {
    render(<ExploreScreen />);
    
    const createButton = screen.getByText('CREATE SESSION');
    fireEvent.press(createButton);
    
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('makes API call with correct parameters', async () => {
    render(<ExploreScreen />);
    
    const increment45 = screen.getByText('45');
    fireEvent.press(increment45);
    
    const upArrows = screen.getAllByText('⯅');
    fireEvent.press(upArrows[0]);
    
    const lofiOption = screen.getByText('LOFI');
    fireEvent.press(lofiOption);
    
    const createButton = screen.getByText('CREATE SESSION');
    fireEvent.press(createButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions?hostEmail='),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-jwt-token',
          }),
          body: expect.stringContaining('"audioFile":"LOFI"'),
        })
      );
    });
  });
});
