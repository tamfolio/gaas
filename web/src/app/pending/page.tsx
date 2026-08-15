import Link from "next/link";
import { logout } from "@/app/(auth)/actions";

export default function PendingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1.3rem",
              letterSpacing: "-0.04em",
              color: "var(--foreground)",
            }}
          >
            Engine<span style={{ color: "var(--primary)" }}>Room</span>
          </span>
        </Link>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          padding: "3rem 2.5rem",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "oklch(0.97 0.06 90)",
            border: "2px solid oklch(0.88 0.10 90)",
            fontSize: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          ⏳
        </div>

        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--foreground)",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}
        >
          Pending approval
        </h1>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.65,
            marginBottom: "2rem",
          }}
        >
          Your gym registration is currently under review. Once approved, you&apos;ll be able to access your dashboard.
          <br /><br />
          We typically review applications within 24 hours. Check your email for a confirmation.
        </p>

        <form action={logout}>
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              padding: "0.5rem 1.25rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              cursor: "pointer",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
