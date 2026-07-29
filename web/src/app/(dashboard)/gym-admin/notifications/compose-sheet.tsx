"use client";

import { useState, useTransition, useRef } from "react";
import { X, Send } from "lucide-react";
import { sendAnnouncement } from "./actions";

type Member = { profileId: string; fullName: string; email: string };

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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.3rem", display: "block" }}>
      {children}
    </span>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>{children}</div>;
}

export function ComposeSheet({ gymId, members }: { gymId: string; members: Member[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("gym_id", gymId);

    startTransition(async () => {
      const result = await sendAnnouncement(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          padding: "0.6rem 1.25rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-jakarta)",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          flexShrink: 0,
        }}
      >
        <Send size={14} />
        Compose
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 90, backdropFilter: "blur(2px)" }}
          />
          <div
            style={{
              position: "fixed",
              top: 0, right: 0, bottom: 0,
              width: "440px",
              maxWidth: "100vw",
              background: "var(--background)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.18)",
              zIndex: 91,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            <div
              style={{
                padding: "1.375rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--card)",
                flexShrink: 0,
              }}
            >
              <div>
                <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--foreground)", lineHeight: 1 }}>
                  Compose notification
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
                  Send an announcement or reminder to members
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "0.375rem", cursor: "pointer", color: "var(--muted-foreground)", padding: "0.375rem", display: "flex", alignItems: "center" }}
              >
                <X size={15} />
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.125rem" }}
            >
              {error && (
                <div style={{ background: "color-mix(in oklch, var(--destructive) 10%, var(--background))", color: "var(--destructive)", fontSize: "0.8rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)" }}>
                  {error}
                </div>
              )}

              <Field>
                <Label>Send to</Label>
                <select name="audience" style={selectStyle} defaultValue="all">
                  <option value="all">All members</option>
                  {members.map((m) => (
                    <option key={m.profileId} value={m.profileId}>
                      {m.fullName} ({m.email})
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <Label>Title <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>(optional)</span></Label>
                <input name="title" placeholder="e.g. Holiday hours update" style={inputStyle} />
              </Field>

              <Field>
                <Label>Message <span style={{ color: "var(--destructive)" }}>*</span></Label>
                <textarea
                  name="body"
                  required
                  placeholder="Write your message here…"
                  rows={5}
                  style={{
                    borderRadius: "0.375rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    padding: "0.625rem 0.75rem",
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-jakarta)",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                    width: "100%",
                  }}
                />
              </Field>

              <div style={{ marginTop: "auto", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ flex: 1, height: "2.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "0.875rem", cursor: "pointer", fontFamily: "var(--font-jakarta)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ flex: 1, height: "2.5rem", borderRadius: "0.5rem", border: "none", background: "var(--primary)", color: "white", fontSize: "0.875rem", fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "var(--font-jakarta)", opacity: isPending ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                >
                  <Send size={14} />
                  {isPending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
