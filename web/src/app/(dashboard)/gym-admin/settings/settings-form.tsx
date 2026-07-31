"use client";

import { useActionState } from "react";
import { updateGymDetails } from "./actions";

type Gym = {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

const initialState = { error: undefined as string | undefined, success: false };

export function SettingsForm({ gym }: { gym: Gym }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await updateGymDetails(formData);
      return result as typeof initialState;
    },
    initialState
  );

  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    color: "var(--foreground)",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--muted-foreground)",
    marginBottom: "0.4rem",
    letterSpacing: "0.03em",
  };

  return (
    <form action={formAction}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
        {/* Gym name */}
        <div>
          <label htmlFor="name" style={labelStyle}>Gym name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={gym.name ?? ""}
            style={inputStyle}
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label style={labelStyle}>Email (login — cannot be changed)</label>
          <input
            type="email"
            value={gym.email ?? ""}
            readOnly
            style={{ ...inputStyle, opacity: 0.55, cursor: "not-allowed" }}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" style={labelStyle}>Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={gym.phone ?? ""}
            style={inputStyle}
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" style={labelStyle}>Address</label>
          <textarea
            id="address"
            name="address"
            rows={3}
            defaultValue={gym.address ?? ""}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Feedback */}
        {state?.error && (
          <p style={{ fontSize: "0.8rem", color: "var(--destructive)", margin: 0 }}>
            {state.error}
          </p>
        )}
        {state?.success && (
          <p style={{ fontSize: "0.8rem", color: "oklch(0.45 0.14 155)", margin: 0, fontWeight: 600 }}>
            Settings saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "0.65rem 1.5rem",
            background: pending ? "var(--muted)" : "var(--primary)",
            color: pending ? "var(--muted-foreground)" : "#fff",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: pending ? "not-allowed" : "pointer",
            alignSelf: "flex-start",
            transition: "opacity 0.15s",
          }}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
