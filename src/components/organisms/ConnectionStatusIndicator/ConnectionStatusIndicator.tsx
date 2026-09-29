import { memo } from 'react';
import { AlertBanner } from '@/components/molecules';
import type { ConnectionStatus } from '@/hooks/useConnectionStatus';
import styles from './ConnectionStatusIndicator.module.scss';

export interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  lastSuccessfulFetch: Date | null;
}

/**
 * Organism ConnectionStatusIndicator component
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
          variant: 'error' as const,
          icon: '❌',
          text: 'No connection',
          subtext: 'Unable to fetch latest data',
        };
      case 'stale':
        return {
          variant: 'warning' as const,
          icon: '⚠️',
          text: 'Data may be outdated',
          subtext: lastSuccessfulFetch
            ? `Last updated: ${lastSuccessfulFetch.toLocaleTimeString()}`
            : 'Last update time unknown',
        };
      default:
        return {
          variant: 'success' as const,
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
    <div className={styles.connectionStatus}>
      <AlertBanner
        variant={config.variant}
        icon={config.icon}
        text={config.text}
        subtext={config.subtext}
      />
    </div>
  );
});

export default ConnectionStatusIndicator;