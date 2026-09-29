import { useEffect } from 'react';

interface UseAutoRefreshProps {
  isEnabled: boolean;
  hasData: boolean;
  refreshInterval: number; // in minutes
  onRefresh: () => void;
}

/**
 * Hook for auto-refreshing data at specified intervals
 * Only runs when authenticated and data is available
 */
export function useAutoRefresh({
  isEnabled,
  hasData,
  refreshInterval,
  onRefresh,
}: UseAutoRefreshProps) {
  useEffect(() => {
    if (!isEnabled || !hasData) return;

    const interval = setInterval(onRefresh, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [isEnabled, hasData, refreshInterval, onRefresh]);
}