import { useCallback, useEffect, useState } from 'react';
import LoginForm from '../../components/LoginForm';
import DevelopmentGraph from '../../components/DevelopmentGraph';
import LibreViewResponse from '../../types/libreViewResponse';
import './App.css';

export type GraphData = {
  time: Date;
  value: number;
};

interface GlucoseDataResponse {
  data?: LibreViewResponse['data'];
  error?: string;
}

const fetchGlucoseData = async (): Promise<GlucoseDataResponse> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "GetLibreViewData" }, (response: GlucoseDataResponse) => {
      if (chrome.runtime.lastError) {
        resolve({ error: chrome.runtime.lastError.message });
      } else {
        resolve(response);
      }
    });
  });
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [glucose, setGlucose] = useState<string | undefined>();
  const [graphData, setGraphData] = useState<GraphData[] | undefined>();
  const [targetLow, setTargetLow] = useState<number | undefined>();
  const [targetHigh, setTargetHigh] = useState<number | undefined>();
  const [daysToExpire, setDaysToExpire] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const loadGlucoseData = useCallback(async () => {
    try {
      const response = await fetchGlucoseData();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.data) {
        throw new Error('No data received');
      }

      const glucoseValue: string = response.data.connection.glucoseItem.Value.toString();
      setGlucose(glucoseValue);

      const appliedDate = new Date(0);
      appliedDate.setUTCSeconds(1756446638);
      const endDate = new Date(appliedDate.setDate(appliedDate.getDate() + 14));
      
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysToExpire(diffDays);

      const targetLowValue: number = response.data.connection.targetLow / 18.01554;
      setTargetLow(targetLowValue);
      const targetHighValue: number = response.data.connection.targetHigh / 18.01554;
      setTargetHigh(targetHighValue);
      
      const graphDataMapped: GraphData[] = response.data.graphData.map((item) => ({
        time: item.Timestamp,
        value: item.Value
      }));
      setGraphData(graphDataMapped);
      setError(null);
    } catch (err) {
      console.error('Error loading glucose data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load glucose data';
      setError(errorMessage);
      
      if (errorMessage.includes('Session expired') || errorMessage.includes('Not authenticated')) {
        setIsAuthenticated(false);
        await chrome.storage.local.remove(['auth_token', 'patient_id']);
      }
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const result = await chrome.storage.local.get(['auth_token', 'patient_id']);
      if (result.auth_token && result.patient_id) {
        setIsAuthenticated(true);
        loadGlucoseData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadGlucoseData]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setError(null);
    loadGlucoseData();
  }, [loadGlucoseData]);

  const handleLogout = async () => {
    await chrome.storage.local.remove(['auth_token', 'patient_id']);
    setIsAuthenticated(false);
    setGlucose(undefined);
    setGraphData(undefined);
    setTargetLow(undefined);
    setTargetHigh(undefined);
    setDaysToExpire(undefined);
  };

  const handleRefresh = useCallback(() => {
    loadGlucoseData();
  }, [loadGlucoseData]);

  if (isLoading) {
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
      <div className="App">
        <LoginForm 
          onLoginSuccess={handleLoginSuccess} 
          onError={setError} 
        />
      </div>
    );
  }

  return (
    <div className="App" style={{ width: '640px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h3>{glucose} mmol/L</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleRefresh} className="refresh-button">
              Refresh
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={handleRefresh} className="retry-button">Retry</button>
          </div>
        )}

        <DevelopmentGraph graphData={graphData} targetLow={targetLow} targetHigh={targetHigh} />
      </div>

      <p>Sensor ends in {daysToExpire} day(s)</p>
    </div>
  );
}

export default App;