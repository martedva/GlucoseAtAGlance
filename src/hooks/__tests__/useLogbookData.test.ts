import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLogbookData } from '../useLogbookData';
import { getLibreLogbook } from '@/api/libre/logbook-api';
import { authService } from '@/services/authService';

vi.mock('@/api/libre/logbook-api');
vi.mock('@/services/authService');

describe('useLogbookData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chrome.storage.local.clear();
  });

  it('fetches logbook data on mount', async () => {
    vi.mocked(authService.getPatientId).mockResolvedValue('test-patient-id');
    vi.mocked(getLibreLogbook).mockResolvedValue({
      status: 0,
      data: [],
      ticket: { token: 'test', expires: 0, duration: 0 },
    });

    const { result } = renderHook(() => useLogbookData());

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getLibreLogbook).toHaveBeenCalledWith('test-patient-id');
  });

  it('handles authentication error', async () => {
    vi.mocked(authService.getPatientId).mockResolvedValue(null);

    const { result } = renderHook(() => useLogbookData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Not authenticated');
    });
  });

  it('handles API error', async () => {
    vi.mocked(authService.getPatientId).mockResolvedValue('test-patient-id');
    vi.mocked(getLibreLogbook).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useLogbookData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('API error');
    });
  });

  it('uses cached data when available and not expired', async () => {
    const cachedData = {
      status: 0,
      data: [{ value: 7.5, Timestamp: '/Date(' + Date.now() + ')/' }],
      ticket: { token: 'test', expires: 0, duration: 0 },
    };

    await chrome.storage.local.set({
      logbook_data: cachedData,
      logbook_timestamp: Date.now(),
    });

    vi.mocked(authService.getPatientId).mockResolvedValue('test-patient-id');

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

    vi.mocked(authService.getPatientId).mockResolvedValue('test-patient-id');
    vi.mocked(getLibreLogbook).mockResolvedValue({
      status: 0,
      data: [{ value: 8.0, Timestamp: '/Date(' + Date.now() + ')/' }],
      ticket: { token: 'test', expires: 0, duration: 0 },
    });

    const { result } = renderHook(() => useLogbookData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getLibreLogbook).toHaveBeenCalled();
  });
});