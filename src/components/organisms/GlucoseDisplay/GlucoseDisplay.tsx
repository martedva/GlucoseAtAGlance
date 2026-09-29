import { memo } from 'react';
import { Icon } from '@/components/atoms';
import type { TransformedGraphDataPoint } from '@/hooks/useGlucoseData';
import type { SensorExpiryStatus } from '@/hooks/useSensorExpiry';
import './GlucoseDisplay.css';

export interface GlucoseDisplayProps {
  glucose?: number;
  daysToExpire: number | null;
  sensorStatus: SensorExpiryStatus;
  graphData: TransformedGraphDataPoint[];
  currentTrendArrow?: number;
  uom: number; // 0 = mg/dL, 1 = mmol/L
}

/**
 * Organism GlucoseDisplay component
 * Shows current glucose value with trend arrow and sensor info
 */
const GlucoseDisplay = memo(function GlucoseDisplay({
  glucose,
  daysToExpire,
  sensorStatus,
  graphData,
  currentTrendArrow,
  uom,
}: GlucoseDisplayProps) {
  if (glucose === undefined) return null;

  // Get trend arrow display
  const trendIcon = getTrendIcon(currentTrendArrow);
  const trendClass = getTrendClass(currentTrendArrow);

  // Calculate delta (change from previous reading) - round to avoid decimals
  const delta = graphData.length >= 2
    ? Math.round(graphData[graphData.length - 1].value - graphData[graphData.length - 2].value)
    : 0;

  // Get latest reading time
  const latestTime = graphData.length > 0
    ? graphData[graphData.length - 1].time
    : new Date();

  // Sensor expiry status display
  const sensorStatusDisplay = getSensorStatusDisplay(daysToExpire, sensorStatus);

  // Unit display (0 = mmol/L, 1 = mg/dL)
  const unit = uom === 0 ? 'mmol/L' : 'mg/dL';

  return (
    <div className="glucose-display" role="region" aria-label="Current glucose reading">
      {/* Header row: Live data indicator + sensor status + time */}
      <div className="glucose-display__header">
        <span className="glucose-display__live-indicator">
          ✅ Live data
        </span>
        {sensorStatusDisplay && (
          <span className="glucose-display__sensor-status">
            {sensorStatusDisplay}
          </span>
        )}
        <span className="glucose-display__time">
          {latestTime.toLocaleTimeString()}
        </span>
      </div>

      {/* Main glucose value */}
      <div className="glucose-display__value" aria-live="polite">
        {glucose}
        <span className="glucose-display__unit"> {unit}</span>
      </div>

      {/* Trend row: arrow + delta */}
      <div className={`glucose-display__trend ${trendClass}`}>
        <Icon variant={trendIcon} size="large">
          {trendIcon === 'trend-up' ? '↑' : trendIcon === 'trend-down' ? '↓' : '→'}
        </Icon>
        {delta !== 0 && (
          <span className="glucose-display__delta">
            {delta > 0 ? '+' : ''}
            {delta} {unit}/5min
          </span>
        )}
      </div>
    </div>
  );
});

function getTrendIcon(arrow: number | undefined): 'trend-up' | 'trend-down' | 'trend-stable' {
  if (!arrow) return 'trend-stable';
  // 1=down, 2=right-down, 3=right, 4=right-up, 5=up
  if (arrow <= 2) return 'trend-down';
  if (arrow >= 4) return 'trend-up';
  return 'trend-stable';
}

function getTrendClass(arrow: number | undefined): string {
  const icon = getTrendIcon(arrow);
  return `glucose-display__trend--${icon}`;
}

function getSensorStatusDisplay(daysToExpire: number | null, status: SensorExpiryStatus): string | null {
  if (daysToExpire === null) return null;
  if (status === 'critical') return `⚠️ Expires in ${daysToExpire}d`;
  if (status === 'warning') return `Expires in ${daysToExpire}d`;
  return null;
}

export default GlucoseDisplay;