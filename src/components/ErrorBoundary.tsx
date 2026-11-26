import React from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReturn?: () => void;
  returnLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering issue occurred.'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UI ErrorBoundary caught error:', error, errorInfo);
  }

  private handleRecover = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto my-10 p-6 sm:p-8 bg-white border border-slate-300 rounded-2xl shadow-md text-center space-y-4 text-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">
              {this.props.fallbackTitle || 'Display Recovered Safely'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {this.state.errorMessage}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={this.handleRecover}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload View</span>
            </button>
            {this.props.onReturn && (
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, errorMessage: '' });
                  this.props.onReturn?.();
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{this.props.returnLabel || 'Return'}</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
