"use client";

import { useState, useMemo } from "react";
import { MemberDetailSheet } from "./member-detail-sheet";

export type Plan = { id: string; name: string; price: number; duration_days: number };

export type MemberRow = {
  id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  barcode_code: string | null;
  profiles: { id: string; full_name: string; email: string; phone: string | null; account_status: string } | null;
  membership_plans: { id: string; name: string; price: number; duration_days: number } | null;
};

const STATUS_TABS = ["All", "Active", "Pending", "Expired", "Suspended"];

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function ExpiryCell({ end_date }: { end_date: string | null }) {
  if (!end_date) {
    return <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>—</span>;
  }
  const days = daysUntil(end_date);
  const expired = days <= 0;
  const urgent = days > 0 && days <= 7;
  const warning = days > 7 && days <= 30;

  return (
    <span
      style={{
        fontSize: "0.78rem",
        fontWeight: expired || urgent ? 600 : 400,
        color: expired
          ? "var(--destructive)"
          : urgent
          ? "oklch(0.65 0.15 55)"
          : warning
          ? "oklch(0.62 0.12 80)"
          : "var(--foreground)",
      }}
    >
      {expired ? "Expired" : days === 1 ? "1 day" : `${days} days`}
    </span>
  );
}

function AccountBadge({ accountStatus }: { accountStatus: string }) {
  const activated = accountStatus === "active";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "0.15rem 0.5rem",
        borderRadius: "100px",
        background: activated
          ? "color-mix(in oklch, oklch(0.55 0.15 155) 12%, transparent)"
          : "var(--muted)",
        color: activated ? "oklch(0.4 0.13 155)" : "var(--muted-foreground)",
        border: `1px solid ${activated ? "color-mix(in oklch, oklch(0.55 0.15 155) 25%, transparent)" : "var(--border)"}`,
      }}
    >
      {activated ? "Activated" : "Invited"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  const pending = status === "pending";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "0.2rem 0.625rem",
        borderRadius: "100px",
        width: "fit-content",
        background: active
          ? "color-mix(in oklch, var(--primary) 12%, transparent)"
          : pending
          ? "color-mix(in oklch, oklch(0.72 0.13 80) 15%, transparent)"
          : "var(--muted)",
        color: active
          ? "var(--primary)"
          : pending
          ? "oklch(0.55 0.12 70)"
          : "var(--muted-foreground)",
        border: `1px solid ${
          active
            ? "color-mix(in oklch, var(--primary) 25%, transparent)"
            : pending
            ? "color-mix(in oklch, oklch(0.72 0.13 80) 30%, transparent)"
            : "var(--border)"
        }`,
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: active
            ? "var(--primary)"
            : pending
            ? "oklch(0.55 0.12 70)"
            : "var(--muted-foreground)",
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

export function MembersClient({
  members,
  gymId,
  plans,
}: {
  members: MemberRow[];
  gymId: string;
  plans: Plan[];
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selected, setSelected] = useState<MemberRow | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: members.length };
    for (const m of members) {
      c[m.status] = (c[m.status] ?? 0) + 1;
    }
    return c;
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter((m) => {
      const p = m.profiles;
      const matchSearch =
        !q ||
        p?.full_name?.toLowerCase().includes(q) ||
        p?.email?.toLowerCase().includes(q) ||
        (p?.phone ?? "").includes(q);
      const matchStatus =
        activeTab === "All" || m.status === activeTab.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [members, search, activeTab]);

  return (
    <>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="search"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            height: "2.25rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            background: "var(--background)",
            color: "var(--foreground)",
            padding: "0 0.875rem",
            fontSize: "0.85rem",
            fontFamily: "var(--font-jakarta)",
            outline: "none",
            width: "260px",
            maxWidth: "100%",
          }}
        />

        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All" ? counts.All : (counts[tab.toLowerCase()] ?? 0);
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  height: "2.25rem",
                  padding: "0 0.875rem",
                  borderRadius: "0.5rem",
                  border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                  background: active
                    ? "color-mix(in oklch, var(--primary) 10%, var(--background))"
                    : "var(--background)",
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                  fontSize: "0.78rem",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "var(--font-jakarta)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                {tab}
                {count > 0 && (
                  <span
                    style={{
                      background: active
                        ? "color-mix(in oklch, var(--primary) 18%, transparent)"
                        : "var(--muted)",
                      color: active ? "var(--primary)" : "var(--muted-foreground)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.05rem 0.35rem",
                      borderRadius: "100px",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 150px 130px 100px 110px 48px",
            padding: "0.7rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--muted)",
          }}
        >
          {["Name", "Plan", "Status", "Expires", "Joined", ""].map((h, i) => (
            <span
              key={h}
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>
              ◉
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
              {search || activeTab !== "All" ? "No members match" : "No members yet"}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              {search || activeTab !== "All"
                ? "Try adjusting your search or filter."
                : "Click + Add member to register your first member."}
            </p>
          </div>
        ) : (
          filtered.map((m, i) => {
            const p = m.profiles;
            return (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 150px 130px 100px 110px 48px",
                  padding: "0.875rem 1.25rem",
                  borderBottom:
                    i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}
              >
                {/* Name + email */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: "color-mix(in oklch, var(--primary) 12%, var(--muted))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      flexShrink: 0,
                    }}
                  >
                    {p?.full_name
                      ?.split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "?"}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--foreground)",
                      }}
                    >
                      {p?.full_name ?? "—"}
                    </div>
                    <div
                      style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}
                    >
                      {p?.email ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Plan */}
                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                  {m.membership_plans?.name ?? (
                    <span style={{ color: "var(--border)", fontStyle: "italic" }}>
                      No plan
                    </span>
                  )}
                </span>

                {/* Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <AccountBadge accountStatus={m.profiles?.account_status ?? "invited"} />
                  <StatusBadge status={m.status} />
                </div>

                {/* Expires */}
                <ExpiryCell end_date={m.end_date} />

                {/* Joined */}
                <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                  {m.created_at
                    ? new Date(m.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>

                {/* View button */}
                <button
                  onClick={() => setSelected(m)}
                  style={{
                    height: "2rem",
                    padding: "0 0.625rem",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--muted-foreground)",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "var(--font-jakarta)",
                    whiteSpace: "nowrap",
                  }}
                >
                  View
                </button>
              </div>
            );
          })
        )}
      </div>

      {members.length > 100 && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
          Showing 100 of {members.length} members
        </p>
      )}

      {selected && (
        <MemberDetailSheet
          member={selected}
          plans={plans}
          gymId={gymId}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
