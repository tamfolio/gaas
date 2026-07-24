"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "4rem auto",
        textAlign: "center",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <div
        style={{
          width: "3rem",
          height: "3rem",
          borderRadius: "0.75rem",
          background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
          border: "1px solid color-mix(in oklch, var(--destructive) 20%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          margin: "0 auto 1.5rem",
        }}
      >
        ✕
      </div>
      <h2
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.25rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--foreground)",
          marginBottom: "0.5rem",
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--muted-foreground)",
          lineHeight: 1.6,
          marginBottom: "1.75rem",
        }}
      >
        {error.message ?? "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        style={{
          background: "var(--primary)",
          color: "var(--brand-dark-fg)",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "0.625rem 1.5rem",
          borderRadius: "0.5rem",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Try again
      </button>
    </div>
  );
}
