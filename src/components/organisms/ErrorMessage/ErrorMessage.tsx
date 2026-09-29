import { memo } from 'react';
import { Button } from '@/components/atoms';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

/**
 * Organism ErrorMessage component
 * Error message display with retry button
 */
const ErrorMessage = memo(function ErrorMessage({ error, onRetry, isRetrying }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert" aria-live="assertive" aria-atomic="true">
      {error}
      <Button
        variant="danger"
        size="small"
        onClick={onRetry}
        className="error-message__retry-button"
        aria-label="Retry loading glucose data"
        disabled={isRetrying}
      >
        Retry
      </Button>
    </div>
  );
});

export default ErrorMessage;