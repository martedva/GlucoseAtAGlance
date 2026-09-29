// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Storage data persists across test runs
const storageData: Record<string, unknown> = {};

// Track calls for verification
const mockCalls = {
  get: [] as Array<{ keys: string[] | string }>,
  set: [] as Array<{ items: Record<string, unknown> }>,
  remove: [] as Array<{ keys: string[] }>,
  sendMessage: [] as Array<{ message: unknown }>,
};

// Create mock functions once - these persist across tests
const mockGet = vi.fn((keys: string[] | string): Promise<Record<string, unknown>> => {
  mockCalls.get.push({ keys });
  const result: Record<string, unknown> = {};
  const keyList = Array.isArray(keys) ? keys : [keys];

  for (const key of keyList) {
    if (key in storageData) {
      result[key] = storageData[key];
    }
  }

  return Promise.resolve(result);
});

const mockSet = vi.fn((items: Record<string, unknown>): Promise<void> => {
  mockCalls.set.push({ items });
  Object.assign(storageData, items);
  return Promise.resolve();
});

const mockRemove = vi.fn((keys: string[]): Promise<void> => {
  mockCalls.remove.push({ keys });
  for (const key of keys) {
    delete storageData[key];
  }
  return Promise.resolve();
});

const mockSendMessage = vi.fn((message: unknown, callback: (response: unknown) => void) => {
  mockCalls.sendMessage.push({ message });
  callback({});
});

// Mock chrome API for testing
global.chrome = {
  storage: {
    local: {
      get: mockGet,
      set: mockSet,
      remove: mockRemove,
      clear: vi.fn((): Promise<void> => {
        Object.keys(storageData).forEach((key) => {
          delete storageData[key];
        });
        return Promise.resolve();
      }),
    },
  },
  runtime: {
    sendMessage: mockSendMessage,
    lastError: undefined,
    onMessage: {
      addListener: vi.fn(),
    },
  },
  alarms: {
    create: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
  action: {
    setIcon: vi.fn(),
  },
} as unknown as typeof chrome;

// Helper to set storage data for tests
(global as unknown as Record<string, unknown>).setStorageData = (key: string, value: unknown) => {
  storageData[key] = value;
};

// Helper to clear storage data and mock calls (but NOT the mock implementations)
(global as unknown as Record<string, unknown>).clearStorageData = () => {
  Object.keys(storageData).forEach((key) => {
    delete storageData[key];
  });
  Object.keys(mockCalls).forEach((key) => {
    mockCalls[key as keyof typeof mockCalls] = [];
  });
  mockGet.mockClear();
  mockSet.mockClear();
  mockRemove.mockClear();
  mockSendMessage.mockClear();
};

// Helper to get storage data for verification
(global as unknown as Record<string, unknown>).getStorageData = (): Record<string, unknown> => {
  return { ...storageData };
};

// Helper to get mock calls for verification
(global as unknown as Record<string, unknown>).getMockCalls = () => {
  return { ...mockCalls };
};

// Expose mock functions for advanced testing
(global as unknown as Record<string, unknown>).getMockFunctions = () => ({
  get: mockGet,
  set: mockSet,
  remove: mockRemove,
  sendMessage: mockSendMessage,
});