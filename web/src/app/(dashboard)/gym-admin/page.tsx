import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(amount: number): string {
  if (amount === 0) return "₦0";
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount.toLocaleString("en-NG")}`;
}

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function KpiCard({
  value,
  label,
  accent = false,
  sub,
  subUp = false,
  subDown = false,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
  sub?: string;
  subUp?: boolean;
  subDown?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? "var(--primary)" : "var(--card)",
        border: accent ? "none" : "1px solid var(--border)",
        borderRadius: "0.75rem",
        padding: "1.375rem 1.25rem",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "2.125rem",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: accent ? "white" : "var(--foreground)",
          lineHeight: 1,
          marginBottom: "0.3rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: accent ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)",
          fontWeight: 500,
          marginBottom: sub ? "0.5rem" : 0,
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: subUp
              ? accent
                ? "rgba(180,255,200,0.9)"
                : "oklch(0.6 0.15 145)"
              : subDown
              ? accent
                ? "rgba(255,200,180,0.9)"
                : "var(--destructive)"
              : accent
              ? "rgba(255,255,255,0.5)"
              : "var(--muted-foreground)",
          }}
        >
          {subUp ? "↑ " : subDown ? "↓ " : ""}
          {sub}
        </div>
      )}
    </div>
  );
}

export default async function GymAdminPage() {
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

  if (!profile?.gym_id)
    throw new Error("Your account isn't linked to a gym. Please contact support.");

  const gymId = profile.gym_id;

  // Date boundaries
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const startOfThisMonth = new Date(y, mo, 1).toISOString();
  const startOfLastMonth = new Date(y, mo - 1, 1).toISOString();
  const startOfToday = new Date(y, mo, now.getDate()).toISOString();
  const todayDate = now.toISOString().split("T")[0];
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 86_400_000)
    .toISOString()
    .split("T")[0];

  const [
    { count: trainerCount },
    { count: expiringCount },
    { data: gym },
    { data: allMembers },
    { data: recentMembers },
    { data: revenueThisData },
    { data: revenueLastData },
    { count: checkInsToday },
  ] = await Promise.all([
    supabase
      .from("gym_trainers")
      .select("*", { count: "exact", head: true })
      .eq("gym_id", gymId),

    supabase
      .from("gym_members")
      .select("*", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .eq("status", "active")
      .gte("end_date", todayDate)
      .lte("end_date", thirtyDaysAhead),

    supabase
      .from("gyms")
      .select("name, subscription_plan")
      .eq("id", gymId)
      .single(),

    supabase
      .from("gym_members")
      .select("status, created_at")
      .eq("gym_id", gymId),

    supabase
      .from("gym_members")
      .select(
        "id, created_at, status, profiles:profile_id(full_name, email), membership_plans:membership_plan_id(name)"
      )
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .eq("status", "paid")
      .gte("paid_at", startOfThisMonth),

    supabase
      .from("payments")
      .select("amount")
      .eq("gym_id", gymId)
      .eq("status", "paid")
      .gte("paid_at", startOfLastMonth)
      .lt("paid_at", startOfThisMonth),

    supabase
      .from("check_ins")
      .select("*", { count: "exact", head: true })
      .eq("gym_id", gymId)
      .gte("checked_in_at", startOfToday),
  ]);

  // Computed stats
  const activeCount = allMembers?.filter((m) => m.status === "active").length ?? 0;
  const totalCount = allMembers?.length ?? 0;

  const statusBreakdown: Record<string, number> = {};
  allMembers?.forEach((m) => {
    statusBreakdown[m.status] = (statusBreakdown[m.status] ?? 0) + 1;
  });

  const newThisMonth =
    allMembers?.filter((m) => m.created_at >= startOfThisMonth).length ?? 0;
  const newLastMonth =
    allMembers?.filter(
      (m) => m.created_at >= startOfLastMonth && m.created_at < startOfThisMonth
    ).length ?? 0;
  const memberDelta = newThisMonth - newLastMonth;

  const revenueThis =
    revenueThisData?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const revenueLast =
    revenueLastData?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  const revenueDelta = revenueThis - revenueLast;

  // 8-week growth buckets
  const weeklyBuckets = Array.from({ length: 8 }, (_, i) => {
    const bucketEnd = new Date(now.getTime() - (7 - i) * 7 * 86_400_000);
    const bucketStart = new Date(bucketEnd.getTime() - 7 * 86_400_000);
    const count =
      allMembers?.filter((m) => {
        return (
          m.created_at > bucketStart.toISOString() &&
          m.created_at <= bucketEnd.toISOString()
        );
      }).length ?? 0;
    const label = bucketEnd.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    });
    return { label, count };
  });
  const maxWeekly = Math.max(...weeklyBuckets.map((b) => b.count), 1);

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "1024px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
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
          Overview
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
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
            {gym?.name ?? "Your Gym"}
          </h1>
          {gym?.subscription_plan && (
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--primary)",
                background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                border:
                  "1px solid color-mix(in oklch, var(--primary) 22%, transparent)",
                padding: "0.2rem 0.6rem",
                borderRadius: "100px",
              }}
            >
              {gym.subscription_plan}
            </span>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <KpiCard
          value={activeCount}
          label="Active members"
          accent
          sub={
            newThisMonth > 0
              ? `+${newThisMonth} joined this month`
              : "None added this month"
          }
          subUp={newThisMonth > 0}
        />
        <KpiCard
          value={newThisMonth}
          label="New this month"
          sub={
            memberDelta !== 0
              ? `${memberDelta > 0 ? "+" : ""}${memberDelta} vs last month`
              : newLastMonth > 0
              ? "Same as last month"
              : undefined
          }
          subUp={memberDelta > 0}
          subDown={memberDelta < 0}
        />
        <KpiCard
          value={formatCurrency(revenueThis)}
          label="Revenue this month"
          sub={
            revenueDelta !== 0
              ? `${revenueDelta > 0 ? "+" : ""}${formatCurrency(Math.abs(revenueDelta))} vs last`
              : revenueLast > 0
              ? "Same as last month"
              : undefined
          }
          subUp={revenueDelta > 0}
          subDown={revenueDelta < 0}
        />
        <KpiCard
          value={expiringCount ?? 0}
          label="Expiring in 30 days"
          sub={
            (expiringCount ?? 0) > 0
              ? "Review memberships"
              : "No renewals due soon"
          }
          subDown={(expiringCount ?? 0) > 0}
        />
      </div>

      {/* Member growth chart */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}
          >
            New members
          </p>
          <span
            style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}
          >
            Last 8 weeks
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.625rem" }}>
          {/* Y-axis */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingBottom: "1.375rem",
              flexShrink: 0,
              textAlign: "right",
            }}
          >
            {[maxWeekly, Math.ceil(maxWeekly / 2), 0].map((v, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.58rem",
                  color: "var(--muted-foreground)",
                  lineHeight: 1,
                }}
              >
                {v}
              </span>
            ))}
          </div>

          {/* Bars + labels */}
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "0.25rem",
              height: "90px",
            }}
          >
            {weeklyBuckets.map((bucket, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    title={`${bucket.count} member${bucket.count !== 1 ? "s" : ""}`}
                    style={{
                      width: "100%",
                      height:
                        bucket.count > 0
                          ? `${Math.max(
                              (bucket.count / maxWeekly) * 100,
                              6
                            )}%`
                          : "2px",
                      background:
                        bucket.count > 0 ? "var(--primary)" : "var(--border)",
                      opacity:
                        bucket.count > 0
                          ? 0.45 + (i / 7) * 0.55
                          : 0.4,
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.52rem",
                    color: "var(--muted-foreground)",
                    marginTop: "0.375rem",
                    textAlign: "center",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {bucket.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {totalCount === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              marginTop: "0.75rem",
              textAlign: "center",
            }}
          >
            Add your first member to start seeing growth here.
          </p>
        )}
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Status breakdown */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
              marginBottom: "1.25rem",
            }}
          >
            Membership status
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {[
              { key: "active", label: "Active", color: "var(--primary)" },
              {
                key: "pending",
                label: "Pending",
                color: "oklch(0.65 0.1 220)",
              },
              {
                key: "expired",
                label: "Expired",
                color: "var(--destructive)",
              },
              {
                key: "suspended",
                label: "Suspended",
                color: "var(--muted-foreground)",
              },
            ].map(({ key, label, color }) => {
              const count = statusBreakdown[key] ?? 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--foreground)",
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--muted-foreground)",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "4px",
                      background: "var(--border)",
                      borderRadius: "100px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: color,
                        borderRadius: "100px",
                        minWidth: count > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p
            style={{
              fontSize: "0.7rem",
              color: "var(--muted-foreground)",
              marginTop: "1.25rem",
              borderTop: "1px solid var(--border)",
              paddingTop: "0.875rem",
            }}
          >
            {totalCount} member{totalCount !== 1 ? "s" : ""} total ·{" "}
            {trainerCount ?? 0} trainer{(trainerCount ?? 0) !== 1 ? "s" : ""} ·{" "}
            {checkInsToday ?? 0} check-in{(checkInsToday ?? 0) !== 1 ? "s" : ""}{" "}
            today
          </p>
        </div>

        {/* Recently joined */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
              marginBottom: "1.25rem",
            }}
          >
            Recently joined
          </p>

          {!recentMembers || recentMembers.length === 0 ? (
            <p
              style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}
            >
              No members yet. Add your first member to get started.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              {recentMembers.map((m) => {
                const p = m.profiles as unknown as {
                  full_name: string;
                  email: string;
                } | null;
                const plan = m.membership_plans as unknown as {
                  name: string;
                } | null;
                const initials =
                  (p?.full_name ?? "")
                    .split(" ")
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "?";
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background:
                          "color-mix(in oklch, var(--primary) 12%, var(--muted))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        flexShrink: 0,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          color: "var(--foreground)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {p?.full_name ?? "—"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: plan
                            ? "var(--primary)"
                            : "var(--muted-foreground)",
                          fontWeight: plan ? 500 : 400,
                        }}
                      >
                        {plan?.name ?? "No plan"}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--muted-foreground)",
                        flexShrink: 0,
                      }}
                    >
                      {relativeDate(m.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
