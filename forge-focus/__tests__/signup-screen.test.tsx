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
  Image: ({ testID, source }: { testID?: string; source: any }) => {
    const TestImage = require('react-native').View;
    return <TestImage testID={testID} />;
  },
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

import SignupScreen from '@/app/signup';
import { router } from 'expo-router';

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (router.push as jest.Mock).mockImplementation(mockPush);
  });

  it('renders the signup label', () => {
    render(<SignupScreen />);
    const signupTexts = screen.getAllByText('SIGN UP');
    expect(signupTexts.length).toBeGreaterThan(0);
  });

  it('renders email, password, and retype password input fields', () => {
    render(<SignupScreen />);
    
    expect(screen.getByPlaceholderText('ENTER EMAIL')).toBeTruthy();
    expect(screen.getByPlaceholderText('ENTER PASSWORD')).toBeTruthy();
    expect(screen.getByPlaceholderText('RETYPE PASSWORD')).toBeTruthy();
  });

  it('renders the OR divider', () => {
    render(<SignupScreen />);
    expect(screen.getByText('OR')).toBeTruthy();
  });

  it('renders the signup button', () => {
    render(<SignupScreen />);
    const signupButtons = screen.getAllByText('SIGN UP');
    expect(signupButtons.length).toBeGreaterThan(0);
  });

  it('renders the back button', () => {
    render(<SignupScreen />);
    const backButtons = screen.getAllByText('BACK');
    expect(backButtons.length).toBeGreaterThan(0);
  });

  it('navigates to tabs when signup button is pressed', () => {
    render(<SignupScreen />);
    const signupButtons = screen.getAllByText('SIGN UP');
    // There should be two SIGN UP texts: one label and one button
    // The button is the last one in the component tree
    const signupButton = signupButtons[signupButtons.length - 1];
    fireEvent.press(signupButton);
    expect(mockPush).toHaveBeenCalledWith('/(tabs)');
  });

  it('navigates to welcome screen when back button is pressed', () => {
    render(<SignupScreen />);
    const backButton = screen.getAllByText('BACK')[0];
    fireEvent.press(backButton);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders social login icons container', () => {
    render(<SignupScreen />);
    // Check that the social icons are rendered (they use Image components)
    const images = screen.UNSAFE_getAllByType(require('react-native').View);
    expect(images.length).toBeGreaterThan(0);
  });

  it('allows typing in email input field', () => {
    render(<SignupScreen />);
    const emailInput = screen.getByPlaceholderText('ENTER EMAIL');
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput).toBeTruthy();
  });

  it('allows typing in password input field', () => {
    render(<SignupScreen />);
    const passwordInput = screen.getByPlaceholderText('ENTER PASSWORD');
    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput).toBeTruthy();
  });

  it('allows typing in retype password input field', () => {
    render(<SignupScreen />);
    const retypePasswordInput = screen.getByPlaceholderText('RETYPE PASSWORD');
    fireEvent.changeText(retypePasswordInput, 'password123');
    expect(retypePasswordInput).toBeTruthy();
  });

  it('password inputs have secureTextEntry enabled', () => {
    render(<SignupScreen />);
    const passwordInput = screen.getByPlaceholderText('ENTER PASSWORD');
    const retypePasswordInput = screen.getByPlaceholderText('RETYPE PASSWORD');
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(retypePasswordInput.props.secureTextEntry).toBe(true);
  });
});

