import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Maps error messages to user-friendly explanations
 */
const getUserFriendlyMessage = (errorMessage: string): string => {
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (
    lowerMessage.includes('session') ||
    lowerMessage.includes('auth') ||
    lowerMessage.includes('token')
  ) {
    return 'Your session has expired. Please log in again to continue.';
  }

  if (lowerMessage.includes('permission') || lowerMessage.includes('access')) {
    return 'Access denied. Please ensure you have the necessary permissions.';
  }

  if (lowerMessage.includes('timeout')) {
    return 'The request took too long. Please try again later.';
  }

  return 'An unexpected error occurred. Please try refreshing the page.';
};

/**
 * Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Reload the page to reset state
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const friendlyMessage = getUserFriendlyMessage(this.state.error?.message || '');

      return (
        <div className="error-boundary" role="alert">
          <h2 className="error-boundary__title">⚠️ Something went wrong</h2>
          <p className="error-boundary__message">{friendlyMessage}</p>
          {this.state.error?.message && (
            <details className="error-boundary__details">
              <summary className="error-boundary__summary">Technical details</summary>
              <code className="error-boundary__code">{this.state.error.message}</code>
            </details>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="error-boundary__retry-button"
          >
            🔄 Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;