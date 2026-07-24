"use client";

import { useTransition } from "react";
import { markNotificationRead } from "./actions";

const TYPE_ICONS: Record<string, string> = {
  announcement: "◈",
  payment: "◎",
  membership: "◆",
  workout: "◐",
  checkin: "◉",
};

export function NotificationItem({
  notification,
  isLast,
}: {
  notification: {
    id: string;
    title: string;
    body: string;
    type: string;
    is_read: boolean;
    created_at: string;
    profile_id: string | null;
  };
  isLast: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      style={{
        display: "flex",
        gap: "0.875rem",
        padding: "1rem 1.25rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        background: notification.is_read ? "transparent" : "color-mix(in oklch, var(--primary) 4%, var(--card))",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: notification.is_read
            ? "var(--muted)"
            : "color-mix(in oklch, var(--primary) 12%, transparent)",
          border: `1px solid ${notification.is_read ? "var(--border)" : "color-mix(in oklch, var(--primary) 25%, transparent)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          color: notification.is_read ? "var(--muted-foreground)" : "var(--primary)",
          flexShrink: 0,
          marginTop: "0.125rem",
        }}
      >
        {TYPE_ICONS[notification.type] ?? "◈"}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: notification.is_read ? 400 : 600,
              color: "var(--foreground)",
              lineHeight: 1.4,
            }}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <button
              onClick={() =>
                startTransition(async () => { await markNotificationRead(notification.id); })
              }
              disabled={isPending}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.72rem",
                color: "var(--primary)",
                fontWeight: 500,
                padding: 0,
                flexShrink: 0,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Mark read
            </button>
          )}
        </div>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--muted-foreground)",
            lineHeight: 1.6,
            marginBottom: "0.375rem",
          }}
        >
          {notification.body}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              background: "var(--muted)",
              padding: "0.1rem 0.4rem",
              borderRadius: "100px",
              border: "1px solid var(--border)",
            }}
          >
            {notification.type}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
            {new Date(notification.created_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
