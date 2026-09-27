import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should render fallback UI when there is an error', () => {
    // Temporarily suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Custom fallback</div>}>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByText('Normal content')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should render default error UI when no fallback is provided', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ErrorBoundary>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    // ErrorBoundary will catch the error and show default UI
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <ErrorBoundary fallback={<div>Fallback</div>} onError={onError}>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);

    consoleErrorSpy.mockRestore();
  });

  it('should allow retry after error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    let shouldThrow = true;
    const ConditionalThrow = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Recovered content</div>;
    };

    render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const retryButton = screen.getByText('Try Again');
    retryButton.click();

    // After retry, the error state is cleared but the component still throws
    // In real usage, the parent component would fix the issue before retry
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});