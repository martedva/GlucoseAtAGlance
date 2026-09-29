import { memo } from 'react';
import { Button } from '@/components/atoms';
import styles from './ErrorMessage.module.scss';

export interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

/**
 * Organism ErrorMessage component
 * Error message display with retry button
 * Uses ARIA live region for screen reader announcements
 */
const ErrorMessage = memo(function ErrorMessage({ error, onRetry, isRetrying }: ErrorMessageProps) {
  return (
    <div className={styles.errorMessage} role="alert" aria-live="assertive" aria-atomic="true">
      {error}
      <Button
        variant="danger"
        size="small"
        onClick={onRetry}
        className={styles.errorMessage__retryButton}
        aria-label="Retry loading glucose data"
        disabled={isRetrying}
      >
        Retry
      </Button>
    </div>
  );
});

export default ErrorMessage;