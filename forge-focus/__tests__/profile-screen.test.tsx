import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

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

const mockSignOut = jest.fn();
jest.mock('@/hooks/ctx', () => ({
  useSession: jest.fn(() => ({
    signOut: mockSignOut,
    session: 'test@example.com',
  })),
}));

jest.mock('@/hooks/useProfile', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    profile: {
      user: {
        username: 'TestUser',
        email: 'test@example.com',
        profile_pic: 'https://example.com/avatar.jpg',
      },
    },
  })),
}));

import ProfileScreen from '@/app/(tabs)/profile';
import useProfile from '@/hooks/useProfile';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the PROFILE title', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('PROFILE')).toBeTruthy();
  });

  it('renders the logout button', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('LOGOUT')).toBeTruthy();
  });

  it('renders username and email from profile', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('TestUser')).toBeTruthy();
    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  it('renders streak stats section', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('FOCUS STREAK')).toBeTruthy();
    expect(screen.getByText('HIGHEST STREAK')).toBeTruthy();
  });

  it('renders activity section', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('YOUR ACTIVITY')).toBeTruthy();
    expect(screen.getByText('TASKS COMPLETED: TODAY')).toBeTruthy();
    expect(screen.getByText('TASKS COMPLETED: ALL TIME')).toBeTruthy();
  });

  it('renders friends section', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('FRIENDS')).toBeTruthy();
    expect(screen.getByText('Add Friends')).toBeTruthy();
  });

  it('calls signOut when logout button is pressed', () => {
    render(<ProfileScreen />);
    const logoutButton = screen.getByText('LOGOUT');
    fireEvent.press(logoutButton);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('displays stat values correctly', () => {
    render(<ProfileScreen />);
    const values = screen.getAllByText('0');
    expect(values.length).toBeGreaterThan(0);
    expect(screen.getByText('15')).toBeTruthy();
    expect(screen.getByText('150')).toBeTruthy();
  });

  it('renders chevron in friends section', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('›')).toBeTruthy();
  });

  it('renders add friend plus icon', () => {
    render(<ProfileScreen />);
    expect(screen.getByText('+')).toBeTruthy();
  });

  it('handles missing profile picture gracefully', () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: {
        user: {
          username: 'NoAvatarUser',
          email: 'noavatar@example.com',
          profile_pic: null,
        },
      },
    });

    render(<ProfileScreen />);
    expect(screen.getByText('NoAvatarUser')).toBeTruthy();
    expect(screen.getByText('noavatar@example.com')).toBeTruthy();
  });

  it('handles undefined profile gracefully', () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: null,
    });

    const { queryByText } = render(<ProfileScreen />);
    expect(screen.getByText('PROFILE')).toBeTruthy();
    expect(screen.getByText('LOGOUT')).toBeTruthy();
  });
});
