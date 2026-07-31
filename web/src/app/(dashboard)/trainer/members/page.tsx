import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  active:    { color: "oklch(0.45 0.15 155)", bg: "oklch(0.96 0.05 155)", border: "oklch(0.88 0.09 155)" },
  expired:   { color: "oklch(0.5 0.17 25)",   bg: "oklch(0.97 0.04 25)",  border: "oklch(0.87 0.08 25)" },
  suspended: { color: "oklch(0.5 0.12 70)",   bg: "oklch(0.97 0.04 70)",  border: "oklch(0.87 0.07 70)" },
  pending:   { color: "var(--muted-foreground)", bg: "var(--muted)", border: "var(--border)" },
};

export default async function TrainerMembersPage() {
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

  const { data: trainerRecord } = await supabase
    .from("gym_trainers")
    .select("id")
    .eq("gym_id", profile.gym_id)
    .eq("profile_id", user.id)
    .single();
  if (!trainerRecord) redirect("/login");

  // Fetch assigned members with profile + plan info
  const { data: members } = await supabase
    .from("gym_members")
    .select("id, status, end_date, profiles:profile_id(full_name, email), membership_plans:membership_plan_id(name)")
    .eq("trainer_id", trainerRecord.id)
    .order("created_at", { ascending: false });

  const memberIds = (members ?? []).map((m) => m.id);

  // Last check-in per member
  const { data: checkIns } = memberIds.length
    ? await supabase
        .from("check_ins")
        .select("gym_member_id, checked_in_at")
        .in("gym_member_id", memberIds)
        .eq("status", "success")
        .order("checked_in_at", { ascending: false })
    : { data: [] };

  const lastCheckInMap = new Map<string, string>();
  (checkIns ?? []).forEach((c) => {
    if (!lastCheckInMap.has(c.gym_member_id)) {
      lastCheckInMap.set(c.gym_member_id, c.checked_in_at);
    }
  });

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "860px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
          Trainer
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
          My Members
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
          {members?.length ?? 0} member{members?.length !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden" }}>
        {!members || members.length === 0 ? (
          <div style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", opacity: 0.25, marginBottom: "0.75rem" }}>◉</div>
            <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)", marginBottom: "0.25rem" }}>
              No members assigned yet
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
              Ask your gym admin to assign members to your profile.
            </p>
          </div>
        ) : (
          members.map((m, i) => {
            const profile = m.profiles as unknown as { full_name: string; email: string } | null;
            const plan = m.membership_plans as unknown as { name: string } | null;
            const lastCheckIn = lastCheckInMap.get(m.id);
            const s = STATUS_COLORS[m.status] ?? STATUS_COLORS.pending;
            const endDate = m.end_date
              ? new Date(m.end_date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
              : null;

            return (
              <div
                key={m.id}
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: i < members.length - 1 ? "1px solid var(--border)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Name + email */}
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)", marginBottom: "0.15rem" }}>
                    {profile?.full_name ?? "—"}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                    {profile?.email}
                  </p>
                </div>

                {/* Plan + expiry */}
                <div style={{ minWidth: "120px" }}>
                  <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--foreground)" }}>
                    {plan?.name ?? "No plan"}
                  </p>
                  {endDate && (
                    <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                      Expires {endDate}
                    </p>
                  )}
                </div>

                {/* Status */}
                <span
                  style={{
                    fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", padding: "0.18rem 0.55rem",
                    borderRadius: "100px", color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                    flexShrink: 0,
                  }}
                >
                  {m.status}
                </span>

                {/* Last check-in */}
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", minWidth: "80px", textAlign: "right", flexShrink: 0 }}>
                  {lastCheckIn
                    ? new Date(lastCheckIn).toLocaleDateString("en-NG", { month: "short", day: "numeric" })
                    : "No check-ins"}
                </p>

                {/* View link */}
                <Link
                  href={`/trainer/members/${m.id}`}
                  style={{
                    padding: "0.4rem 0.875rem",
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.375rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  View
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
