// Test utilities for Chrome extension testing

/**
 * Get the mock chrome storage
 */
export const getMockChromeStorage = () => {
  return global.chrome.storage.local;
};

/**
 * Get the mock chrome runtime
 */
export const getMockChromeRuntime = () => {
  return global.chrome.runtime;
};

/**
 * Clear all mocks and storage data
 */
export const cleanupChromeMocks = () => {
  const globals = global as unknown as Record<string, () => void>;
  globals.clearStorageData?.();
};

/**
 * Helper to set storage data for tests
 */
export const setStorageData = (key: string, value: unknown) => {
  const globals = global as unknown as Record<string, (key: string, value: unknown) => void>;
  globals.setStorageData?.(key, value);
};

/**
 * Helper to get all storage data for verification
 */
export const getStorageData = (): Record<string, unknown> => {
  const globals = global as unknown as Record<string, () => Record<string, unknown>>;
  return globals.getStorageData?.() || {};
};

/**
 * Helper to get mock call history
 */
export const getMockCalls = (): {
  get: Array<{ keys: string[] | string }>;
  set: Array<{ items: Record<string, unknown> }>;
  remove: Array<{ keys: string[] }>;
  sendMessage: Array<{ message: unknown }>;
} => {
  const globals = global as unknown as Record<
    string,
    () => {
      get: Array<{ keys: string[] | string }>;
      set: Array<{ items: Record<string, unknown> }>;
      remove: Array<{ keys: string[] }>;
      sendMessage: Array<{ message: unknown }>;
    }
  >;
  return globals.getMockCalls?.() || {
    get: [],
    set: [],
    remove: [],
    sendMessage: [],
  };
};

/**
 * Helper to get mock functions for advanced testing
 */
export const getMockFunctions = (): {
  get: jest.MockedFunction<typeof chrome.storage.local.get>;
  set: jest.MockedFunction<typeof chrome.storage.local.set>;
  remove: jest.MockedFunction<typeof chrome.storage.local.remove>;
  sendMessage: jest.MockedFunction<typeof chrome.runtime.sendMessage>;
} => {
  const globals = global as unknown as Record<
    string,
    () => {
      get: jest.MockedFunction<typeof chrome.storage.local.get>;
      set: jest.MockedFunction<typeof chrome.storage.local.set>;
      remove: jest.MockedFunction<typeof chrome.storage.local.remove>;
      sendMessage: jest.MockedFunction<typeof chrome.runtime.sendMessage>;
    }
  >;
  return globals.getMockFunctions?.() || {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    sendMessage: jest.fn(),
  };
};