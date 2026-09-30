import { create } from 'zustand';
import { useEffect } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'glucose-theme-preference';

interface ThemeState {
  theme: Theme;
  isLoaded: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loadFromStorage: () => Promise<void>;
}

/**
 * Get system color scheme preference
 */
const getSystemPreference = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Load theme from chrome.storage
 */
const loadThemeFromStorage = async (): Promise<Theme | null> => {
  try {
    const result = await chrome.storage.local.get([THEME_STORAGE_KEY]);
    const storedTheme = result[THEME_STORAGE_KEY] as Theme | undefined;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      return storedTheme;
    }
    return null;
  } catch (error) {
    console.warn('[themeStore] Could not load theme from storage', error);
    return null;
  }
};

/**
 * Save theme to chrome.storage
 */
const saveThemeToStorage = async (theme: Theme): Promise<void> => {
  try {
    await chrome.storage.local.set({ [THEME_STORAGE_KEY]: theme });
  } catch (error) {
    console.error('[themeStore] Could not save theme to storage', error);
  }
};

/**
 * Zustand store for theme management
 * Syncs with chrome.storage for persistence across extension contexts
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isLoaded: false,

  /**
   * Load theme from chrome.storage on initialization
   * Should be called once when app starts
   */
  loadFromStorage: async () => {
    const storedTheme = await loadThemeFromStorage();
    set({
      theme: storedTheme ?? getSystemPreference(),
      isLoaded: true,
    });
  },

  /**
   * Set theme and persist to chrome.storage
   */
  setTheme: async (theme: Theme) => {
    set({ theme });
    await saveThemeToStorage(theme);
  },

  /**
   * Toggle between light and dark theme
   */
  toggleTheme: async () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    await saveThemeToStorage(newTheme);
  },
}));

/**
 * Hook to sync theme store with document attribute
 * Call this once in your root component (App.tsx)
 * Returns the store methods for use in components
 */
export const useThemeSync = () => {
  const { theme, isLoaded, loadFromStorage, toggleTheme, setTheme } = useThemeStore();

  // Load theme from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Update document attribute when theme changes
  useEffect(() => {
    if (!isLoaded) return;

    const html = document.documentElement;
    html.removeAttribute('data-theme');
    if (theme !== 'light') {
      html.setAttribute('data-theme', theme);
    }
  }, [theme, isLoaded]);

  return { theme, isLoaded, toggleTheme, setTheme };
};