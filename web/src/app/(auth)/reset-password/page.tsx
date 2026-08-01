"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "../actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (done) {
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
          ✓
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
          Password updated
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
          Redirecting you to sign in…
        </p>
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
          Set new password
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Choose a strong password for your account.
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
          <Label htmlFor="password" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            New password
          </Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Min. 8 characters"
            minLength={8}
            required
            className="h-10"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="confirm" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Confirm password
          </Label>
          <PasswordInput
            id="confirm"
            name="confirm"
            placeholder="Repeat your password"
            minLength={8}
            required
            className="h-10"
          />
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
