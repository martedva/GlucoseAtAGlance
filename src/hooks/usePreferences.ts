import { useCallback, useEffect, useState } from 'react';
import type { UserPreferences } from '@/components/SettingsPanel';

const STORAGE_KEY = 'user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  refreshInterval: 5,
};

interface UsePreferencesReturn {
  preferences: UserPreferences;
  savePreferences: (prefs: UserPreferences) => Promise<void>;
  resetPreferences: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook for managing user preferences with localStorage persistence
 */
export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from storage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        if (result[STORAGE_KEY]) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...result[STORAGE_KEY] });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to storage
  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: prefs });
      setPreferences(prefs);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }, []);

  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    try {
      await chrome.storage.local.remove([STORAGE_KEY]);
      setPreferences(DEFAULT_PREFERENCES);
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw error;
    }
  }, []);

  return {
    preferences,
    savePreferences,
    resetPreferences,
    isLoading,
  };
}
