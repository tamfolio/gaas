import { createAdminClient } from "@/lib/supabase/server";
import { GymSignupsChart, MemberGrowthChart, GymStatusChart } from "./charts";

function buildDailyBuckets(rows: { created_at: string }[], days = 30) {
  const counts: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
    counts[key] = 0;
  }
  for (const row of rows) {
    const d = new Date(row.created_at);
    const key = d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
    if (key in counts) counts[key]++;
  }
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export default async function SuperAdminDashboard() {
  const adminClient = createAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalGyms },
    { count: pendingGyms },
    { count: activeGyms },
    { count: suspendedGyms },
    { count: totalMembers },
    { data: recentGyms },
    { data: recentMembers },
    { data: gymStatuses },
  ] = await Promise.all([
    adminClient.from("gyms").select("*", { count: "exact", head: true }),
    adminClient.from("gyms").select("*", { count: "exact", head: true }).eq("subscription_status", "pending"),
    adminClient.from("gyms").select("*", { count: "exact", head: true }).in("subscription_status", ["active", "trial"]),
    adminClient.from("gyms").select("*", { count: "exact", head: true }).eq("subscription_status", "suspended"),
    adminClient.from("gym_members").select("*", { count: "exact", head: true }),
    adminClient.from("gyms").select("created_at").gte("created_at", thirtyDaysAgo),
    adminClient.from("gym_members").select("created_at").gte("created_at", thirtyDaysAgo),
    adminClient.from("gyms").select("subscription_status"),
  ]);

  const stats = [
    { label: "Total Gyms",     value: totalGyms ?? 0,     accent: false },
    { label: "Pending Review", value: pendingGyms ?? 0,   accent: (pendingGyms ?? 0) > 0, accentColor: "oklch(0.55 0.14 55)" },
    { label: "Active Gyms",    value: activeGyms ?? 0,    accent: false },
    { label: "Suspended",      value: suspendedGyms ?? 0, accent: false },
    { label: "Total Members",  value: totalMembers ?? 0,  accent: false },
  ];

  const gymSignupData   = buildDailyBuckets(recentGyms ?? []);
  const memberGrowthData = buildDailyBuckets(recentMembers ?? []);

  const statusCounts = (gymStatuses ?? []).reduce<Record<string, number>>((acc, g) => {
    acc[g.subscription_status] = (acc[g.subscription_status] ?? 0) + 1;
    return acc;
  }, {});
  const statusChartData = [
    { label: "Active",    count: statusCounts["active"]    ?? 0, color: "oklch(0.52 0.16 155)" },
    { label: "Trial",     count: statusCounts["trial"]     ?? 0, color: "oklch(0.50 0.16 260)" },
    { label: "Pending",   count: statusCounts["pending"]   ?? 0, color: "oklch(0.55 0.14 55)"  },
    { label: "Suspended", count: statusCounts["suspended"] ?? 0, color: "oklch(0.55 0.18 25)"  },
    { label: "Cancelled", count: statusCounts["cancelled"] ?? 0, color: "var(--muted-foreground)" },
  ].filter((s) => s.count > 0);

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "960px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
          Platform
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
          Overview
        </h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--card)",
              border: `1px solid ${stat.accent ? `color-mix(in oklch, ${stat.accentColor} 35%, var(--border))` : "var(--border)"}`,
              borderRadius: "0.75rem",
              padding: "1.25rem 1.25rem 1.1rem",
            }}
          >
            <p style={{ fontSize: "0.72rem", fontWeight: 500, color: stat.accent ? stat.accentColor : "var(--muted-foreground)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", color: stat.accent ? stat.accentColor : "var(--foreground)", lineHeight: 1 }}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pending banner */}
      {(pendingGyms ?? 0) > 0 && (
        <div style={{ background: "oklch(0.97 0.06 90)", border: "1px solid oklch(0.88 0.10 90)", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "oklch(0.45 0.14 55)", marginBottom: "0.2rem" }}>
              {pendingGyms} gym{(pendingGyms ?? 0) > 1 ? "s" : ""} awaiting approval
            </p>
            <p style={{ fontSize: "0.8rem", color: "oklch(0.55 0.12 55)" }}>
              Review and approve or reject pending registrations.
            </p>
          </div>
          <a
            href="/super-admin/gyms?status=pending"
            style={{ flexShrink: 0, padding: "0.45rem 1rem", background: "oklch(0.55 0.14 55)", color: "#fff", borderRadius: "0.5rem", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none", fontFamily: "var(--font-jakarta)" }}
          >
            Review →
          </a>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <GymSignupsChart data={gymSignupData} />
        <MemberGrowthChart data={memberGrowthData} />
      </div>
      {statusChartData.length > 0 && (
        <GymStatusChart data={statusChartData} />
      )}
    </div>
  );
}
