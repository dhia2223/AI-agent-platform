// frontend/src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { captureException } from '@sentry/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // Additional context about where the error occurred
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        context: this.props.context
      }
    });
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-red-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'Please try again later'}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 text-left text-xs text-gray-500">
                <summary>Error details</summary>
                <pre className="mt-2 overflow-auto p-2 bg-gray-100 rounded">
                  {this.state.error?.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex justify-center space-x-3">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                Retry
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const navigate = useNavigate();

  const handleError = (error: unknown, context?: string) => {
    const err = error instanceof Error ? error : new Error(String(error));
    captureException(err, { extra: { context } });
    console.error('Error caught:', err);
    
    // For 401 errors, redirect to login
    if (err.message.includes('401')) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // For 403 errors, show access denied
    if (err.message.includes('403')) {
      navigate('/error', { state: { error: 'Access Denied' } });
      return;
    }

    // For other errors, show generic error page
    navigate('/error', { 
      state: { 
        error: err.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });
  };

  return { handleError };
}