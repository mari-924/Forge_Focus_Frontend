import React from 'react';
import { render, screen } from '@testing-library/react-native';

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
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

import WelcomeScreen from '@/app/index';

describe('WelcomeScreen', () => {
  it('renders the primary actions and skip text', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText('LOGIN')).toBeTruthy();
    expect(screen.getByText('SIGN UP')).toBeTruthy();
    expect(screen.getByText('SKIP?')).toBeTruthy();
  });
});


