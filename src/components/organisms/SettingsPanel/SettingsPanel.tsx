import { memo } from 'react';
import { Button, Input } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import type { UserPreferences } from '@/hooks/usePreferences';
import './SettingsPanel.css';

export interface SettingsPanelProps {
  isOpen: boolean;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => Promise<void>;
  onClose: () => void;
  onTestNotification?: (type: 'low' | 'high') => void;
}

/**
 * Organism SettingsPanel component
 * User preferences configuration
 */
const SettingsPanel = memo(function SettingsPanel({
  isOpen,
  preferences,
  onSavePreferences,
  onClose,
  onTestNotification,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const handleSave = async () => {
    await onSavePreferences(preferences);
    onClose();
  };

  return (
    <div className="settings-panel" role="dialog" aria-label="Settings" aria-modal="true">
      <div className="settings-panel__overlay" onClick={onClose} aria-hidden="true" />
      
      <div className="settings-panel__container">
        <div className="settings-panel__header">
          <h2 className="settings-panel__title">Settings</h2>
          <Button
            onClick={onClose}
            aria-label="Close settings"
            variant="default"
            size="icon"
            className="settings-panel__close"
          >
            ✕
          </Button>
        </div>

        <div className="settings-panel__content">
          <div className="settings-panel__section">
            <h3 className="settings-panel__section-title">Graph Settings</h3>
            <FormField label="Prediction Period (minutes)" id="prediction-period" helpText="Show predicted glucose values">
              <Input
                id="prediction-period"
                type="number"
                min="0"
                max="60"
                step="5"
                value={preferences.predictionPeriod ?? 15}
                onChange={(e) => {
                  const newPrefs = {
                    ...preferences,
                    predictionPeriod: Number(e.target.value),
                  };
                  onSavePreferences(newPrefs);
                }}
              />
            </FormField>
          </div>

          <div className="settings-panel__section">
            <h3 className="settings-panel__section-title">Refresh</h3>
            <FormField label="Auto-refresh interval (minutes)" id="refresh-interval" helpText="Set to 0 to disable">
              <Input
                id="refresh-interval"
                type="number"
                min="0"
                max="60"
                step="1"
                value={preferences.refreshInterval}
                onChange={(e) => {
                  const newPrefs = {
                    ...preferences,
                    refreshInterval: Number(e.target.value),
                  };
                  onSavePreferences(newPrefs);
                }}
              />
            </FormField>
          </div>

          {onTestNotification && (
            <div className="settings-panel__section">
              <h3 className="settings-panel__section-title">Notifications</h3>
              <div className="settings-panel__notification-buttons">
                <Button size="small" onClick={() => onTestNotification('low')}>
                  Test Low Alert
                </Button>
                <Button size="small" onClick={() => onTestNotification('high')}>
                  Test High Alert
                </Button>
              </div>
            </div>
          )}

          <div className="settings-panel__section">
            <h3 className="settings-panel__section-title">Units</h3>
            <p className="settings-panel__info">
              Glucose units are automatically detected from your LibreLinkUp account settings.
            </p>
          </div>
        </div>

        <div className="settings-panel__footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
});

export default SettingsPanel;