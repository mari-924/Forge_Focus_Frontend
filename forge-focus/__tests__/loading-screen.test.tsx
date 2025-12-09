import React from 'react';
import { render, screen } from '@testing-library/react-native';


jest.mock('expo-image', () => ({
  Image: ({ testID, source }: any) => {
    const { View } = require('react-native');
    return <View testID={testID} />;
  },
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = () => ({
    start: jest.fn(),
  });
  RN.Animated.loop = (anim: any) => ({
    start: jest.fn(),
  });
  return RN;
});

import LoadingScreen from '@/components/LoadingScreen';

describe('LoadingScreen Component', () => {
  it('renders the loading screen', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Preparing your workspace...')).toBeTruthy();
  });

  it('displays loading text', () => {
    render(<LoadingScreen />);
    const loadingText = screen.getByText('Preparing your workspace...');
    expect(loadingText).toBeTruthy();
  });

  it('renders ActivityIndicator', () => {
    const { UNSAFE_getByType } = render(<LoadingScreen />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    expect(indicator).toBeTruthy();
  });

  it('sets ActivityIndicator to large size', () => {
    const { UNSAFE_getByType } = render(<LoadingScreen />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    expect(indicator.props.size).toBe('large');
  });

  it('sets ActivityIndicator color to white', () => {
    const { UNSAFE_getByType } = render(<LoadingScreen />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    expect(indicator.props.color).toBe('#FFFFFF');
  });
});
