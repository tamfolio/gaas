import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus } from "@/types";
import { FeatureCards } from "./feature-cards";

const STATUS_STYLES: Record<MembershipStatus, { color: string; bg: string; border: string }> = {
  active: {
    color: "oklch(0.35 0.12 155)",
    bg: "oklch(0.96 0.04 155)",
    border: "oklch(0.85 0.07 155)",
  },
  expired: {
    color: "var(--destructive)",
    bg: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
    border: "color-mix(in oklch, var(--destructive) 25%, transparent)",
  },
  suspended: {
    color: "oklch(0.50 0.12 70)",
    bg: "oklch(0.97 0.04 70)",
    border: "oklch(0.87 0.07 70)",
  },
  pending: {
    color: "var(--muted-foreground)",
    bg: "var(--muted)",
    border: "var(--border)",
  },
};

const FEATURE_CARDS = [
  {
    icon: "◆",
    title: "Workout Plan",
    description: "View your current AI-generated workout schedule.",
    href: "/member/workout",
  },
  {
    icon: "◐",
    title: "Check-in History",
    description: "See all your gym visits and attendance.",
    href: "/member/checkins",
  },
  {
    icon: "◉",
    title: "BMI Tracker",
    description: "Track your weight, height, and body metrics over time.",
    href: "/member/bmi",
  },
  {
    icon: "◑",
    title: "Notifications",
    description: "Payment reminders, announcements, and updates.",
    href: "/member/notifications",
  },
];

export default async function MemberPage() {
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

  const [{ data: memberRecord }, { data: gym }] = await Promise.all([
    supabase
      .from("gym_members")
      .select("id, status, start_date, end_date, membership_plan:membership_plans(name, price)")
      .eq("gym_id", profile.gym_id)
      .eq("profile_id", user.id)
      .single(),
    supabase.from("gyms").select("name").eq("id", profile.gym_id).single(),
  ]);

  // Count only this member's own check-ins
  const { count: checkInCount } = memberRecord
    ? await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("gym_member_id", memberRecord.id)
        .eq("status", "success")
    : { count: 0 };

  const status = (memberRecord?.status ?? "pending") as MembershipStatus;
  const statusStyle = STATUS_STYLES[status];

  const endDate = memberRecord?.end_date
    ? new Date(memberRecord.end_date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div style={{ maxWidth: "780px", padding: "2rem 1.75rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{
          fontSize: "0.8rem",
          color: "var(--muted-foreground)",
          marginBottom: "0.25rem",
          fontWeight: 500,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}>
          Member Dashboard
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
          {profile.full_name ?? user.email}
        </h1>
        {gym?.name && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
            {gym.name}
          </p>
        )}
      </div>

      {/* Membership card */}
      <div
        style={{
          background: "var(--brand-dark)",
          borderRadius: "0.875rem",
          padding: "1.75rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, right: 0,
            width: "200px", height: "200px",
            background: "radial-gradient(circle, rgba(232,70,10,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--brand-dark-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                Membership
              </p>
              <p style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-dark-fg)", letterSpacing: "-0.02em" }}>
                {(memberRecord?.membership_plan as { name?: string } | null)?.name ?? "Standard"}
              </p>
            </div>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: statusStyle.color,
                background: statusStyle.bg,
                border: `1px solid ${statusStyle.border}`,
                padding: "0.2rem 0.625rem",
                borderRadius: "100px",
              }}
            >
              {status}
            </span>
          </div>

          <div style={{ display: "flex", gap: "2.5rem" }}>
            <div>
              <p style={{ fontSize: "0.68rem", color: "var(--brand-dark-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                Check-ins
              </p>
              <p style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "var(--brand-dark-fg)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {checkInCount ?? 0}
              </p>
            </div>
            {endDate && (
              <div>
                <p style={{ fontSize: "0.68rem", color: "var(--brand-dark-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                  Expires
                </p>
                <p style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 700, color: "var(--brand-dark-fg)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {endDate}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          My fitness
        </h2>
      </div>

      <FeatureCards cards={FEATURE_CARDS} />
    </div>
  );
}
