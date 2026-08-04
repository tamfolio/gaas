"use client";

import { useState, useTransition } from "react";
import { GitBranch } from "lucide-react";
import { toggleBranchesFeature } from "./actions";

export function BranchesToggle({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const result = await toggleBranchesFeature(next);
      if (result?.error) setOn(!next);
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.125rem 1.5rem",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "0.5rem",
            background: on
              ? "color-mix(in oklch, var(--primary) 12%, transparent)"
              : "var(--muted)",
            border: `1px solid ${on ? "color-mix(in oklch, var(--primary) 25%, transparent)" : "var(--border)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <GitBranch size={15} style={{ color: on ? "var(--primary)" : "var(--muted-foreground)" }} />
        </div>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
            Multiple branches
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.1rem" }}>
            {on
              ? "Branches enabled — manage locations and control plan access per branch."
              : "Enable to manage multiple gym locations with per-branch membership access."}
          </div>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={pending}
        aria-label={on ? "Disable branches" : "Enable branches"}
        style={{
          width: "44px",
          height: "24px",
          borderRadius: "100px",
          background: on ? "var(--primary)" : "var(--muted)",
          border: `2px solid ${on ? "var(--primary)" : "var(--border)"}`,
          cursor: pending ? "default" : "pointer",
          position: "relative",
          transition: "background 0.2s, border-color 0.2s",
          flexShrink: 0,
          opacity: pending ? 0.6 : 1,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: on ? "20px" : "2px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}
