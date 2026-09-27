import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onRefresh?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onCloseSettings?: () => void;
  isRefreshing?: boolean;
  isSettingsOpen?: boolean;
  isAuthenticated?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Provides accessibility-friendly keyboard navigation
 * 
 * @param config - Configuration object with callback functions and state
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig = {}) {
  const {
    onRefresh,
    onOpenSettings,
    onLogout,
    onCloseSettings,
    isRefreshing = false,
    isSettingsOpen = false,
    isAuthenticated = false,
  } = config;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + R: Refresh data
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        if (isAuthenticated && !isRefreshing && onRefresh) {
          onRefresh();
        }
      }

      // Ctrl/Cmd + S: Open settings
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (isAuthenticated && onOpenSettings) {
          onOpenSettings();
        }
      }

      // Ctrl/Cmd + L: Logout
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        if (isAuthenticated && onLogout) {
          onLogout();
        }
      }

      // Escape: Close settings panel
      if (event.key === 'Escape' && isSettingsOpen && onCloseSettings) {
        event.preventDefault();
        onCloseSettings();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isAuthenticated,
    isRefreshing,
    isSettingsOpen,
    onRefresh,
    onOpenSettings,
    onLogout,
    onCloseSettings,
  ]);
}