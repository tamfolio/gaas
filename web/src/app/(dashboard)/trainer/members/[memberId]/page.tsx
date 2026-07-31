import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  active:    { color: "oklch(0.45 0.15 155)", bg: "oklch(0.96 0.05 155)", border: "oklch(0.88 0.09 155)" },
  expired:   { color: "oklch(0.5 0.17 25)",   bg: "oklch(0.97 0.04 25)",  border: "oklch(0.87 0.08 25)" },
  suspended: { color: "oklch(0.5 0.12 70)",   bg: "oklch(0.97 0.04 70)",  border: "oklch(0.87 0.07 70)" },
  pending:   { color: "var(--muted-foreground)", bg: "var(--muted)", border: "var(--border)" },
};

const BMI_COLORS: Record<string, string> = {
  underweight: "oklch(0.52 0.12 220)",
  normal:      "oklch(0.45 0.14 155)",
  overweight:  "oklch(0.52 0.13 70)",
  obese:       "var(--destructive)",
};

export default async function TrainerMemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: authProfile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  if (!authProfile?.gym_id) redirect("/login");

  const { data: trainerRecord } = await supabase
    .from("gym_trainers")
    .select("id")
    .eq("gym_id", authProfile.gym_id)
    .eq("profile_id", user.id)
    .single();
  if (!trainerRecord) redirect("/login");

  // Get the gym_member — verify it belongs to this trainer
  const { data: member } = await supabase
    .from("gym_members")
    .select("id, status, start_date, end_date, profile_id, profiles:profile_id(full_name, email, phone), membership_plans:membership_plan_id(name, price)")
    .eq("id", memberId)
    .eq("trainer_id", trainerRecord.id)
    .single();

  if (!member) notFound();

  const profile = member.profiles as unknown as { full_name: string; email: string; phone: string | null } | null;
  const plan = member.membership_plans as unknown as { name: string; price: number } | null;
  const s = STATUS_COLORS[member.status] ?? STATUS_COLORS.pending;

  const endDate = member.end_date
    ? new Date(member.end_date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    : null;

  // Fetch in parallel: check-ins, BMI, workout plan
  const [{ data: checkIns }, { data: bmiRecords }, { data: workoutPlan }] = await Promise.all([
    supabase
      .from("check_ins")
      .select("id, checked_in_at, status")
      .eq("gym_member_id", memberId)
      .order("checked_in_at", { ascending: false })
      .limit(10),
    supabase
      .from("bmi_records")
      .select("id, weight_kg, height_cm, bmi, category, created_at")
      .eq("gym_member_id", memberId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("workout_plans")
      .select("id, title, plan_data, ai_generated, created_at")
      .eq("gym_member_id", memberId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "860px" }}>
      {/* Back link */}
      <Link
        href="/trainer/members"
        style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "1.5rem" }}
      >
        ← Back to members
      </Link>

      {/* Header */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.875rem",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--foreground)", marginBottom: "0.25rem" }}>
            {profile?.full_name ?? "Unknown Member"}
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{profile?.email}</p>
          {profile?.phone && (
            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{profile.phone}</p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "0.2rem 0.625rem", borderRadius: "100px",
              color: s.color, background: s.bg, border: `1px solid ${s.border}`,
            }}
          >
            {member.status}
          </span>
          {plan && <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{plan.name}</p>}
          {endDate && <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Expires {endDate}</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Check-in history */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden" }}>
          <div style={{ padding: "0.875rem 1.1rem", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.82rem", color: "var(--foreground)" }}>
              Check-in history
            </p>
          </div>
          {!checkIns || checkIns.length === 0 ? (
            <div style={{ padding: "2rem 1.1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>No check-ins yet.</p>
            </div>
          ) : (
            checkIns.map((c, i) => (
              <div
                key={c.id}
                style={{
                  padding: "0.7rem 1.1rem",
                  borderBottom: i < checkIns.length - 1 ? "1px solid var(--border)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                }}
              >
                <div
                  style={{
                    width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                    background: c.status === "success" ? "oklch(0.52 0.16 155)" : "oklch(0.55 0.18 25)",
                  }}
                />
                <p style={{ flex: 1, fontSize: "0.8rem", color: "var(--foreground)" }}>
                  {new Date(c.checked_in_at).toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", flexShrink: 0 }}>
                  {new Date(c.checked_in_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))
          )}
        </div>

        {/* BMI history */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden" }}>
          <div style={{ padding: "0.875rem 1.1rem", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.82rem", color: "var(--foreground)" }}>
              BMI history
            </p>
          </div>
          {!bmiRecords || bmiRecords.length === 0 ? (
            <div style={{ padding: "2rem 1.1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>No BMI records yet.</p>
            </div>
          ) : (
            bmiRecords.map((b, i) => (
              <div
                key={b.id}
                style={{
                  padding: "0.7rem 1.1rem",
                  borderBottom: i < bmiRecords.length - 1 ? "1px solid var(--border)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>
                    {b.weight_kg}kg · {b.height_cm}cm
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                    {new Date(b.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: BMI_COLORS[b.category] ?? "var(--foreground)" }}>
                    {b.bmi}
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", textTransform: "capitalize" }}>
                    {b.category}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Current workout plan */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden" }}>
        <div style={{ padding: "0.875rem 1.1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.82rem", color: "var(--foreground)" }}>
              Current workout plan
            </p>
            {workoutPlan?.ai_generated && (
              <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.15rem 0.45rem", borderRadius: "100px", color: "var(--primary)", background: "color-mix(in oklch, var(--primary) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)" }}>
                AI
              </span>
            )}
          </div>
          <Link
            href={`/trainer/members/${memberId}/assign-plan`}
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--primary)",
              textDecoration: "none",
              padding: "0.3rem 0.75rem",
              border: "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
              borderRadius: "100px",
              background: "color-mix(in oklch, var(--primary) 8%, transparent)",
              flexShrink: 0,
            }}
          >
            {workoutPlan ? "Replace plan" : "Assign plan"}
          </Link>
        </div>

        {!workoutPlan ? (
          <div style={{ padding: "2rem 1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
              No active workout plan. The member can generate one from their dashboard.
            </p>
          </div>
        ) : (
          <div style={{ padding: "1.25rem" }}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)", marginBottom: "0.75rem" }}>
              {workoutPlan.title}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "0.875rem" }}>
              Created {new Date(workoutPlan.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            {workoutPlan.plan_data && (
              <pre
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontSize: "0.8rem",
                  color: "var(--foreground)",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  padding: "0.875rem 1rem",
                  margin: 0,
                }}
              >
                {typeof workoutPlan.plan_data === "string"
                  ? workoutPlan.plan_data
                  : JSON.stringify(workoutPlan.plan_data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
