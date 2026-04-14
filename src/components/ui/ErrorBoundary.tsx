import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Warning } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex h-screen items-center justify-center bg-surface text-normal">
        <div className="flex flex-col items-center gap-6 px-6 text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <Warning size={32} className="text-error" weight="duotone" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-high">Something went wrong</h1>
            <p className="text-sm text-low">
              An unexpected error occurred. You can try again or reload the page.
            </p>
          </div>
          {this.state.error && (
            <pre className="w-full rounded-lg bg-muted px-4 py-3 text-left text-xs text-low font-mono overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-elevated px-4 py-2 text-sm font-medium text-normal hover:bg-muted transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
