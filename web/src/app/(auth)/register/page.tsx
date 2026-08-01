"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { registerGym } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        marginBottom: "1.25rem",
      }}
    >
      <div
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: "var(--primary)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
    </div>
  );
}

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await registerGym(new FormData(e.currentTarget));
      if (result?.error) {
        setError(result.error);
      }
    });
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
          Register your gym
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Set up in minutes. Start managing members today.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
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

        <SectionLabel>Gym Details</SectionLabel>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="gym_name" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Gym Name
          </Label>
          <Input id="gym_name" name="gym_name" placeholder="FitZone Lagos" required className="h-10" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="gym_email" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Gym Email
          </Label>
          <Input id="gym_email" name="gym_email" type="email" placeholder="info@yourgym.com" required className="h-10" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="gym_phone" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Gym Phone
          </Label>
          <Input id="gym_phone" name="gym_phone" type="tel" placeholder="+234 800 000 0000" required className="h-10" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="gym_address" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Gym Address
          </Label>
          <Input id="gym_address" name="gym_address" placeholder="123 Fitness Street, Lagos" required className="h-10" />
        </div>

        <div style={{ marginTop: "0.5rem" }}>
          <SectionLabel>Your Account</SectionLabel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="admin_name" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Your Full Name
          </Label>
          <Input id="admin_name" name="admin_name" placeholder="John Doe" required className="h-10" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="admin_email" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Your Email
          </Label>
          <Input id="admin_email" name="admin_email" type="email" placeholder="you@example.com" required className="h-10" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <Label htmlFor="password" style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
            Password
          </Label>
          <PasswordInput id="password" name="password" placeholder="Min. 8 characters" minLength={8} required className="h-10" />
        </div>

        <Button
          type="submit"
          className="w-full h-10"
          disabled={isPending}
          style={{ marginTop: "0.5rem" }}
        >
          {isPending ? "Setting up your gym…" : "Create gym account"}
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
        Already have an account?{" "}
        <Link
          href="/login"
          style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
        >
          Sign in →
        </Link>
      </p>
    </div>
  );
}
