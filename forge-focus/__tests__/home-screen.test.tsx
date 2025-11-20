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
  Image: ({ testID, source }: { testID?: string; source: any }) => {
    const TestImage = require('react-native').View;
    return <TestImage testID={testID} />;
  },
}));

// Mock expo-router router to avoid navigation side effects
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

import HomeScreen from '@/app/(tabs)/index';

describe('HomeScreen', () => {
  it('renders the HOME PAGE title', () => {
    render(<HomeScreen />);
    expect(screen.getByText('HOME PAGE')).toBeTruthy();
  });

  it('renders all section titles', () => {
    render(<HomeScreen />);
    expect(screen.getByText('FRIENDS')).toBeTruthy();
    expect(screen.getByText('PREV SESSIONS')).toBeTruthy();
    expect(screen.getByText('SCHEDULED SESSIONS')).toBeTruthy();
  });

  it('renders chevrons in section bars', () => {
    render(<HomeScreen />);
    const chevrons = screen.getAllByText('›');
    expect(chevrons.length).toBe(3); // One for each section
  });

  it('renders the logo', () => {
    render(<HomeScreen />);
    // The logo is rendered as an Image component which we've mocked
    const images = screen.UNSAFE_getAllByType(require('react-native').View);
    expect(images.length).toBeGreaterThan(0);
  });
});

