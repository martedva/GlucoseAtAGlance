import { Component, type ErrorInfo, type ReactNode } from 'react';

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
        <div
          role="alert"
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            margin: '20px',
            border: '1px solid #ef9a9a',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>⚠️ Something went wrong</h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.5' }}>
            {friendlyMessage}
          </p>
          {this.state.error?.message && (
            <details style={{ marginBottom: '15px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}>
                Technical details
              </summary>
              <code
                style={{
                  display: 'block',
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontSize: '11px',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.error.message}
              </code>
            </details>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d32f2f')}
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
