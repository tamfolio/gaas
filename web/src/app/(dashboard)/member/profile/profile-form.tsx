"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateOwnProfile } from "./actions";

const inputStyle: React.CSSProperties = {
  height: "2.5rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--border)",
  background: "var(--background)",
  color: "var(--foreground)",
  padding: "0 0.75rem",
  fontSize: "0.875rem",
  fontFamily: "var(--font-jakarta)",
  outline: "none",
  width: "100%",
};

const readonlyInputStyle: React.CSSProperties = {
  ...inputStyle,
  background: "var(--muted)",
  color: "var(--muted-foreground)",
  cursor: "not-allowed",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "0.78rem",
        fontWeight: 500,
        color: "var(--foreground)",
        marginBottom: "0.3rem",
        display: "block",
      }}
    >
      {children}
    </span>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>{children}</div>;
}

export function ProfileForm({
  defaultName,
  defaultPhone,
  email,
}: {
  defaultName: string;
  defaultPhone: string;
  email: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const fd = new FormData();
    fd.set("full_name", name);
    fd.set("phone", phone);

    startTransition(async () => {
      const result = await updateOwnProfile(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {error && (
        <div
          style={{
            background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
            color: "var(--destructive)",
            fontSize: "0.78rem",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.5rem",
            border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
          }}
        >
          {error}
        </div>
      )}

      <Field>
        <Label>Full name</Label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          style={inputStyle}
        />
      </Field>

      <Field>
        <Label>Email address</Label>
        <input value={email} readOnly style={readonlyInputStyle} />
        <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
          Email cannot be changed here.
        </span>
      </Field>

      <Field>
        <Label>Phone number</Label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 800 000 0000"
          style={inputStyle}
        />
      </Field>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.25rem" }}>
        {saved && (
          <span
            style={{
              fontSize: "0.78rem",
              color: "oklch(0.45 0.12 155)",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Check size={13} />
            Saved
          </span>
        )}
        <button
          type="submit"
          disabled={isPending}
          style={{
            height: "2.5rem",
            padding: "0 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "var(--foreground)",
            color: "var(--background)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-jakarta)",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
