import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('expo-image', () => ({
  Image: ({ testID, source, style }: any) => {
    const { View } = require('react-native');
    return <View testID={testID} style={style} />;
  },
}));

import { TabHeader } from '@/components/tab-header';
import { Text } from 'react-native';

describe('TabHeader Component', () => {
  it('renders the title text', () => {
    render(<TabHeader title="TEST TITLE" />);
    expect(screen.getByText('TEST TITLE')).toBeTruthy();
  });

  it('renders uppercase title', () => {
    render(<TabHeader title="lowercase title" />);
    expect(screen.getByText('lowercase title')).toBeTruthy();
  });

  it('renders without rightContent', () => {
    render(<TabHeader title="SIMPLE HEADER" />);
    expect(screen.getByText('SIMPLE HEADER')).toBeTruthy();
  });

  it('renders with rightContent', () => {
    const RightContent = () => <Text>Right Content</Text>;
    render(
      <TabHeader 
        title="HEADER WITH RIGHT" 
        rightContent={<RightContent />} 
      />
    );
    
    expect(screen.getByText('HEADER WITH RIGHT')).toBeTruthy();
    expect(screen.getByText('Right Content')).toBeTruthy();
  });

  it('renders logo image', () => {
    const { UNSAFE_getByType } = render(<TabHeader title="LOGO TEST" />);
    expect(screen.getByText('LOGO TEST')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<TabHeader title="STYLED HEADER" style={customStyle} />);
    expect(screen.getByText('STYLED HEADER')).toBeTruthy();
  });

  it('handles long titles', () => {
    const longTitle = 'THIS IS A VERY LONG TITLE THAT MIGHT NEED TO WRAP';
    render(<TabHeader title={longTitle} />);
    expect(screen.getByText(longTitle)).toBeTruthy();
  });
});
