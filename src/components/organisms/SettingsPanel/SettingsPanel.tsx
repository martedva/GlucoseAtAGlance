import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import styles from './SettingsPanel.module.scss';

export interface UserPreferences {
  refreshInterval: number;
  notificationsEnabled: boolean;
}

export interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onTestNotification: (type: 'low' | 'high') => void;
}

/**
 * Organism SettingsPanel component
 * User preferences modal with refresh interval and notification settings
 */
const SettingsPanel = memo(function SettingsPanel({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onTestNotification,
}: SettingsPanelProps) {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setLocalPrefs((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : Number(value),
    }));
  };

  const handleSave = () => {
    onSavePreferences(localPrefs);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.settingsOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className={styles.settingsPanel} onClick={(e) => e.stopPropagation()}>
        <h2 id="settings-title" className={styles.settingsPanel__title}>
          Settings
        </h2>

        <div className={styles.settingsPanel__content}>
          <FormField
            id="refreshInterval"
            label="Refresh Interval (minutes)"
            helpText="Minimum 2 minutes between sensor scans"
          >
            <select
              id="refreshInterval"
              name="refreshInterval"
              value={localPrefs.refreshInterval}
              onChange={handleChange}
              className="form-select"
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
          </FormField>

          <FormField
            id="notificationsEnabled"
            label="Glucose Alerts"
            helpText="Get notified when glucose goes outside your target range (from LibreLink)"
          >
            <div className={styles.formField__checkboxWrapper}>
              <input
                type="checkbox"
                id="notificationsEnabled"
                name="notificationsEnabled"
                checked={localPrefs.notificationsEnabled}
                onChange={handleChange}
                className={styles.formField__checkbox}
              />
              <span className={styles.formField__checkboxLabel}>
                Enable notifications for high/low glucose
              </span>
            </div>
          </FormField>

          <div>
            <label className={styles.settingsPanel__label}>Test Notifications</label>
            <div className={styles.settingsPanel__testButtons}>
              <button
                type="button"
                onClick={() => onTestNotification('low')}
                className={styles.settingsPanel__testButton}
              >
                ⚠️ Test Low Alert
              </button>
              <button
                type="button"
                onClick={() => onTestNotification('high')}
                className={`${styles.settingsPanel__testButton} ${styles.settingsPanel__testButtonHigh}`}
              >
                🔴 Test High Alert
              </button>
            </div>
            <p className={styles.settingsPanel__help}>
              Preview what the notifications will look like
            </p>
          </div>
        </div>

        <div className={styles.settingsPanel__actions}>
          <Button onClick={onClose} variant="default">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;
export type { UserPreferences };