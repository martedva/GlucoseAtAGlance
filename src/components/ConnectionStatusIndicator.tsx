import { memo } from 'react';
import type { ConnectionStatus } from '@/hooks/useConnectionStatus';
import './ConnectionStatusIndicator.css';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  lastSuccessfulFetch: Date | null;
}

/**
 * Connection status indicator component
 * Shows clear visual feedback about data freshness
 * Critical for medical safety - users must know if data is outdated
 */
const ConnectionStatusIndicator = memo(function ConnectionStatusIndicator({
  status,
  lastSuccessfulFetch,
}: ConnectionStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'offline':
        return {
          icon: '❌',
          text: 'No connection',
          subtext: 'Unable to fetch latest data',
        };
      case 'stale':
        return {
          icon: '⚠️',
          text: 'Data may be outdated',
          subtext: lastSuccessfulFetch
            ? `Last updated: ${lastSuccessfulFetch.toLocaleTimeString()}`
            : 'Last update time unknown',
        };
      default:
        return {
          icon: '✅',
          text: 'Live data',
          subtext: lastSuccessfulFetch
            ? `Updated: ${lastSuccessfulFetch.toLocaleTimeString()}`
            : 'Just now',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`connection-status-indicator connection-status-indicator--${status}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="connection-status-indicator__icon">{config.icon}</span>
      <div className="connection-status-indicator__content">
        <span className="connection-status-indicator__text">{config.text}</span>
        <span className="connection-status-indicator__subtext">{config.subtext}</span>
      </div>
    </div>
  );
});

export default ConnectionStatusIndicator;
