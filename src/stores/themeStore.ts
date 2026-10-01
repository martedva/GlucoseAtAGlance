import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'glucose-theme-preference';

interface ThemeState {
  theme: Theme;
  isLoaded: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * Get initial theme from storage or system preference
 */
const getInitialTheme = async (): Promise<Theme> => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    if (result[STORAGE_KEY] === 'dark' || result[STORAGE_KEY] === 'light') {
      return result[STORAGE_KEY];
    }
  } catch {
    // Ignore storage errors
  }
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Simple theme store - state only, no side effects
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isLoaded: false,

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    chrome.storage.local.set({ [STORAGE_KEY]: newTheme });
  },

  setTheme: (theme: Theme) => {
    set({ theme });
    chrome.storage.local.set({ [STORAGE_KEY]: theme });
  },
}));

/**
 * Initialize theme from storage on module load
 */
getInitialTheme().then((theme) => {
  useThemeStore.setState({ theme, isLoaded: true });
});

/**
 * Hook to use theme state
 */
export function useTheme() {
  return useThemeStore();
}