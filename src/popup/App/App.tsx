import { useCallback, useState } from 'react';
import {
  DevelopmentGraph,
  ErrorMessage,
  GlucoseDisplay,
  HeaderActions,
  LoginForm,
  SettingsPanel,
  StatisticsPanel,
} from '@/components/organisms';
import type { UserPreferences } from '@/hooks/usePreferences';
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
  useTheme,
} from '@/hooks';
import { useLogbookData } from '@/hooks/useLogbookData';
import { useSensorExpiry } from '@/hooks/useSensorExpiry';
import { parseLibreTimestamp } from '@/types/api';
import '@/styles/global.css';

/**
 * Main App component
 * Orchestrates authentication state and UI composition
 * Business logic is delegated to custom hooks and child components
 */
function App() {
  // Authentication
  const { isAuthenticated, isAuthLoaded, login, logout } = useAuth();

  // Theme management
  const { theme, toggleTheme } = useTheme();

  // Data fetching
  const { data, graphData, isLoading: isDataLoading, error, lastFetchTime, fetchData } = useGlucoseData();
  const { logbookGraphData, isLoading: isLogbookLoading } = useLogbookData();

  // Derived data from hooks
  const { targetLow, targetHigh } = useGlucoseTargets(data?.data);
  const { daysToExpire, sensorStatus } = useSensorExpiry(data?.data?.connection?.sensor);
  const { preferences, savePreferences, isLoading: isPrefsLoading } = usePreferences();
  const { status: connectionStatus } = useConnectionStatus(
    preferences.refreshInterval,
    lastFetchTime
  );

  // Extract data for display (before callbacks)
  const glucoseValue = data?.data.connection.glucoseItem.Value;
  const glucoseTime = data?.data.connection.glucoseItem.Timestamp
    ? parseLibreTimestamp(data.data.connection.glucoseItem.Timestamp)
    : new Date();
  const currentTrendArrow = data?.data.connection.glucoseItem.TrendArrow;
  // Use API's uom (0 = mmol/L, 1 = mmol/L) - this is the user's actual preferred unit
  const apiUom = data?.data.connection.uom ?? 0;

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
    const isMmol = apiUom === 0;
    const testValues = isMmol
      ? { low: { value: 3.5, threshold: 4.0 }, high: { value: 12.0, threshold: 10.0 } }
      : { low: { value: 63, threshold: 72 }, high: { value: 216, threshold: 180 } };

    const test = testValues[type];
    const unit = isMmol ? 'mmol/L' : 'mg/dL';
    const title = type === 'low' ? '⚠️ Low Glucose Alert' : '⚠️ High Glucose Alert';
    const body =
      type === 'low'
        ? `Your glucose is ${test.value} ${unit} (below ${test.threshold} ${unit})`
        : `Your glucose is ${test.value} ${unit} (above ${test.threshold} ${unit})`;

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
  }, [apiUom]);

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
        <LoginForm onLoginSuccess={handleLoginSuccess} onError={() => {}} />
      </div>
    );
  }

  // Extract data for display
  // (already extracted above before callbacks)

  return (
    <div className="App" style={{ width: `${UI_CONFIG.POPUP_WIDTH}px` }}>
      <div className="app-content" role="main" aria-label="Glucose monitoring dashboard">
        {/* Glucose display with header actions */}
        <GlucoseDisplay
          glucose={glucoseValue}
          glucoseTime={glucoseTime}
          connectionStatus={connectionStatus}
          lastFetchTime={lastFetchTime}
          daysToExpire={daysToExpire}
          sensorStatus={sensorStatus}
          graphData={graphData}
          currentTrendArrow={currentTrendArrow}
          uom={apiUom}
        >
          <HeaderActions
            onRefresh={handleRefresh}
            onOpenSettings={handleOpenSettings}
            onLogout={logout}
            onToggleTheme={toggleTheme}
            isRefreshing={isDataLoading}
            theme={theme}
          />
        </GlucoseDisplay>

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
          uom={apiUom}
        />

        {/* Statistics panel with TIR, average, min, max */}
        <StatisticsPanel
          graphData={graphData}
          logbookData={logbookGraphData}
          targetLow={targetLow}
          targetHigh={targetHigh}
          isLoading={isDataLoading || isLogbookLoading}
          uom={apiUom}
        />

        {/* Keyboard shortcuts hint */}
        <p className="keyboard-hint" aria-hidden="true">
          Shortcuts: Ctrl+R Refresh • Ctrl+S Settings • Ctrl+L Logout
        </p>
      </div>

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