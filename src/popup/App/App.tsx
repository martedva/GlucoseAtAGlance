import { useCallback, useEffect, useMemo, useState } from 'react';
import ConnectionStatusIndicator from '@/components/ConnectionStatusIndicator';
import DevelopmentGraph from '@/components/DevelopmentGraph';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlucoseDisplay from '@/components/GlucoseDisplay';
import LoginForm from '@/components/LoginForm';
import SettingsPanel, { type UserPreferences } from '@/components/SettingsPanel';
import { SENSOR_CONFIG, UI_CONFIG } from '@/config';
import { useAuth, useConnectionStatus, useGlucoseData, usePreferences } from '@/hooks';
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
            />
            <div style={{ display: 'flex', gap: '8px' }} role="group" aria-label="Actions">
              <button
                type="button"
                onClick={handleRefresh}
                className="action-button"
                aria-label="Refresh glucose data"
                title="Refresh"
              >
                🔄
              </button>
              <button
                type="button"
                onClick={handleOpenSettings}
                className="action-button"
                aria-label="Open settings"
                title="Settings"
              >
                ⚙️
              </button>
              <button
                type="button"
                onClick={logout}
                className="action-button"
                aria-label="Log out of account"
                title="Log out"
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
        </div>
      </ErrorBoundary>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}

export default App;
