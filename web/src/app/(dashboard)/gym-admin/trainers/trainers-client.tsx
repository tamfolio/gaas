"use client";

import { useState } from "react";
import { TrainerDetailSheet } from "./trainer-detail-sheet";

export type TrainerRow = {
  id: string;
  profile_id: string;
  specialization: string | null;
  bio: string | null;
  created_at: string;
  profiles: { full_name: string; email: string; phone: string | null } | null;
};

export function TrainersClient({ trainers }: { trainers: TrainerRow[] }) {
  const [selected, setSelected] = useState<TrainerRow | null>(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {trainers.map((t) => {
          const p = t.profiles;
          const initials = (p?.full_name ?? "")
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div
              key={t.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                padding: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "color-mix(in oklch, var(--primary) 14%, var(--muted))",
                    border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    flexShrink: 0,
                  }}
                >
                  {initials || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "var(--foreground)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {p?.full_name ?? "—"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.1rem" }}>
                    {p?.email}
                  </div>
                </div>
              </div>

              {t.specialization && (
                <div style={{ marginBottom: "0.625rem" }}>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "var(--primary)",
                      background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                      border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "100px",
                    }}
                  >
                    {t.specialization}
                  </span>
                </div>
              )}

              {t.bio && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {t.bio}
                </p>
              )}

              <div
                style={{
                  marginTop: "0.875rem",
                  paddingTop: "0.875rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                  Added{" "}
                  {new Date(t.created_at).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => setSelected(t)}
                  style={{
                    height: "1.875rem",
                    padding: "0 0.875rem",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-jakarta)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <TrainerDetailSheet trainer={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
