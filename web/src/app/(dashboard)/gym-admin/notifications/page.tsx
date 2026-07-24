import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user!.id)
    .single();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profile!.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "720px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--muted-foreground)",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "0.25rem",
            }}
          >
            Inbox
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <h1
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1.75rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--foreground)",
                lineHeight: 1.1,
              }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                style={{
                  background: "var(--primary)",
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "100px",
                  lineHeight: 1.6,
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      >
        {!notifications || notifications.length === 0 ? (
          <div
            style={{
              padding: "4rem 1.25rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.4 }}>◐</div>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--foreground)",
                marginBottom: "0.375rem",
              }}
            >
              All caught up
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              Member activity, payment alerts, and renewals will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div
              key={n.id}
              style={{
                padding: "1rem 1.25rem",
                borderBottom:
                  i < notifications.length - 1 ? "1px solid var(--border)" : "none",
                display: "flex",
                gap: "0.875rem",
                alignItems: "flex-start",
                background: n.is_read ? "transparent" : "color-mix(in oklch, var(--primary) 5%, var(--card))",
              }}
            >
              {!n.is_read && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    flexShrink: 0,
                    marginTop: "0.4rem",
                  }}
                />
              )}
              <div style={{ flex: 1, paddingLeft: n.is_read ? "1rem" : "0" }}>
                            {n.title && (
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.15rem" }}>
                    {n.title}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: n.is_read ? "var(--muted-foreground)" : "var(--foreground)",
                    fontWeight: n.is_read ? 400 : 500,
                    lineHeight: 1.5,
                    marginBottom: "0.25rem",
                  }}
                >
                  {n.body}
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                  {new Date(n.created_at).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
