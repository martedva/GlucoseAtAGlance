import { useCallback, useEffect } from 'react';
import DevelopmentGraph from '@/components/DevelopmentGraph';
import GlucoseDisplay from '@/components/GlucoseDisplay';
import LoginForm from '@/components/LoginForm';
import { SENSOR_CONFIG, UI_CONFIG } from '@/config';
import { useAuth, useGlucoseData } from '@/hooks';
import { useSensorExpiry } from '@/hooks/useSensorExpiry';
import './App.css';

function App() {
  const { isAuthenticated, isAuthLoaded, login, logout } = useAuth();
  const { data, isLoading: isDataLoading, error, fetchData } = useGlucoseData();
  const { daysToExpire, sensorStatus } = useSensorExpiry(data?.data?.activeSensors?.[0]);

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

  if (!isAuthLoaded) {
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

  return (
    <div className="App" style={{ width: `${UI_CONFIG.POPUP_WIDTH}px` }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '20px',
        }}
      >
        <GlucoseDisplay
          glucose={data?.data.connection.glucoseItem.Value}
          daysToExpire={daysToExpire}
          sensorStatus={sensorStatus}
          onRefresh={handleRefresh}
          onLogout={logout}
        />

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={handleRefresh} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <DevelopmentGraph
          graphData={
            data?.data.graphData.map((item) => ({
              time: item.Timestamp,
              value: item.Value,
            })) ?? []
          }
          targetLow={
            data?.data.connection.targetLow
              ? data.data.connection.targetLow / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR
              : undefined
          }
          targetHigh={
            data?.data.connection.targetHigh
              ? data.data.connection.targetHigh / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR
              : undefined
          }
          isLoading={isDataLoading}
        />
      </div>
    </div>
  );
}

export default App;
