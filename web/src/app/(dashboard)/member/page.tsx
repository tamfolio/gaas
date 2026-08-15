import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus } from "@/types";
import { FeatureCards } from "./feature-cards";
import { initiateRenewalPayment } from "./billing/actions";

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
      .select("id, status, start_date, end_date, membership_plan:membership_plans(name, price, guest_passes_per_month)")
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

  const plan = memberRecord?.membership_plan as { name?: string; price?: number; guest_passes_per_month?: number } | null;
  const guestPassesPerMonth = plan?.guest_passes_per_month ?? 0;

  // Count guest visits used this month (only if plan allows guests)
  let guestPassesUsed = 0;
  if (memberRecord && guestPassesPerMonth > 0) {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const { count } = await supabase
      .from("guest_visits")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberRecord.id)
      .gte("visited_at", monthStart);
    guestPassesUsed = count ?? 0;
  }

  // Referral stats
  let referralCode: string | null = null;
  let convertedReferrals = 0;
  if (memberRecord) {
    const [{ data: codeRecord }, { data: referrals }] = await Promise.all([
      supabase.from("referral_codes").select("code").eq("member_id", memberRecord.id).maybeSingle(),
      supabase.from("referrals").select("status").eq("referrer_member_id", memberRecord.id),
    ]);
    referralCode = codeRecord?.code ?? null;
    convertedReferrals = referrals?.filter((r) => r.status === "converted").length ?? 0;
  }

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
                {plan?.name ?? "Standard"}
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

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
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

            {/* Show pay button for all statuses except suspended */}
            {memberRecord && status !== "suspended" && (
              <form action={initiateRenewalPayment}>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontFamily: "var(--font-jakarta)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {status === "active" ? "Renew online" : "Pay to activate"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Referral + Guest pass cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1.5rem" }}>
        {/* Referral card */}
        <a
          href="/member/referral"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.125rem",
              cursor: "pointer",
            }}
          >
            <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
              Referrals
            </p>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: referralCode ? "0.1em" : "-0.03em", lineHeight: 1, marginBottom: "0.3rem" }}>
              {referralCode ?? "Get code"}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
              {convertedReferrals > 0
                ? `${convertedReferrals} successful referral${convertedReferrals !== 1 ? "s" : ""}`
                : "Share to earn free days"}
            </p>
          </div>
        </a>

        {/* Guest passes card — only shown if plan includes guests */}
        {guestPassesPerMonth > 0 ? (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.125rem",
            }}
          >
            <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
              Guest passes
            </p>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.3rem" }}>
              {guestPassesPerMonth - guestPassesUsed}
              <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--muted-foreground)", marginLeft: "0.25rem" }}>
                / {guestPassesPerMonth}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
              Remaining this month
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.125rem",
              opacity: 0.5,
            }}
          >
            <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
              Guest passes
            </p>
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 700, color: "var(--muted-foreground)", lineHeight: 1, marginBottom: "0.3rem" }}>
              Not included
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
              Upgrade your plan to bring guests
            </p>
          </div>
        )}
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
