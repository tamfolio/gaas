"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
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
          Welcome back
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Sign in to your gym dashboard
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
          <Label
            htmlFor="email"
            style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}
          >
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

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Label
              htmlFor="password"
              style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="h-10"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10"
          disabled={loading}
          style={{ marginTop: "0.25rem" }}
        >
          {loading ? "Signing in…" : "Sign in"}
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
        Own a gym?{" "}
        <Link
          href="/register"
          style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
        >
          Register your gym →
        </Link>
      </p>
    </div>
  );
}
