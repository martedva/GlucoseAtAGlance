import { useCallback, useEffect, useState } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'stale';

interface UseConnectionStatusReturn {
  status: ConnectionStatus;
  lastSuccessfulFetch: Date | null;
  isOnline: boolean;
  isStale: boolean;
  checkConnection: () => void;
}

/**
 * Hook for monitoring connection status and data freshness
 * Critical for medical data - users must know if data is outdated
 */
export function useConnectionStatus(
  refreshIntervalMinutes: number,
  lastFetchTime: Date | null
): UseConnectionStatusReturn {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check if data is stale based on refresh interval
  const checkDataFreshness = useCallback(() => {
    if (!lastFetchTime) {
      setStatus('offline');
      return;
    }

    const now = new Date();
    const timeSinceFetch = now.getTime() - lastFetchTime.getTime();
    const staleThreshold = refreshIntervalMinutes * 60 * 1000 * 2; // 2x refresh interval

    if (timeSinceFetch > staleThreshold) {
      setStatus('stale');
    } else if (isOnline) {
      setStatus('online');
    }
  }, [lastFetchTime, refreshIntervalMinutes, isOnline]);

  // Update last successful fetch time
  useEffect(() => {
    if (lastFetchTime) {
      setLastSuccessfulFetch(lastFetchTime);
      setStatus('online');
    }
  }, [lastFetchTime]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (lastFetchTime) {
        checkDataFreshness();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lastFetchTime, checkDataFreshness]);

  // Periodically check data freshness
  useEffect(() => {
    const interval = setInterval(checkDataFreshness, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [checkDataFreshness]);

  const checkConnection = useCallback(() => {
    checkDataFreshness();
  }, [checkDataFreshness]);

  return {
    status,
    lastSuccessfulFetch,
    isOnline,
    isStale: status === 'stale',
    checkConnection,
  };
}
