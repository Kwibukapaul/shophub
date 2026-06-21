import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div className="max-w-md card">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle size={48} className="text-red-500" />
              <h1 className="text-xl font-semibold">
                {this.props.title || "This page ran into a problem."}
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                {this.props.description ||
                  "You can retry this page without affecting the rest of the app."}
              </p>

              {this.state.error?.message && (
                <p className="mt-3 text-sm text-red-600">
                  {this.state.error.message}
                </p>
              )}

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="btn"
                >
                  Retry Page
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                If the issue continues, move to another page and come back
                later.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
export default ErrorBoundary;
