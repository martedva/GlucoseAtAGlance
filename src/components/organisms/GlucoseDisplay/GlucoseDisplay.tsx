import { Icon } from '@/components/atoms';
import type { TransformedGraphDataPoint } from '@/hooks/useGlucoseData';
import type { SensorExpiryStatus } from '@/hooks/useSensorExpiry';
import { predictGlucoseTrend } from '@/utils/trend-prediction';
import { memo } from 'react';
import './GlucoseDisplay.css';

export type ConnectionStatus = 'online' | 'offline' | 'stale';

export interface GlucoseDisplayProps {
  glucose?: number;
  glucoseTime?: Date;
  connectionStatus?: ConnectionStatus;
  lastFetchTime?: Date | null;
  daysToExpire: number | null;
  sensorStatus: SensorExpiryStatus;
  graphData: TransformedGraphDataPoint[];
  currentTrendArrow?: number;
  glucoseColorCode?: number; // 1=green, 2=yellow, 3=orange, 4=red (from API)
  uom: number; // 0 = mg/dL, 1 = mmol/L
  children?: React.ReactNode;
}

/**
 * Organism GlucoseDisplay component
 * Shows current glucose value with trend arrow and sensor info
 */
const GlucoseDisplay = memo(function GlucoseDisplay({
  glucose,
  glucoseTime,
  connectionStatus = 'online',
  lastFetchTime,
  daysToExpire,
  sensorStatus,
  graphData,
  currentTrendArrow,
  glucoseColorCode,
  uom,
  children,
}: GlucoseDisplayProps) {
  if (glucose === undefined) return null;

  // Get trend arrow display
  const trendIcon = getTrendIcon(currentTrendArrow);
  const trendClass = getTrendClass(currentTrendArrow);

  // Get glucose value color class based on API's MeasurementColor
  const glucoseValueClass = getGlucoseValueClass(glucoseColorCode);

  // Calculate delta (change from previous reading) - 1 decimal place
  const delta =
    graphData.length >= 2
      ? graphData[graphData.length - 1].value - graphData[graphData.length - 2].value
      : 0;

  // Calculate predicted glucose (15 min forecast)
  const prediction = graphData.length >= 2 ? predictGlucoseTrend(graphData) : null;
  const predictedValue = prediction ? (glucose + prediction.predictedChange15min).toFixed(1) : null;

  // Use the glucose measurement time (passed from parent), fallback to current time
  const displayTime = glucoseTime || new Date();

  // Connection status display
  const connectionDisplay = getConnectionDisplay(connectionStatus, lastFetchTime);

  // Sensor expiry status display
  const sensorStatusDisplay = getSensorStatusDisplay(daysToExpire, sensorStatus);

  // Unit display (0 = mmol/L, 1 = mg/dL)
  const unit = uom === 0 ? 'mmol/L' : 'mg/dL';

  return (
    <div className="glucose-display" role="region" aria-label="Current glucose reading">
      {/* Header row: status + time on left, actions on right */}
      <div className="glucose-display__header">
        <div className="glucose-display__header-left">
          <div className="glucose-display__status-section">
            <span
              className={`glucose-display__status-indicator glucose-display__status-indicator--${connectionStatus}`}
            >
              {connectionDisplay.icon} {connectionDisplay.text}
            </span>
            <span className="glucose-display__time">{displayTime.toLocaleTimeString()}</span>
          </div>
          {sensorStatusDisplay && (
            <div className="glucose-display__sensor-status">{sensorStatusDisplay}</div>
          )}
        </div>
        <div className="glucose-display__header-right">{children}</div>
      </div>

      {/* Main glucose value with trend arrow */}
      <div className="glucose-display__value-container">
        <Icon variant={trendIcon} size="large" className="glucose-display__trend-icon">
          {trendIcon === 'trend-up'
            ? '↑'
            : trendIcon === 'trend-right-up'
              ? '↗'
              : trendIcon === 'trend-right'
                ? '→'
                : trendIcon === 'trend-right-down'
                  ? '↘'
                  : '↓'}
        </Icon>
        <div className={`glucose-display__value ${glucoseValueClass}`} aria-live="polite">
          <span>{glucose}</span>
          <span className="glucose-display__unit"> {unit}</span>
        </div>
      </div>

      {/* Trend row: delta + prediction */}
      <div className={`glucose-display__trend ${trendClass}`}>
        <span className="glucose-display__delta">
          {delta >= 0 ? '+' : ''}
          {delta.toFixed(1)} {unit}/5min
        </span>
        {predictedValue && (
          <span className="glucose-display__prediction">
            → {predictedValue} {unit}
          </span>
        )}
      </div>
    </div>
  );
});

function getTrendIcon(
  arrow: number | undefined
): 'trend-up' | 'trend-right-up' | 'trend-right' | 'trend-right-down' | 'trend-down' {
  if (!arrow) return 'trend-right';
  // 1=down, 2=right-down, 3=right, 4=right-up, 5=up
  switch (arrow) {
    case 1:
      return 'trend-down';
    case 2:
      return 'trend-right-down';
    case 3:
      return 'trend-right';
    case 4:
      return 'trend-right-up';
    case 5:
      return 'trend-up';
    default:
      return 'trend-right';
  }
}

function getTrendClass(arrow: number | undefined): string {
  const icon = getTrendIcon(arrow);
  return `glucose-display__trend--${icon}`;
}

/**
 * Get CSS class for glucose value based on API's MeasurementColor
 * 1 = green (in range), 2 = yellow, 3 = orange, 4 = red
 */
function getGlucoseValueClass(colorCode: number | undefined): string {
  if (colorCode === undefined) return '';
  
  switch (colorCode) {
    case 1:
      return 'glucose-display__value--green';
    case 2:
      return 'glucose-display__value--yellow';
    case 3:
      return 'glucose-display__value--orange';
    case 4:
      return 'glucose-display__value--red';
    default:
      return 'glucose-display__value--green';
  }
}

function getSensorStatusDisplay(
  daysToExpire: number | null,
  status: SensorExpiryStatus
): JSX.Element | null {
  if (daysToExpire === null) return null;

  const icon = status === 'critical' || status === 'warning' ? '⚠️' : '📅';

  return (
    <>
      {icon} Sensor expires in {daysToExpire} day{daysToExpire !== 1 ? 's' : ''}
    </>
  );
}

function getConnectionDisplay(
  status: ConnectionStatus,
  lastFetchTime: Date | null | undefined
): { icon: string; text: string } {
  switch (status) {
    case 'offline':
      return { icon: '❌', text: 'No connection' };
    case 'stale':
      return { icon: '⚠️', text: 'Data outdated' };
    default:
      return { icon: '✅', text: 'Live data' };
  }
}

export default GlucoseDisplay;
