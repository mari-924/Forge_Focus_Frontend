import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock fonts to always be loaded in tests
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

// Mock google fonts module export
jest.mock('@expo-google-fonts/hammersmith-one', () => ({
  HammersmithOne_400Regular: {},
}));

// Mock expo-image with a basic React component
jest.mock('expo-image', () => ({
  Image: ({}) => null,
}));

// Mock expo-router router to avoid navigation side effects
const mockPush = jest.fn();

jest.mock('expo-router', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => false),
  };
  return {
    router: mockRouter,
    useRouter: () => mockRouter,
  };
});

import WelcomeScreen from '@/app/index';
import { router } from 'expo-router';

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (router.push as jest.Mock).mockImplementation(mockPush);
  });

  it('renders the primary actions and skip text', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText('LOGIN')).toBeTruthy();
    expect(screen.getByText('SIGN UP')).toBeTruthy();
    expect(screen.getByText('SKIP?')).toBeTruthy();
  });

  it('navigates to login screen when LOGIN button is pressed', () => {
    render(<WelcomeScreen />);
    const loginButton = screen.getByText('LOGIN');
    fireEvent.press(loginButton);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('navigates to signup screen when SIGN UP button is pressed', () => {
    render(<WelcomeScreen />);
    const signupButton = screen.getByText('SIGN UP');
    fireEvent.press(signupButton);
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });

  it('navigates to tabs when SKIP? is pressed', () => {
    render(<WelcomeScreen />);
    const skipButton = screen.getByText('SKIP?');
    fireEvent.press(skipButton);
    expect(mockPush).toHaveBeenCalledWith('/(tabs)');
  });
});


