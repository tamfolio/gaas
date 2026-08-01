"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          fontSize: "1.75rem",
        }}
      >
        ◌
      </div>

      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.5rem",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--foreground)",
          marginBottom: "0.625rem",
          lineHeight: 1.1,
        }}
      >
        You&apos;re offline
      </h1>

      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--muted-foreground)",
          maxWidth: "280px",
          lineHeight: 1.65,
          marginBottom: "2rem",
        }}
      >
        Check your internet connection and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "0.65rem 1.75rem",
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: "-0.01em",
        }}
      >
        Try again
      </button>

      <p
        style={{
          marginTop: "2.5rem",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--primary)",
          textTransform: "uppercase",
        }}
      >
        EngineRoom
      </p>
    </div>
  );
}
