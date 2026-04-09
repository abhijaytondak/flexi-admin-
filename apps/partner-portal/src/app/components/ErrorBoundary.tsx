import { Component, type ErrorInfo, type ReactNode } from "react";

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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "var(--color-background)",
            fontFamily: "'IBM Plex Sans', sans-serif",
            padding: "var(--space-6)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: 480,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--rounded-full)",
                backgroundColor: "var(--brand-red-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-5)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--brand-red)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: "var(--text-xl)",
                fontWeight: 600,
                color: "var(--color-foreground)",
                margin: "0 0 var(--space-2)",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-muted-foreground)",
                margin: "0 0 var(--space-6)",
                lineHeight: 1.6,
              }}
            >
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
              <button
                onClick={() => { window.location.href = "/"; }}
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  backgroundColor: "transparent",
                  color: "var(--color-foreground)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--rounded-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  cursor: "pointer",
                  transition: "background-color 200ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-card)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Go to Dashboard
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  backgroundColor: "var(--brand-accent, #E8683A)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--rounded-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  cursor: "pointer",
                  transition: "background-color 200ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent-hover, #D4582F)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-accent, #E8683A)")}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
