import { createClient } from "@/lib/supabase/server";
import { AddMemberSheet } from "@/components/add-member-sheet";

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const gymId = profile!.gym_id!;

  const [{ data: members, count }, { data: plans }] = await Promise.all([
    supabase
      .from("gym_members")
      .select("id, status, start_date, end_date, created_at, barcode_code, profiles:profile_id(full_name, email, phone)", { count: "exact" })
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("membership_plans")
      .select("id, name, price, duration_days")
      .eq("gym_id", gymId)
      .eq("is_active", true),
  ]);

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "1024px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
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
            Gym Members
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
            Members
            {count !== null && count > 0 && (
              <span
                style={{
                  marginLeft: "0.625rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0",
                }}
              >
                {count}
              </span>
            )}
          </h1>
        </div>
        <AddMemberSheet gymId={gymId} plans={plans ?? []} />
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
        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 120px 110px",
            padding: "0.7rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--muted)",
          }}
        >
          {["Name", "Email", "Status", "Joined"].map((h) => (
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

        {!members || members.length === 0 ? (
          <div style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>◉</div>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--foreground)",
                marginBottom: "0.375rem",
              }}
            >
              No members yet
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              Click <strong>+ Add member</strong> to register your first member.
            </p>
          </div>
        ) : (
          members.map((m, i) => {
            const p = m.profiles as unknown as { full_name: string; email: string; phone: string | null } | null;
            return (
              <div
                key={m.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 120px 110px",
                  padding: "0.875rem 1.25rem",
                  borderBottom: i < members.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
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
                    {p?.full_name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
                  </div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}>
                    {p?.full_name ?? "—"}
                  </span>
                </div>

                <span style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                  {p?.email ?? "—"}
                </span>

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
                    background:
                      m.status === "active"
                        ? "color-mix(in oklch, var(--primary) 12%, transparent)"
                        : "var(--muted)",
                    color:
                      m.status === "active" ? "var(--primary)" : "var(--muted-foreground)",
                    border: `1px solid ${
                      m.status === "active"
                        ? "color-mix(in oklch, var(--primary) 25%, transparent)"
                        : "var(--border)"
                    }`,
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: m.status === "active" ? "var(--primary)" : "var(--muted-foreground)",
                      display: "inline-block",
                    }}
                  />
                  {m.status}
                </span>

                <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                  {m.created_at
                    ? new Date(m.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            );
          })
        )}
      </div>

      {count !== null && count > 50 && (
        <p style={{ marginTop: "0.875rem", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
          Showing 50 of {count} members
        </p>
      )}
    </div>
  );
}
