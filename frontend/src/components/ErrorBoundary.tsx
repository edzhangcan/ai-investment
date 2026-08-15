import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error Boundary Exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas text-content-primary flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-surface border border-border-subtle rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 prism-badge-negative rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-content-primary">
                Application Runtime Protection
              </h2>
              <p className="text-xs text-content-muted leading-relaxed">
                An unexpected UI rendering error occurred. The application state has been preserved safely.
              </p>
            </div>

            {this.state.error && (
              <div className="prism-surface-subtle p-3.5 text-left font-mono text-[11px] text-negative overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-brand hover:opacity-90 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
