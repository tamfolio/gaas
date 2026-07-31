import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TrainerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, gym_id")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id) redirect("/login");

  const [{ data: trainerRecord }, { data: gym }] = await Promise.all([
    supabase
      .from("gym_trainers")
      .select("id, specialization")
      .eq("gym_id", profile.gym_id)
      .eq("profile_id", user.id)
      .single(),
    supabase.from("gyms").select("name").eq("id", profile.gym_id).single(),
  ]);

  if (!trainerRecord) redirect("/login");

  // Fetch assigned members
  const { data: assignedMembers } = await supabase
    .from("gym_members")
    .select("id, status")
    .eq("trainer_id", trainerRecord.id);

  const totalMembers = assignedMembers?.length ?? 0;
  const activeMembers = assignedMembers?.filter((m) => m.status === "active").length ?? 0;
  const memberIds = (assignedMembers ?? []).map((m) => m.id);

  // Check-ins today from assigned members
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: checkInsToday } = memberIds.length
    ? await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .in("gym_member_id", memberIds)
        .gte("checked_in_at", todayStart.toISOString())
        .eq("status", "success")
    : { count: 0 };

  // Recent check-ins with member names
  const { data: recentCheckIns } = memberIds.length
    ? await supabase
        .from("check_ins")
        .select("id, checked_in_at, gym_member_id")
        .in("gym_member_id", memberIds)
        .eq("status", "success")
        .order("checked_in_at", { ascending: false })
        .limit(6)
    : { data: [] };

  // Build member name map
  const { data: memberProfiles } = memberIds.length
    ? await supabase
        .from("gym_members")
        .select("id, profiles:profile_id(full_name)")
        .in("id", memberIds)
    : { data: [] };

  const nameMap = new Map(
    (memberProfiles ?? []).map((m) => [
      m.id,
      (m.profiles as unknown as { full_name: string } | null)?.full_name ?? "Member",
    ])
  );

  const stats = [
    { label: "Assigned members", value: totalMembers, accent: false },
    { label: "Active", value: activeMembers, accent: false },
    { label: "Check-ins today", value: checkInsToday ?? 0, accent: true },
  ];

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "860px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
          Trainer Dashboard
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
          {profile.full_name ?? user.email}
        </h1>
        {gym?.name && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
            {gym.name}{trainerRecord.specialization && ` · ${trainerRecord.specialization}`}
          </p>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: s.accent ? "var(--primary)" : "var(--card)",
              border: s.accent ? "none" : "1px solid var(--border)",
              borderRadius: "0.875rem",
              padding: "1.375rem 1.25rem",
            }}
          >
            <p style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", color: s.accent ? "#fff" : "var(--foreground)", lineHeight: 1, marginBottom: "0.375rem" }}>
              {s.value}
            </p>
            <p style={{ fontSize: "0.78rem", fontWeight: 500, color: s.accent ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent check-ins */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.875rem", color: "var(--foreground)" }}>
            Recent check-ins
          </p>
          <Link href="/trainer/members" style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            View all members →
          </Link>
        </div>

        {!recentCheckIns || recentCheckIns.length === 0 ? (
          <div style={{ padding: "2.5rem 1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              {totalMembers === 0 ? "No members assigned to you yet." : "No check-ins recorded yet."}
            </p>
          </div>
        ) : (
          recentCheckIns.map((c, i) => {
            const time = new Date(c.checked_in_at);
            const isToday = time >= todayStart;
            return (
              <div
                key={c.id}
                style={{
                  padding: "0.875rem 1.25rem",
                  borderBottom: i < recentCheckIns.length - 1 ? "1px solid var(--border)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                }}
              >
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0, background: "oklch(0.52 0.16 155)" }} />
                <p style={{ flex: 1, fontWeight: 500, fontSize: "0.875rem", color: "var(--foreground)" }}>
                  {nameMap.get(c.gym_member_id) ?? "Member"}
                </p>
                <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", flexShrink: 0 }}>
                  {isToday
                    ? time.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                    : time.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
