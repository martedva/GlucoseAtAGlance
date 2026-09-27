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

const getSensorStatusLabel = (status: SensorExpiryStatus): string => {
  switch (status) {
    case 'critical':
      return 'Critical - sensor expiring soon';
    case 'warning':
      return 'Warning - sensor expiring in a few days';
    default:
      return 'Normal - sensor operating normally';
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
      role="region"
      aria-label="Glucose monitoring dashboard"
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}
      >
        <h3 style={{ margin: 0 }} aria-live="polite" aria-atomic="true">
          {glucose?.toFixed(1) ?? '--'} mmol/L
        </h3>
        {daysToExpire !== null && (
          <p
            className={`sensor-expiry ${sensorStatus}`}
            style={{
              margin: 0,
              fontSize: '13px',
              ...expiryStyles,
            }}
            aria-label={`Sensor expiry: ${getSensorStatusLabel(sensorStatus)}, ${daysToExpire} day${daysToExpire !== 1 ? 's' : ''} remaining`}
          >
            Sensor ends in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }} role="group" aria-label="Actions">
        <button
          type="button"
          onClick={onRefresh}
          className="refresh-button"
          aria-label="Refresh glucose data"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="logout-button"
          aria-label="Log out of account"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default GlucoseDisplay;