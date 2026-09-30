import { useThemeSync } from '@/stores/themeStore';

export type Theme = 'light' | 'dark';

/**
 * Hook to manage light/dark theme preference
 * Uses Zustand store with chrome.storage persistence
 * 
 * @returns Object with theme state and controls
 * 
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme, isLoaded } = useTheme();
 * 
 * // Use in component
 * <button onClick={toggleTheme}>
 *   {theme === 'light' ? '🌙' : '☀️'}
 * </button>
 * ```
 */
export function useTheme(): {
  theme: Theme;
  isLoaded: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
} {
  const { theme, isLoaded, toggleTheme, setTheme } = useThemeSync();
  return { theme, isLoaded, toggleTheme, setTheme };
}