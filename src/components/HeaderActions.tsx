import { useCallback } from 'react';

interface HeaderActionsProps {
  onRefresh: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  isRefreshing: boolean;
}

/**
 * Header action buttons (Refresh, Settings, Logout)
 * Includes keyboard shortcut hints in tooltips and aria labels
 */
const HeaderActions = ({
  onRefresh,
  onOpenSettings,
  onLogout,
  isRefreshing,
}: HeaderActionsProps) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }} role="group" aria-label="Actions">
      <button
        type="button"
        onClick={onRefresh}
        className="action-button"
        aria-label="Refresh glucose data (Ctrl+R)"
        title="Refresh (Ctrl+R)"
        disabled={isRefreshing}
      >
        🔄
      </button>
      <button
        type="button"
        onClick={onOpenSettings}
        className="action-button"
        aria-label="Open settings (Ctrl+S)"
        title="Settings (Ctrl+S)"
      >
        ⚙️
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="action-button"
        aria-label="Log out of account (Ctrl+L)"
        title="Log out (Ctrl+L)"
      >
        ↗️
      </button>
    </div>
  );
};

export default HeaderActions;