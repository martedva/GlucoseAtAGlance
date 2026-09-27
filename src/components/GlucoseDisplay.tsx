import type { SensorExpiryStatus } from '@/hooks/useSensorExpiry';

interface GlucoseDisplayProps {
  glucose?: number;
  daysToExpire: number | null;
  sensorStatus: SensorExpiryStatus;
  onRefresh: () => void;
  onLogout: () => void;
}

const getExpiryStyles = (status: SensorExpiryStatus) => {
  switch (status) {
    case 'critical':
      return { color: '#d32f2f', fontWeight: 500 as const };
    case 'warning':
      return { color: '#f57c00', fontWeight: 500 as const };
    default:
      return { color: '#666', fontWeight: 400 as const };
  }
};

const GlucoseDisplay = ({
  glucose,
  daysToExpire,
  sensorStatus,
  onRefresh,
  onLogout,
}: GlucoseDisplayProps) => {
  const expiryStyles = getExpiryStyles(sensorStatus);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}
      >
        <h3 style={{ margin: 0 }}>{glucose?.toFixed(1) ?? '--'} mmol/L</h3>
        {daysToExpire !== null && (
          <p
            className={`sensor-expiry ${sensorStatus}`}
            style={{
              margin: 0,
              fontSize: '13px',
              ...expiryStyles,
            }}
          >
            Sensor ends in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default GlucoseDisplay;
