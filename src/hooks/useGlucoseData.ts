import { useCallback, useState, useMemo } from 'react';
import type { LibreViewResponse, GraphDataPoint } from '@/types/api';
import { parseLibreTimestamp } from '@/types/api';

export interface TransformedGraphDataPoint {
  time: Date;
  value: number;
}

interface GlucoseDataMessage {
  data?: LibreViewResponse['data'];
  error?: string;
}

export interface UseGlucoseDataReturn {
  data: LibreViewResponse | null;
  graphData: TransformedGraphDataPoint[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: Date | null;
  fetchData: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for fetching glucose data from LibreLinkUp API
 * Communicates with background script for API calls
 * Tracks last successful fetch time for data freshness monitoring
 * Transforms raw API data into graph-ready format
 */
export function useGlucoseData(): UseGlucoseDataReturn {
  const [data, setData] = useState<LibreViewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await new Promise<GlucoseDataMessage>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: 'GetLibreViewData' },
          (response: GlucoseDataMessage) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data received');
      }

      setData({ data: response.data } as LibreViewResponse);
      setLastFetchTime(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load glucose data';
      setError(errorMessage);
      // Don't clear data on error - show stale data with warning instead
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Transform raw API data to graph-ready format, filtering to recent data only
  const graphData: TransformedGraphDataPoint[] = useMemo(() => {
    if (!data?.data.graphData) return [];
    
    // Filter to show only recent data (last 6 hours) to avoid showing old historical data
    const now = Date.now();
    const sixHoursAgo = now - (6 * 60 * 60 * 1000);
    
    return data.data.graphData
      .map((item) => ({
        time: parseLibreTimestamp(item.Timestamp),
        value: item.Value,
      }))
      .filter((point) => point.time.getTime() > sixHoursAgo);
  }, [data?.data.graphData]);

  return {
    data,
    graphData,
    isLoading,
    error,
    lastFetchTime,
    fetchData,
    clearError,
  };
}
