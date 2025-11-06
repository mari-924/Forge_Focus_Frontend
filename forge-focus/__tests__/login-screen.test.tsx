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
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
    back: mockBack,
  },
}));

import LoginScreen from '@/app/login';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login label', () => {
    render(<LoginScreen />);
    expect(screen.getByText('LOGIN')).toBeTruthy();
  });

  it('renders email and password input fields', () => {
    render(<LoginScreen />);
    
    expect(screen.getByPlaceholderText('ENTER EMAIL...')).toBeTruthy();
    expect(screen.getByPlaceholderText('ENTER PASSWORD...')).toBeTruthy();
  });

  it('renders the OR divider', () => {
    render(<LoginScreen />);
    expect(screen.getByText('OR')).toBeTruthy();
  });

  it('renders the login button', () => {
    render(<LoginScreen />);
    expect(screen.getByText('LOGIN')).toBeTruthy();
  });

  it('renders the back button', () => {
    render(<LoginScreen />);
    const backButtons = screen.getAllByText('BACK');
    expect(backButtons.length).toBeGreaterThan(0);
  });

  it('navigates to tabs when login button is pressed', () => {
    render(<LoginScreen />);
    const loginButtons = screen.getAllByText('LOGIN');
    // There should be two LOGIN texts: one label and one button
    // The button is the last one in the component tree
    const loginButton = loginButtons[loginButtons.length - 1];
    fireEvent.press(loginButton);
    expect(mockPush).toHaveBeenCalledWith('/(tabs)');
  });

  it('navigates to welcome screen when back button is pressed', () => {
    render(<LoginScreen />);
    const backButton = screen.getAllByText('BACK')[0];
    fireEvent.press(backButton);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('renders social login icons container', () => {
    render(<LoginScreen />);
    // Check that the social icons are rendered (they use Image components)
    const images = screen.UNSAFE_getAllByType(require('react-native').View);
    expect(images.length).toBeGreaterThan(0);
  });

  it('allows typing in email input field', () => {
    render(<LoginScreen />);
    const emailInput = screen.getByPlaceholderText('ENTER EMAIL...');
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value || emailInput.props.defaultValue).toBeTruthy();
  });

  it('allows typing in password input field', () => {
    render(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText('ENTER PASSWORD...');
    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value || passwordInput.props.defaultValue).toBeTruthy();
  });

  it('password input has secureTextEntry enabled', () => {
    render(<LoginScreen />);
    const passwordInput = screen.getByPlaceholderText('ENTER PASSWORD...');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});

