"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addTrainer } from "@/app/(dashboard)/gym-admin/members/actions";
import { X } from "lucide-react";

export function AddTrainerSheet({ gymId }: { gymId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("gym_id", gymId);
    const result = await addTrainer(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      formRef.current?.reset();
      setOpen(false);
      setLoading(false);
    }
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
        + Add trainer
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 90,
              backdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "420px",
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
                <h2
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "var(--foreground)",
                    lineHeight: 1,
                  }}
                >
                  Add trainer
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
                  Register a trainer for your gym
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  color: "var(--muted-foreground)",
                  padding: "0.375rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              style={{
                flex: 1,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.125rem",
              }}
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
                <Label htmlFor="t_full_name" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Full name <span style={{ color: "var(--destructive)" }}>*</span>
                </Label>
                <Input id="t_full_name" name="full_name" placeholder="e.g. Chukwuemeka Nwosu" required className="h-10" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="t_email" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Email <span style={{ color: "var(--destructive)" }}>*</span>
                </Label>
                <Input id="t_email" name="email" type="email" placeholder="trainer@example.com" required className="h-10" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="t_phone" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Phone
                </Label>
                <Input id="t_phone" name="phone" type="tel" placeholder="+234 800 000 0000" className="h-10" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="t_password" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Initial password <span style={{ color: "var(--destructive)" }}>*</span>
                </Label>
                <Input
                  id="t_password"
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="h-10"
                />
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                  Share this with the trainer. They can reset it anytime.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="t_spec" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Specialization
                </Label>
                <Input
                  id="t_spec"
                  name="specialization"
                  placeholder="e.g. Strength & Conditioning"
                  className="h-10"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="t_bio" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Bio
                </Label>
                <textarea
                  id="t_bio"
                  name="bio"
                  placeholder="Short bio about the trainer…"
                  rows={3}
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
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  style={{ flex: 1, height: "2.5rem", fontSize: "0.875rem" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: "2.5rem",
                    fontSize: "0.875rem",
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {loading ? "Adding…" : "Add trainer"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
