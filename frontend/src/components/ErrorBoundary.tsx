import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error in UNTHINKABLE UI:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#08090d] text-[#f8fafc] p-6">
          <div className="max-w-md w-full bg-[#121520] border border-[#1e2433] rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-[#f8fafc]">Interface Refresh Required</h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                {this.state.error?.message || 'A transient UI rendering issue occurred. Reloading will restore your workspace.'}
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00f2c3] hover:bg-[#00f2c3]/90 text-[#08090d] text-xs font-bold transition-all shadow-sm mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
