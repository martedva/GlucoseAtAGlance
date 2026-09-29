import { useEffect } from 'react';

interface UseInitialFetchProps {
  isAuthenticated: boolean;
  hasData: boolean;
  onFetch: () => void;
}

/**
 * Hook to fetch data on initial authentication
 * Triggers a fetch when user becomes authenticated and no data exists
 */
export function useInitialFetch({ isAuthenticated, hasData, onFetch }: UseInitialFetchProps) {
  useEffect(() => {
    if (isAuthenticated && !hasData) {
      onFetch();
    }
  }, [isAuthenticated, hasData, onFetch]);
}