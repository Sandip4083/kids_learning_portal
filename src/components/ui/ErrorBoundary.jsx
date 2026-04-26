"use client";
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[KLP Error Boundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-6 animate-bounce">🛸</div>
            <h1 className="text-3xl font-black mb-3">Oops! Something went wrong</h1>
            <p className="text-[var(--muted)] mb-6">
              Don&apos;t worry! Our space crew is fixing it. Try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-pink text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              🔄 Try Again
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-6 p-4 bg-[var(--surface-alt)] rounded-xl text-xs text-left overflow-auto max-h-40 text-danger">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
