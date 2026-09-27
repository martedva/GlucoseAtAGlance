import { memo } from 'react';
import type { ConnectionStatus } from '@/hooks/useConnectionStatus';

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
          bgColor: '#fee2e2',
          borderColor: '#fecaca',
          color: '#dc2626',
          icon: '❌',
          text: 'No connection',
          subtext: 'Unable to fetch latest data',
        };
      case 'stale':
        return {
          bgColor: '#fef3c7',
          borderColor: '#fde68a',
          color: '#92400e',
          icon: '⚠️',
          text: 'Data may be outdated',
          subtext: lastSuccessfulFetch
            ? `Last updated: ${lastSuccessfulFetch.toLocaleTimeString()}`
            : 'Last update time unknown',
        };
      default:
        return {
          bgColor: '#d1fae5',
          borderColor: '#a7f3d0',
          color: '#047857',
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '6px',
        fontSize: '12px',
        color: config.color,
        width: '100%',
        marginBottom: '12px',
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span style={{ fontSize: '14px' }}>{config.icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontWeight: 500 }}>{config.text}</span>
        <span style={{ fontSize: '11px', opacity: 0.8 }}>{config.subtext}</span>
      </div>
    </div>
  );
});

export default ConnectionStatusIndicator;
