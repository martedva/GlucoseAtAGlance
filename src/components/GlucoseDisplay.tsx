import type { SensorExpiryStatus } from "@/hooks/useSensorExpiry";
import { predictGlucoseTrend } from "@/utils/trend-prediction";
import { memo } from "react";

interface GraphDataPoint {
  time: Date;
  value: number;
  trendArrow?: number; // API trend arrow: 1=down, 2=right-down, 3=right, 4=right-up, 5=up
}

interface GlucoseDisplayProps {
  glucose?: number;
  daysToExpire: number | null;
  sensorStatus: SensorExpiryStatus;
  graphData?: GraphDataPoint[];
  currentTrendArrow?: number; // API trend arrow: 1=down, 2=right-down, 3=right, 4=right-up, 5=up
}

const getExpiryStyles = (status: SensorExpiryStatus) => {
  switch (status) {
    case "critical":
      return { color: "#d32f2f", fontWeight: 500 as const };
    case "warning":
      return { color: "#f57c00", fontWeight: 500 as const };
    default:
      return { color: "#666", fontWeight: 400 as const };
  }
};

const getSensorStatusLabel = (status: SensorExpiryStatus): string => {
  switch (status) {
    case "critical":
      return "Critical - sensor expiring soon";
    case "warning":
      return "Warning - sensor expiring in a few days";
    default:
      return "Normal - sensor operating normally";
  }
};

/**
 * Convert API trend arrow code to emoji
 * API codes: 1=down, 2=right-down, 3=right, 4=right-up, 5=up
 */
const getTrendArrowFromApi = (arrowCode: number | undefined): string | null => {
  if (arrowCode === undefined) return null;
  switch (arrowCode) {
    case 1:
      return "↓";
    case 2:
      return "↘️";
    case 3:
      return "→";
    case 4:
      return "↗️";
    case 5:
      return "↑";
    default:
      return "→";
  }
};

/**
 * Get trend description based on API trend arrow
 */
const getTrendDescriptionFromApi = (arrowCode: number | undefined): string => {
  if (arrowCode === undefined) return "stable";
  switch (arrowCode) {
    case 1:
      return "falling fast";
    case 2:
      return "falling";
    case 3:
      return "stable";
    case 4:
      return "rising";
    case 5:
      return "rising fast";
    default:
      return "stable";
  }
};

/**
 * Memoized glucose display component
 * Shows current glucose value, sensor expiry, and trend
 */
const GlucoseDisplay = memo(function GlucoseDisplay({
  glucose,
  daysToExpire,
  sensorStatus,
  graphData,
  currentTrendArrow,
}: GlucoseDisplayProps) {
  const expiryStyles = getExpiryStyles(sensorStatus);

  // Use API trend arrow directly for the arrow display
  const trendArrow = getTrendArrowFromApi(currentTrendArrow);

  // Get trend description from API arrow
  const trendDescription = getTrendDescriptionFromApi(currentTrendArrow);

  // Calculate predicted glucose value in 15 minutes (optional, from graph data)
  const predictedGlucose15min =
    graphData && graphData.length > 0
      ? (glucose ?? 0) +
        (predictGlucoseTrend(graphData)?.predictedChange15min ?? 0)
      : null;

  // Determine trend color based on API trend arrow direction
  const getTrendColor = () => {
    if (currentTrendArrow === undefined) return "#666";
    if (currentTrendArrow >= 4) return "#f57c00"; // rising (orange)
    if (currentTrendArrow <= 2) return "#1976d2"; // falling (blue)
    return "#666"; // stable
  };

  const trendColor = getTrendColor();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "flex-start",
      }}
      role="region"
      aria-label="Glucose monitoring display"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <h3 style={{ margin: 0 }} aria-live="polite" aria-atomic="true">
          {glucose?.toFixed(1) ?? "--"} mmol/L
        </h3>
        {trendArrow && (
          <span
            style={{ fontSize: "20px" }}
            aria-label={`Glucose trend: ${trendDescription}`}
            title={trendDescription}
          >
            {trendArrow}
          </span>
        )}
      </div>
      {daysToExpire !== null && (
        <p
          className={`sensor-expiry ${sensorStatus}`}
          style={{
            margin: 0,
            fontSize: "13px",
            ...expiryStyles,
          }}
          aria-label={`Sensor expiry: ${getSensorStatusLabel(sensorStatus)}, ${daysToExpire} day${daysToExpire !== 1 ? "s" : ""} remaining`}
        >
          Sensor ends in {daysToExpire} day{daysToExpire !== 1 ? "s" : ""}
        </p>
      )}
      {currentTrendArrow !== undefined && (
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: trendColor,
          }}
          aria-label={`Predicted glucose trend: ${trendDescription}`}
        >
          {trendDescription.charAt(0).toUpperCase() + trendDescription.slice(1)}{" "}
          {predictedGlucose15min !== null &&
            ` (${predictedGlucose15min.toFixed(1)} mmol/L in 15 min)`}
        </p>
      )}
    </div>
  );
});

export default GlucoseDisplay;
