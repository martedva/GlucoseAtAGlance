import { memo } from 'react';
import { Button } from '@/components/atoms';
import styles from './HeaderActions.module.scss';

export interface HeaderActionsProps {
  onRefresh: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isRefreshing: boolean;
}

/**
 * Organism HeaderActions component
 * Header action buttons (Refresh, Settings, Logout)
 * Includes keyboard shortcut hints in tooltips and aria labels
 */
const HeaderActions = memo(function HeaderActions({
  onRefresh,
  onOpenSettings,
  onLogout,
  isRefreshing,
}: HeaderActionsProps) {
  return (
    <div className={styles.headerActions} role="group" aria-label="Actions">
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