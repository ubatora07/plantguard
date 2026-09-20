/* eslint-disable no-undef */
// Mock AsyncStorage for unit tests of the history repository.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock expo-file-system for file lifecycle and orphan cleanup
jest.mock('expo-file-system', () => {
  return {
    Paths: {
      document: 'file:///data/user/0/host.exp.exponent/files',
      cache: 'file:///data/user/0/host.exp.exponent/cache',
    },
    Directory: jest.fn().mockImplementation((path, name) => ({
      uri: `${path}/${name}`,
      exists: true,
      create: jest.fn(),
    })),
    File: jest.fn().mockImplementation((parentOrUri, name) => {
      const uri = name ? `${parentOrUri?.uri || parentOrUri}/${name}` : parentOrUri;
      return {
        uri,
        exists: true,
        delete: jest.fn(),
        copy: jest.fn().mockResolvedValue(undefined),
      };
    }),
    deleteAsync: jest.fn().mockResolvedValue(undefined),
  };
});

// Eagerly trigger winter runtime getters so Jest does not throw out-of-scope require errors
try {
  void globalThis.__ExpoImportMetaRegistry;
  void globalThis.fetch;
  void globalThis.structuredClone;
} catch {}

