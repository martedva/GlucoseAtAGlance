import { memo, useEffect, useState } from 'react';

interface UserPreferences {
  refreshInterval: number; // minutes
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
}

/**
 * Settings panel component for user preferences
 */
const SettingsPanel = memo(function SettingsPanel({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}: SettingsPanelProps) {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);

  // Sync with parent preferences when they change
  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalPrefs((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSave = () => {
    onSavePreferences(localPrefs);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="settings-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="settings-panel"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-title" style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
          Settings
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Refresh Interval */}
          <div>
            <label
              htmlFor="refreshInterval"
              style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}
            >
              Refresh Interval (minutes)
            </label>
            <select
              id="refreshInterval"
              name="refreshInterval"
              value={localPrefs.refreshInterval}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value={2}>2 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
              Minimum 2 minutes between sensor scans
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;
export type { UserPreferences };
