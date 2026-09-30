import { memo } from 'react';
import { Button } from '@/components/atoms';
import type { Theme } from '@/hooks/useTheme';
import './HeaderActions.css';

export interface HeaderActionsProps {
  onRefresh: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  isRefreshing: boolean;
  theme: Theme;
}

/**
 * Organism HeaderActions component
 * Header action buttons (Theme Toggle, Refresh, Settings, Logout)
 */
const HeaderActions = memo(function HeaderActions({
  onRefresh,
  onOpenSettings,
  onLogout,
  onToggleTheme,
  isRefreshing,
  theme,
}: HeaderActionsProps) {
  return (
    <div className="header-actions" role="group" aria-label="Actions">
      <Button
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`${theme === 'light' ? 'Dark' : 'Light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </Button>
      <Button
        onClick={onRefresh}
        aria-label="Refresh glucose data (Ctrl+R)"
        title="Refresh (Ctrl+R)"
        disabled={isRefreshing}
      >
        🔄
      </Button>
      <Button
        onClick={onOpenSettings}
        aria-label="Open settings (Ctrl+S)"
        title="Settings (Ctrl+S)"
      >
        ⚙️
      </Button>
      <Button
        onClick={onLogout}
        aria-label="Log out of account (Ctrl+L)"
        title="Log out (Ctrl+L)"
      >
        ↗️
      </Button>
    </div>
  );
});

export default HeaderActions;