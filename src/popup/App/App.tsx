import { useCallback, useEffect, useMemo, useState } from 'react';
import ConnectionStatusIndicator from '@/components/ConnectionStatusIndicator';
import DevelopmentGraph from '@/components/DevelopmentGraph';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlucoseDisplay from '@/components/GlucoseDisplay';
import LoginForm from '@/components/LoginForm';
import SettingsPanel, { type UserPreferences } from '@/components/SettingsPanel';
import StatisticsPanel from '@/components/StatisticsPanel';
import { SENSOR_CONFIG, UI_CONFIG } from '@/config';
import {
  useAuth,
  useConnectionStatus,
  useGlucoseData,
  useKeyboardShortcuts,
  usePreferences,
} from '@/hooks';
import { useLogbookData } from '@/hooks/useLogbookData';
import { useSensorExpiry } from '@/hooks/useSensorExpiry';
import { parseLibreTimestamp } from '@/types/api';
import './App.css';

/**
 * Main App component
 * Handles authentication state and renders appropriate UI
 */
function App() {
  const { isAuthenticated, isAuthLoaded, login, logout } = useAuth();
  const { data, isLoading: isDataLoading, error, lastFetchTime, fetchData } = useGlucoseData();
  const { data: logbookData, isLoading: isLogbookLoading } = useLogbookData();
  const { daysToExpire, sensorStatus } = useSensorExpiry(data?.data?.activeSensors?.[0]);
  const { preferences, savePreferences, isLoading: isPrefsLoading } = usePreferences();
  const { status: connectionStatus } = useConnectionStatus(
    preferences.refreshInterval,
    lastFetchTime
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLoginSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Update extension icon when fresh data is loaded
  useEffect(() => {
    if (!data?.data?.connection?.glucoseItem) return;

    const glucoseItem = data.data.connection.glucoseItem;
    const colorMap: Record<number, string> = { 1: 'green', 2: 'yellow', 3: 'orange', 4: 'red' };
    const arrowMap: Record<number, string> = { 1: 'down', 2: 'right-down', 3: 'right', 4: 'right-up', 5: 'up' };
    
    const color = colorMap[glucoseItem.MeasurementColor];
    const arrow = arrowMap[glucoseItem.TrendArrow];

    if (color && arrow) {
      chrome.runtime.sendMessage({
        action: 'UpdateIcon',
        color,
        arrow,
      });
    }
  }, [data?.data?.connection?.glucoseItem]);

  useEffect(() => {
    if (isAuthenticated && !data) {
      fetchData();
    }
  }, [isAuthenticated, data, fetchData]);

  // Auto-refresh based on user preferences
  useEffect(() => {
    if (!isAuthenticated || !data) return;

    const interval = setInterval(
      () => {
        fetchData();
      },
      preferences.refreshInterval * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [isAuthenticated, data, fetchData, preferences.refreshInterval]);

  // Memoize graph data transformation to avoid recalculation on every render
  const graphData = useMemo(() => {
    if (!data?.data.graphData) return [];
    return data.data.graphData.map((item) => ({
      time: parseLibreTimestamp(item.Timestamp),
      value: item.Value,
    }));
  }, [data?.data.graphData]);

  // Memoize logbook graph data transformation
  const logbookGraphData = useMemo(() => {
    if (!logbookData?.data) return [];
    return logbookData.data.map((item) => ({
      time: parseLibreTimestamp(item.Timestamp),
      value: item.Value,
    }));
  }, [logbookData?.data]);

  // Memoize target values from API
  const targetLow = useMemo(() => {
    return data?.data.connection.targetLow
      ? data.data.connection.targetLow / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR
      : undefined;
  }, [data?.data.connection.targetLow]);

  const targetHigh = useMemo(() => {
    return data?.data.connection.targetHigh
      ? data.data.connection.targetHigh / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR
      : undefined;
  }, [data?.data.connection.targetHigh]);

  // Memoize glucose value
  const glucoseValue = useMemo(
    () => data?.data.connection.glucoseItem.Value,
    [data?.data.connection.glucoseItem.Value]
  );

  // Memoize trend arrow from API
  const currentTrendArrow = useMemo(
    () => data?.data.connection.glucoseItem.TrendArrow,
    [data?.data.connection.glucoseItem.TrendArrow]
  );

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleSavePreferences = useCallback(
    async (prefs: UserPreferences) => {
      await savePreferences(prefs);
    },
    [savePreferences]
  );

  // Test notification handler - sends to background script for system notification
  const handleTestNotification = useCallback((type: 'low' | 'high') => {
    const testValues = {
      low: { value: 3.5, threshold: 4.0 },
      high: { value: 12.0, threshold: 10.0 },
    };

    const test = testValues[type];
    const title = type === 'low' ? '⚠️ Low Glucose Alert' : '⚠️ High Glucose Alert';
    const body =
      type === 'low'
        ? `Your glucose is ${test.value.toFixed(1)} mmol/L (below ${test.threshold.toFixed(1)} mmol/L)`
        : `Your glucose is ${test.value.toFixed(1)} mmol/L (above ${test.threshold.toFixed(1)} mmol/L)`;

    chrome.runtime.sendMessage(
      {
        action: 'ShowNotification',
        title,
        body,
        type: 'warning' as const,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Test Notification] Error:', chrome.runtime.lastError.message);
        }
      }
    );
  }, []);

  // Keyboard shortcuts for accessibility
  useKeyboardShortcuts({
    onRefresh: handleRefresh,
    onOpenSettings: handleOpenSettings,
    onLogout: logout,
    onCloseSettings: handleCloseSettings,
    isRefreshing: isDataLoading,
    isSettingsOpen,
    isAuthenticated,
  });

  if (!isAuthLoaded || isPrefsLoading) {
    return (
      <div className="App">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="App" style={{ width: `${UI_CONFIG.POPUP_WIDTH}px` }}>
        <ErrorBoundary>
          <LoginForm onLoginSuccess={handleLoginSuccess} onError={() => {}} />
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <div className="App" style={{ width: `${UI_CONFIG.POPUP_WIDTH}px` }}>
      <ErrorBoundary>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            padding: '20px',
          }}
          role="main"
          aria-label="Glucose monitoring dashboard"
        >
          {/* Connection Status Indicator - Critical for safety */}
          <ConnectionStatusIndicator
            status={connectionStatus}
            lastSuccessfulFetch={lastFetchTime}
          />

          {/* Header with glucose display and action buttons on same line */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <GlucoseDisplay
              glucose={glucoseValue}
              daysToExpire={daysToExpire}
              sensorStatus={sensorStatus}
              graphData={graphData}
              currentTrendArrow={currentTrendArrow}
            />
            <div style={{ display: 'flex', gap: '8px' }} role="group" aria-label="Actions">
              <button
                type="button"
                onClick={handleRefresh}
                className="action-button"
                aria-label="Refresh glucose data (Ctrl+R)"
                title="Refresh (Ctrl+R)"
                disabled={isDataLoading}
              >
                🔄
              </button>
              <button
                type="button"
                onClick={handleOpenSettings}
                className="action-button"
                aria-label="Open settings (Ctrl+S)"
                title="Settings (Ctrl+S)"
              >
                ⚙️
              </button>
              <button
                type="button"
                onClick={logout}
                className="action-button"
                aria-label="Log out of account (Ctrl+L)"
                title="Log out (Ctrl+L)"
              >
                ↗️
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="assertive" aria-atomic="true">
              {error}
              <button
                type="button"
                onClick={handleRefresh}
                className="retry-button"
                aria-label="Retry loading glucose data"
                disabled={isDataLoading}
              >
                Retry
              </button>
            </div>
          )}

          <DevelopmentGraph
            graphData={graphData}
            targetLow={targetLow}
            targetHigh={targetHigh}
            isLoading={isDataLoading}
          />

          <StatisticsPanel
            graphData={graphData}
            logbookData={logbookGraphData}
            targetLow={targetLow}
            targetHigh={targetHigh}
            isLoading={isDataLoading || isLogbookLoading}
          />

          {/* Keyboard shortcuts hint */}
          <p className="keyboard-hint" aria-hidden="true">
            Shortcuts: Ctrl+R Refresh • Ctrl+S Settings • Ctrl+L Logout
          </p>
        </div>
      </ErrorBoundary>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        onTestNotification={handleTestNotification}
      />
    </div>
  );
}

export default App;
