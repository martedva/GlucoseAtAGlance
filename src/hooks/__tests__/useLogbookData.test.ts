import { renderHook, waitFor } from '@testing-library/react';
import { useLogbookData } from '../useLogbookData';
import { getLibreLogbook } from '@/api/libre/logbook-api';
import { authService } from '@/services/authService';

jest.mock('@/api/libre/logbook-api');
jest.mock('@/services/authService');

describe('useLogbookData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.storage.local.clear();
  });

  it('fetches logbook data on mount', async () => {
    (authService.getPatientId as jest.Mock).mockResolvedValue('test-patient-id');
    (getLibreLogbook as jest.Mock).mockResolvedValue({
      status: 0,
      data: [],
      ticket: { token: 'test', expires: 0, duration: 0 },
    });

    const { result } = renderHook(() => useLogbookData());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getLibreLogbook).toHaveBeenCalledWith('test-patient-id');
  });

  it('handles authentication error', async () => {
    (authService.getPatientId as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useLogbookData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Not authenticated');
    });
  });

  it('handles API error', async () => {
    (authService.getPatientId as jest.Mock).mockResolvedValue('test-patient-id');
    (getLibreLogbook as jest.Mock).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useLogbookData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('API error');
    });
  });

  it('uses cached data when available and not expired', async () => {
    const cachedData = {
      status: 0,
      data: [{ value: 7.5, Timestamp: new Date().toISOString() }],
      ticket: { token: 'test', expires: 0, duration: 0 },
    };

    await chrome.storage.local.set({
      logbook_data: cachedData,
      logbook_timestamp: Date.now(),
    });

    (authService.getPatientId as jest.Mock).mockResolvedValue('test-patient-id');

    const { result } = renderHook(() => useLogbookData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(getLibreLogbook).not.toHaveBeenCalled();
  });

  it('fetches new data when cache is expired', async () => {
    const expiredTimestamp = Date.now() - 31 * 60 * 1000; // 31 minutes ago
    await chrome.storage.local.set({
      logbook_data: { status: 0, data: [] },
      logbook_timestamp: expiredTimestamp,
    });

    (authService.getPatientId as jest.Mock).mockResolvedValue('test-patient-id');
    (getLibreLogbook as jest.Mock).mockResolvedValue({
      status: 0,
      data: [{ value: 8.0 }],
      ticket: { token: 'test', expires: 0, duration: 0 },
    });

    const { result } = renderHook(() => useLogbookData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getLibreLogbook).toHaveBeenCalled();
  });
});