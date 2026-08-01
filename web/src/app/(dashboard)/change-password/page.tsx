"use client";

import { useState, useTransition } from "react";
import { changePassword } from "./actions";
import { PasswordInput } from "@/components/password-input";

export default function ChangePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await changePassword(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "var(--brand-dark)",
            padding: "1.75rem 2rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.04em",
              marginBottom: "0.75rem",
            }}
          >
            Engine<span style={{ color: "var(--primary)" }}>Room</span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: "0.375rem",
            }}
          >
            Set your password
          </h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            You&rsquo;re logged in with a temporary password. Create a permanent one to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "1.75rem 2rem" }}>
          {error && (
            <div
              style={{
                background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
                color: "var(--destructive)",
                fontSize: "0.8rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
                marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.375rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label
                htmlFor="new_password"
                style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}
              >
                New password <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <PasswordInput
                id="new_password"
                name="new_password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="h-10"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label
                htmlFor="confirm_password"
                style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}
              >
                Confirm password <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                placeholder="Repeat your new password"
                required
                minLength={8}
                className="h-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              height: "2.75rem",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              fontFamily: "var(--font-jakarta)",
              opacity: isPending ? 0.7 : 1,
              letterSpacing: "-0.01em",
            }}
          >
            {isPending ? "Saving…" : "Set password & continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}
