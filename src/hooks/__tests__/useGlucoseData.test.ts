import { act, renderHook, waitFor } from '@testing-library/react';
import type { LibreViewResponse } from '@/types/api';
import { cleanupChromeMocks, getMockChromeRuntime } from '../../test-utils';
import { useGlucoseData } from '../useGlucoseData';

const mockGlucoseData: LibreViewResponse['data'] = {
  connection: {
    id: 'connection-1',
    patientId: 'patient-1',
    country: 'US',
    status: 1,
    firstName: 'John',
    lastName: 'Doe',
    targetLow: 70,
    targetHigh: 180,
    uom: 1,
    sensor: {
      sn: 'SN123456',
      a: Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60), // 7 days ago
      e: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60), // 7 days from now
    },
    alarmRules: {
      c: false,
      h: { on: false, th: 0, thmm: 0, d: 0, f: 0 },
      f: { th: 0, thmm: 0, d: 0, tl: 0, tlmm: 0 },
      l: { on: false, th: 0, thmm: 0, d: 0, tl: 0, tlmm: 0 },
      nd: { i: 0, r: 0, l: 0 },
      p: 0,
      r: 0,
      std: {},
    },
    glucoseMeasurement: {
      Value: 5.5,
      TrendArrow: 1,
      MeasurementColor: 1,
      Timestamp: new Date(),
    },
    glucoseItem: {
      Value: 5.5,
      TrendArrow: 1,
      MeasurementColor: 1,
      Timestamp: new Date(),
    },
    glucoseAlarm: 'none',
    patientDevice: {
      did: 'device-1',
      dtid: 1,
      v: '1.0',
      l: false,
      ll: 0,
      h: false,
      hl: 0,
      u: 0,
      fixedLowAlarmValues: {
        f: 0,
        ft: 0,
      },
      alarms: false,
      fixedLowThreshold: 0,
    },
    created: Date.now(),
  },
  graphData: [
    {
      Timestamp: new Date(Date.now() - 60 * 60 * 1000),
      Value: 5.2,
      TrendArrow: 1,
      MeasurementColor: 1,
    },
    {
      Timestamp: new Date(Date.now() - 30 * 60 * 1000),
      Value: 5.5,
      TrendArrow: 1,
      MeasurementColor: 1,
    },
    {
      Timestamp: new Date(),
      Value: 5.8,
      TrendArrow: 1,
      MeasurementColor: 1,
    },
  ],
  activeSensors: [
    {
      sn: 'SN123456',
      a: Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60),
      e: Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60),
    },
  ],
};

describe('useGlucoseData', () => {
  beforeEach(() => {
    cleanupChromeMocks();
  });

  afterEach(() => {
    cleanupChromeMocks();
  });

  it('should start with initial state', () => {
    const { result } = renderHook(() => useGlucoseData());

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch glucose data successfully', async () => {
    const mockRuntime = getMockChromeRuntime();
    const { result } = renderHook(() => useGlucoseData());

    mockRuntime.sendMessage.mockImplementation((message, callback) => {
      callback({ data: mockGlucoseData });
    });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.data).toEqual(mockGlucoseData);
  });

  it('should handle error response', async () => {
    const mockRuntime = getMockChromeRuntime();
    const { result } = renderHook(() => useGlucoseData());

    mockRuntime.sendMessage.mockImplementation((message, callback) => {
      callback({ error: 'Session expired' });
    });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Session expired');
    expect(result.current.data).toBeNull();
  });

  it('should handle chrome runtime error', async () => {
    const { result } = renderHook(() => useGlucoseData());

    chrome.runtime.lastError = { message: 'Runtime error' } as any;
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      callback({});
    });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.error).toContain('Runtime error');
    expect(result.current.data).toBeNull();

    chrome.runtime.lastError = undefined;
  });

  it('should handle no data response', async () => {
    const mockRuntime = getMockChromeRuntime();
    const { result } = renderHook(() => useGlucoseData());

    mockRuntime.sendMessage.mockImplementation((message, callback) => {
      callback({});
    });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.error).toBe('No data received');
    expect(result.current.data).toBeNull();
  });

  it('should clear error', async () => {
    const mockRuntime = getMockChromeRuntime();
    const { result } = renderHook(() => useGlucoseData());

    mockRuntime.sendMessage.mockImplementation((message, callback) => {
      callback({ error: 'Some error' });
    });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
