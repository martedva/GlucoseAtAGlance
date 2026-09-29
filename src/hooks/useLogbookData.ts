import { useCallback, useState, useEffect, useMemo } from 'react';
import { getLibreLogbook } from '@/api/libre/logbook-api';
import type { LogbookResponse } from '@/types/api';
import { parseLibreTimestamp } from '@/types/api';
import { authService } from '@/services/authService';

export interface TransformedLogbookDataPoint {
  time: Date;
  value: number;
}

const CACHE_KEY = 'logbook_data';
const CACHE_TIMESTAMP_KEY = 'logbook_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface UseLogbookDataReturn {
  data: LogbookResponse | null;
  logbookGraphData: TransformedLogbookDataPoint[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

/**
 * Hook for fetching and caching logbook data from LibreLinkUp API
 * Caches data for 30 minutes to reduce API calls
 * Transforms raw API data into graph-ready format
 */
export function useLogbookData(): UseLogbookDataReturn {
  const [data, setData] = useState<LogbookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Check cache first
    const cachedData = await chrome.storage.local.get([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
    const cacheTimestamp = cachedData[CACHE_TIMESTAMP_KEY];
    const now = Date.now();

    if (cachedData[CACHE_KEY] && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      setData(cachedData[CACHE_KEY]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const patientId = await authService.getPatientId();
      if (!patientId) {
        throw new Error('Not authenticated');
      }

      const response = await getLibreLogbook(patientId);

      if (!response || !response.data) {
        throw new Error('No logbook data received');
      }

      // Cache the data
      await chrome.storage.local.set({
        [CACHE_KEY]: response,
        [CACHE_TIMESTAMP_KEY]: now,
      });

      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch logbook data';
      setError(errorMessage);
      // Don't clear cached data on error - show stale data instead
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform raw API data to graph-ready format
  const logbookGraphData: TransformedLogbookDataPoint[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      time: parseLibreTimestamp(item.Timestamp),
      value: item.Value,
    }));
  }, [data?.data]);

  return {
    data,
    logbookGraphData,
    isLoading,
    error,
    fetchData,
  };
}