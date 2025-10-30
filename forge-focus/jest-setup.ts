import '@testing-library/jest-native/extend-expect';

// Basic mock for expo-web-browser used in OAuth flows
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));


