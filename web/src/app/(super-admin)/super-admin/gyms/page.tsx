import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "oklch(0.52 0.14 55)",  bg: "oklch(0.97 0.06 90)"  },
  trial:     { label: "Trial",     color: "oklch(0.50 0.16 260)", bg: "oklch(0.96 0.04 260)" },
  active:    { label: "Active",    color: "oklch(0.52 0.16 155)", bg: "oklch(0.96 0.04 155)" },
  suspended: { label: "Suspended", color: "oklch(0.55 0.18 25)",  bg: "oklch(0.97 0.04 25)"  },
  cancelled: { label: "Cancelled", color: "var(--muted-foreground)", bg: "var(--muted)"       },
};

const FILTERS = ["all", "pending", "active", "trial", "suspended", "cancelled"] as const;

export default async function GymsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = FILTERS.includes(status as (typeof FILTERS)[number]) ? status : "all";

  const adminClient = createAdminClient();

  let query = adminClient
    .from("gyms")
    .select("id, name, email, phone, subscription_status, subscription_plan, created_at")
    .order("created_at", { ascending: false });

  if (activeFilter && activeFilter !== "all") {
    query = query.eq("subscription_status", activeFilter);
  }

  const { data: gyms } = await query;

  // Member count per gym
  const gymIds = (gyms ?? []).map((g) => g.id);
  const memberCounts: Record<string, number> = {};
  if (gymIds.length > 0) {
    const { data: members } = await adminClient
      .from("gym_members")
      .select("gym_id")
      .in("gym_id", gymIds);
    for (const m of members ?? []) {
      memberCounts[m.gym_id] = (memberCounts[m.gym_id] ?? 0) + 1;
    }
  }

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "1024px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
          Platform
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
          Gyms
          {gyms && gyms.length > 0 && (
            <span style={{ marginLeft: "0.625rem", fontSize: "0.875rem", fontFamily: "var(--font-jakarta)", fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0" }}>
              {gyms.length}
            </span>
          )}
        </h1>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/super-admin/gyms" : `/super-admin/gyms?status=${f}`}
            style={{
              padding: "0.35rem 0.875rem",
              borderRadius: "100px",
              border: `1px solid ${activeFilter === f ? "var(--foreground)" : "var(--border)"}`,
              background: activeFilter === f ? "var(--foreground)" : "var(--card)",
              color: activeFilter === f ? "var(--background)" : "var(--muted-foreground)",
              fontSize: "0.75rem",
              fontWeight: 600,
              textDecoration: "none",
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? "All" : (STATUS_LABELS[f]?.label ?? f)}
          </Link>
        ))}
      </div>

      {/* Gyms list */}
      {!gyms || gyms.length === 0 ? (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "4rem 1.25rem",
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "var(--foreground)", marginBottom: "0.375rem" }}>
            No gyms {activeFilter !== "all" ? `with status "${activeFilter}"` : "yet"}
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
            Gyms that register will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            overflow: "hidden",
          }}
        >
          {(gyms ?? []).map((gym, i) => {
            const s = STATUS_LABELS[gym.subscription_status] ?? STATUS_LABELS.cancelled;
            const members = memberCounts[gym.id] ?? 0;
            const joined = new Date(gym.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

            return (
              <Link
                key={gym.id}
                href={`/super-admin/gyms/${gym.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: i < (gyms?.length ?? 0) - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none",
                  transition: "background 0.1s",
                }}
                className="gym-row"
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)", marginBottom: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {gym.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {gym.email}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", minWidth: "60px", textAlign: "right" }}>
                    {members} {members === 1 ? "member" : "members"}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", minWidth: "100px", textAlign: "right", display: "none" }} className="hide-mobile">
                    {joined}
                  </p>
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "100px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: s.color,
                      background: s.bg,
                      border: `1px solid color-mix(in oklch, ${s.color} 25%, transparent)`,
                    }}
                  >
                    {s.label}
                  </span>
                  <span style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .gym-row:hover { background: var(--muted) !important; }
        @media (max-width: 640px) { .hide-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}
