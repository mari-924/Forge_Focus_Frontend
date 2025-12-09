import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfilePic } from '@/components/ProfilePic';

describe('ProfilePic Component', () => {
  it('renders nothing when uri is null', () => {
    const { toJSON } = render(<ProfilePic uri={null} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when uri is undefined', () => {
    const { toJSON } = render(<ProfilePic uri={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it('renders nothing when uri is empty string', () => {
    const { toJSON } = render(<ProfilePic uri="" />);
    expect(toJSON()).toBeNull();
  });

  it('renders image when valid uri is provided', () => {
    const { UNSAFE_getByType } = render(
      <ProfilePic uri="https://example.com/avatar.jpg" />
    );
    const Image = require('react-native').Image;
    const imageElement = UNSAFE_getByType(Image);
    expect(imageElement).toBeTruthy();
  });

  it('uses default size of 50 when size prop not provided', () => {
    const { UNSAFE_getByType } = render(
      <ProfilePic uri="https://example.com/avatar.jpg" />
    );
    const Image = require('react-native').Image;
    const imageElement = UNSAFE_getByType(Image);
    expect(imageElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 50, height: 50 }),
      ])
    );
  });

  it('uses custom size when provided', () => {
    const { UNSAFE_getByType } = render(
      <ProfilePic uri="https://example.com/avatar.jpg" size={100} />
    );
    const Image = require('react-native').Image;
    const imageElement = UNSAFE_getByType(Image);
    expect(imageElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 100, height: 100 }),
      ])
    );
  });

  it('renders with small size', () => {
    const { UNSAFE_getByType } = render(
      <ProfilePic uri="https://example.com/avatar.jpg" size={30} />
    );
    const Image = require('react-native').Image;
    const imageElement = UNSAFE_getByType(Image);
    expect(imageElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 30, height: 30 }),
      ])
    );
  });

  it('renders with large size', () => {
    const { UNSAFE_getByType } = render(
      <ProfilePic uri="https://example.com/avatar.jpg" size={150} />
    );
    const Image = require('react-native').Image;
    const imageElement = UNSAFE_getByType(Image);
    expect(imageElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 150, height: 150 }),
      ])
    );
  });

  it('sets correct image source', () => {
    const testUri = 'https://example.com/test-avatar.jpg';
    const { UNSAFE_getByType } = render(<ProfilePic uri={testUri} />);
    const Image = require('react-native').Image;
    const imageElement = UNSAFE_getByType(Image);
    expect(imageElement.props.source).toEqual({ uri: testUri });
  });
});
