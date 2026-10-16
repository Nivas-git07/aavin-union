import { TriangleAlert } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard rendering error", error, info);
  }
  render() {
    return this.state.error ? (
      <div className="error-state">
        <TriangleAlert size={28} />
        <h1>The dashboard needs a refresh</h1>
        <p>Your report could not be displayed. Reload to recover.</p>
        <button
          className="button primary-button"
          onClick={() => window.location.assign("/")}
        >
          Reload overview
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
