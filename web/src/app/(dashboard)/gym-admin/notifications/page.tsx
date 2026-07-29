import { createClient } from "@/lib/supabase/server";
import { ComposeSheet } from "./compose-sheet";

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  announcement: { label: "Announcement", color: "var(--primary)", bg: "color-mix(in oklch, var(--primary) 10%, transparent)", border: "color-mix(in oklch, var(--primary) 20%, transparent)" },
  expiry_7d:    { label: "Expiry — 7 days", color: "oklch(0.55 0.14 55)", bg: "oklch(0.97 0.04 55)", border: "oklch(0.88 0.07 55)" },
  expiry_3d:    { label: "Expiry — 3 days", color: "oklch(0.52 0.18 40)", bg: "oklch(0.97 0.04 40)", border: "oklch(0.87 0.08 40)" },
  reminder:     { label: "Reminder", color: "var(--muted-foreground)", bg: "var(--muted)", border: "var(--border)" },
};

function TypeBadge({ type }: { type: string }) {
  const t = TYPE_LABELS[type] ?? { label: type, color: "var(--muted-foreground)", bg: "var(--muted)", border: "var(--border)" };
  return (
    <span style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: "100px", color: t.color, background: t.bg, border: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
      {t.label}
    </span>
  );
}

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const gymId = profile!.gym_id!;

  const [{ data: notifications }, { data: members }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, title, body, type, created_at, profile_id, is_read, profiles:profile_id(full_name, email)")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("gym_members")
      .select("profiles:profile_id(id, full_name, email)")
      .eq("gym_id", gymId)
      .eq("status", "active"),
  ]);

  const memberList = (members ?? [])
    .map((m) => {
      const p = m.profiles as unknown as { id: string; full_name: string; email: string } | null;
      return p ? { profileId: p.id, fullName: p.full_name, email: p.email } : null;
    })
    .filter(Boolean) as { profileId: string; fullName: string; email: string }[];

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "800px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
            Admin
          </p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
            Notifications
          </h1>
        </div>
        <ComposeSheet gymId={gymId} members={memberList} />
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", overflow: "hidden" }}>
        {!notifications || notifications.length === 0 ? (
          <div style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>◐</div>
            <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "var(--foreground)", marginBottom: "0.375rem" }}>
              Nothing sent yet
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              Compose an announcement or wait for automated expiry alerts to appear here.
            </p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const recipient = n.profiles as unknown as { full_name: string; email: string } | null;
            return (
              <div
                key={n.id}
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <TypeBadge type={n.type ?? "announcement"} />
                    <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                      → {recipient ? `${recipient.full_name} (${recipient.email})` : "All members"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", flexShrink: 0 }}>
                    {new Date(n.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {n.title && (
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>{n.title}</p>
                )}
                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.55 }}>{n.body}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
