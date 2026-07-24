"use client";

import { useTransition } from "react";
import { markAllNotificationsRead } from "./actions";

export function MarkAllReadButton({ gymId, profileId }: { gymId: string; profileId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await markAllNotificationsRead(gymId, profileId); })}
      disabled={isPending}
      style={{
        background: "var(--muted)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "0.5rem 1rem",
        fontSize: "0.8rem",
        fontWeight: 500,
        color: "var(--foreground)",
        cursor: isPending ? "not-allowed" : "pointer",
        fontFamily: "var(--font-jakarta)",
        opacity: isPending ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      {isPending ? "Marking…" : "Mark all as read"}
    </button>
  );
}
