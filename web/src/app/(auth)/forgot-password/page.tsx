"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await forgotPassword(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div>
        <div
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "0.625rem",
            background: "color-mix(in oklch, var(--primary) 12%, var(--background))",
            border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            marginBottom: "1.5rem",
          }}
        >
          ✉
        </div>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--foreground)",
            lineHeight: 1.05,
            marginBottom: "0.5rem",
          }}
        >
          Check your email
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          We sent a password reset link to your email. Click it to set a new password.
        </p>
        <Link
          href="/login"
          style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem" }}
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--foreground)",
            lineHeight: 1.05,
            marginBottom: "0.4rem",
          }}
        >
          Forgot password?
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        {error && (
          <div
            style={{
              background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
              color: "var(--destructive)",
              fontSize: "0.8rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="email" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-10"
          />
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p
        style={{
          marginTop: "1.75rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--muted-foreground)",
        }}
      >
        Remember it?{" "}
        <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
          Sign in →
        </Link>
      </p>
    </div>
  );
}
