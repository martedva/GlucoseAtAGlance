interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
}

/**
 * Error message display with retry button
 * Uses ARIA live region for screen reader announcements
 */
const ErrorMessage = ({ error, onRetry, isRetrying }: ErrorMessageProps) => {
  return (
    <div className="error-message" role="alert" aria-live="assertive" aria-atomic="true">
      {error}
      <button
        type="button"
        onClick={onRetry}
        className="retry-button"
        aria-label="Retry loading glucose data"
        disabled={isRetrying}
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorMessage;