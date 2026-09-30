import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = 'glucose-theme-preference';

/**
 * Hook to manage light/dark theme preference
 * - Respects system preference on first load
 * - Persists user choice to chrome.storage
 * - Updates data-theme attribute on html element
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Get system preference
  const getSystemPreference = (): Theme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Load theme from storage or system preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try to load from chrome storage
        const result = await chrome.storage.local.get([THEME_STORAGE_KEY]);
        const storedTheme = result[THEME_STORAGE_KEY] as Theme | undefined;
        
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeState(storedTheme);
        } else {
          // Fall back to system preference
          setThemeState(getSystemPreference());
        }
      } catch (error) {
        console.warn('[useTheme] Could not load theme from storage, using system preference', error);
        setThemeState(getSystemPreference());
      }
      setIsLoaded(true);
    };

    loadTheme();
  }, []);

  // Update html attribute when theme changes
  useEffect(() => {
    if (!isLoaded) return;

    const html = document.documentElement;
    
    // Remove any existing theme attribute first
    html.removeAttribute('data-theme');
    
    // Set the new theme
    if (theme !== 'light') {
      html.setAttribute('data-theme', theme);
    }
  }, [theme, isLoaded]);

  // Save theme to storage
  const saveTheme = async (newTheme: Theme) => {
    try {
      await chrome.storage.local.set({ [THEME_STORAGE_KEY]: newTheme });
    } catch (error) {
      console.error('[useTheme] Could not save theme to storage', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}