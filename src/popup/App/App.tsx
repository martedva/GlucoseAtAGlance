import { useCallback, useState } from 'react';
import ConnectionStatusIndicator from '@/components/ConnectionStatusIndicator';
import DevelopmentGraph from '@/components/DevelopmentGraph';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorMessage from '@/components/ErrorMessage';
import GlucoseDisplay from '@/components/GlucoseDisplay';
import HeaderActions from '@/components/HeaderActions';
import LoginForm from '@/components/LoginForm';
import SettingsPanel, { type UserPreferences } from '@/components/SettingsPanel';
import StatisticsPanel from '@/components/StatisticsPanel';
import { UI_CONFIG } from '@/config';
import {
  useAuth,
  useAutoRefresh,
  useConnectionStatus,
  useGlucoseData,
  useGlucoseTargets,
  useInitialFetch,
  useKeyboardShortcuts,
  usePreferences,
  useExtensionIcon,
} from '@/hooks';
import { useLogbookData } from '@/hooks/useLogbookData';
import { useSensorExpiry } from '@/hooks/useSensorExpiry';
import './App.css';

/**
 * Main App component
 * Orchestrates authentication state and UI composition
 * Business logic is delegated to custom hooks and child components
 */
function App() {
  // Authentication
  const { isAuthenticated, isAuthLoaded, login, logout } = useAuth();

  // Data fetching
  const { data, graphData, isLoading: isDataLoading, error, lastFetchTime, fetchData } = useGlucoseData();
  const { logbookGraphData, isLoading: isLogbookLoading } = useLogbookData();

  // Derived data from hooks
  const { targetLow, targetHigh, targetLowRaw, targetHighRaw, uom } = useGlucoseTargets(data?.data);
  const { daysToExpire, sensorStatus } = useSensorExpiry(data?.data?.activeSensors?.[0]);
  const { preferences, savePreferences, isLoading: isPrefsLoading } = usePreferences();
  const { status: connectionStatus } = useConnectionStatus(
    preferences.refreshInterval,
    lastFetchTime
  );

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Event handlers
  const handleLoginSuccess = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

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

  // Side effects via hooks
  useExtensionIcon(data?.data.connection.glucoseItem);
  useInitialFetch({
    isAuthenticated,
    hasData: !!data,
    onFetch: fetchData,
  });
  useAutoRefresh({
    isEnabled: isAuthenticated,
    hasData: !!data,
    refreshInterval: preferences.refreshInterval,
    onRefresh: fetchData,
  });
  useKeyboardShortcuts({
    onRefresh: handleRefresh,
    onOpenSettings: handleOpenSettings,
    onLogout: logout,
    onCloseSettings: handleCloseSettings,
    isRefreshing: isDataLoading,
    isSettingsOpen,
    isAuthenticated,
  });

  // Loading states
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

  // Extract data for display
  const glucoseValue = data?.data.connection.glucoseItem.Value;
  const currentTrendArrow = data?.data.connection.glucoseItem.TrendArrow;

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

          {/* Header with glucose display and action buttons */}
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
            <HeaderActions
              onRefresh={handleRefresh}
              onOpenSettings={handleOpenSettings}
              onLogout={logout}
              isRefreshing={isDataLoading}
            />
          </div>

          {/* Error message with retry */}
          {error && (
            <ErrorMessage
              error={error}
              onRetry={handleRefresh}
              isRetrying={isDataLoading}
            />
          )}

          {/* Glucose graph with target range */}
          <DevelopmentGraph
            graphData={graphData}
            targetLow={targetLow}
            targetHigh={targetHigh}
            isLoading={isDataLoading}
          />

          {/* Statistics panel with TIR, average, min, max */}
          <StatisticsPanel
            graphData={graphData}
            logbookData={logbookGraphData}
            targetLow={targetLowRaw}
            targetHigh={targetHighRaw}
            uom={uom}
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