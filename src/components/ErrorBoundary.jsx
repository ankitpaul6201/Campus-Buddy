import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1944F1] flex items-center justify-center mb-4 shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Something went wrong</h2>
          <p className="text-xs text-slate-500 max-w-xs mb-6">
            We encountered a temporary display issue. Tap reload to return to the marketplace.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-3 bg-[#1944F1] hover:bg-blue-700 text-white font-semibold text-xs rounded-2xl shadow-md transition-all active:scale-95"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
