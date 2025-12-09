import '@testing-library/jest-native/extend-expect';

// Basic mock for expo-web-browser used in OAuth flows
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `forgefocus://${path}`),
  parse: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      scheme: 'forgefocus',
      extra: {
        auth0Domain: 'test-domain.auth0.com',
        auth0ClientId: 'test-client-id',
      },
    },
    manifest: {
      scheme: 'forgefocus',
    },
  },
}));

// Mock Google Sign-In module
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({
      type: 'success',
      data: {
        user: {
          id: 'mock-id',
          email: 'mock@example.com',
          name: 'Mock User',
        },
      },
    })),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
  },
  isSuccessResponse: jest.fn((response) => response.type === 'success'),
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock Auth0 hook
jest.mock('./app/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    authorize: jest.fn(() => Promise.resolve({ accessToken: 'mock-token' })),
    clearSession: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock expo-router hooks
jest.mock('expo-router', () => {
  const actualRouter = jest.requireActual('expo-router');
  return {
    ...actualRouter,
    usePathname: jest.fn(() => '/'),
    useLocalSearchParams: jest.fn(() => ({})),
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: jest.fn(() => false),
    },
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn((callback) => {
    // Don't execute the callback in tests by default
  }),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
}));


