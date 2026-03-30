import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        minHeight: "calc(100vh - 60px)",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: 120,
          fontWeight: 700,
          color: "var(--brand-navy-alpha-12)",
          lineHeight: 1,
          margin: 0,
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 600,
          color: "var(--color-foreground)",
          margin: "var(--space-3) 0 var(--space-1)",
        }}
      >
        Page not found
      </p>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-muted-foreground)",
          margin: "0 0 var(--space-6)",
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 transition-all duration-200"
        style={{
          padding: "var(--space-2) var(--space-5)",
          backgroundColor: "var(--brand-navy)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--rounded-md)",
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          fontFamily: "'IBM Plex Sans', sans-serif",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--brand-navy-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--brand-navy)")
        }
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );
}
