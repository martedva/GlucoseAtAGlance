import { useCallback, useEffect, useState } from 'react';

/**
 * Generic hook for reading/writing to Chrome storage
 * @param key - The storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue, isLoaded]
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => Promise<void>, () => Promise<void>, boolean] {
  const [value, setValueState] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load value from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await chrome.storage.local.get([key]);
        if (result[key] !== undefined) {
          setValueState(result[key]);
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadValue();
  }, [key]);

  // Listen for storage changes from other parts of the extension
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[key] && changes[key].newValue !== undefined) {
        setValueState(changes[key].newValue as T);
      } else if (changes[key] && changes[key].newValue === undefined) {
        // Key was removed
        setValueState(defaultValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [key, defaultValue]);

  // Set value in storage
  const setValue = useCallback(
    async (newValue: T) => {
      try {
        await chrome.storage.local.set({ [key]: newValue });
        setValueState(newValue);
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
        throw error;
      }
    },
    [key]
  );

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      await chrome.storage.local.remove([key]);
      setValueState(defaultValue);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  }, [key, defaultValue]);

  return [value, setValue, removeValue, isLoaded];
}

/**
 * Hook for managing auth token and patient ID
 * @returns Object with auth state and actions
 */
export function useAuth() {
  const [authToken, setAuthToken, removeAuthToken, isAuthLoaded] = useStorage<string | null>(
    'auth_token',
    null
  );
  const [patientId, setPatientId, removePatientId] = useStorage<string | null>('patient_id', null);

  const isAuthenticated = !!authToken && !!patientId;

  const login = useCallback(
    async (token: string, patientId: string) => {
      await setAuthToken(token);
      await setPatientId(patientId);
    },
    [setAuthToken, setPatientId]
  );

  const logout = useCallback(async () => {
    await removeAuthToken();
    await removePatientId();
  }, [removeAuthToken, removePatientId]);

  return {
    authToken,
    patientId,
    isAuthenticated,
    isAuthLoaded,
    login,
    logout,
  };
}
