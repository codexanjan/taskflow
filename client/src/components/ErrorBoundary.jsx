import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/20 dark:border-rose-550/10 bg-rose-500/5 max-w-xl mx-auto my-12 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-455">Something went wrong</h3>
            <p className="text-xs text-slate-550 dark:text-slate-450 max-w-md leading-relaxed">
              An error occurred while loading this section of the application.
            </p>
          </div>

          <div className="p-4 bg-slate-900/90 text-left rounded-xl border border-slate-850 text-[10px] font-mono text-rose-400 overflow-x-auto max-h-48">
            <div className="font-bold border-b border-slate-800 pb-1.5 mb-1.5 text-slate-400">
              Error Details:
            </div>
            <div>{this.state.error?.toString()}</div>
            {this.state.errorInfo?.componentStack && (
              <pre className="mt-2 text-slate-500 leading-normal whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition-all hover:-translate-y-0.5 cursor-pointer mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset and Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
