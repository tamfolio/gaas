import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkAllReadButton } from "./mark-all-read-button";
import { NotificationItem } from "./notification-item";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  if (!profile?.gym_id) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, type, is_read, created_at, profile_id")
    .eq("gym_id", profile.gym_id)
    .or(`profile_id.eq.${user.id},profile_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(100);

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "720px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.68rem",
              color: "var(--muted-foreground)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "0.2rem",
            }}
          >
            Member
          </p>
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
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "0.625rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 600,
                  color: "var(--primary)",
                  letterSpacing: "0",
                }}
              >
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>

        {unreadCount > 0 && (
          <MarkAllReadButton gymId={profile.gym_id} profileId={user.id} />
        )}
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
          <div style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "0.75rem",
                opacity: 0.25,
                lineHeight: 1,
              }}
            >
              ◑
            </div>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--foreground)",
                marginBottom: "0.375rem",
              }}
            >
              No notifications yet
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              Gym announcements, payment reminders, and updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <NotificationItem
              key={n.id}
              notification={n}
              isLast={i === notifications.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
