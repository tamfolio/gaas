import { createClient } from "@/lib/supabase/server";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, profiles(full_name)")
    .eq("gym_id", profile!.gym_id!)
    .order("payment_date", { ascending: false })
    .limit(20);

  const totalRevenue =
    payments
      ?.filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

  const pendingCount = payments?.filter((p) => p.status === "pending").length ?? 0;

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "960px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p
          style={{
            fontSize: "0.72rem",
            color: "var(--muted-foreground)",
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "0.25rem",
          }}
        >
          Revenue
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
          Payments
        </h1>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          {
            label: "Total collected",
            value: `₦${totalRevenue.toLocaleString("en-NG")}`,
            accent: true,
          },
          {
            label: "Transactions",
            value: payments?.length ?? 0,
            accent: false,
          },
          {
            label: "Pending",
            value: pendingCount,
            accent: false,
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: card.accent ? "var(--primary)" : "var(--card)",
              border: card.accent ? "none" : "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1.75rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: card.accent ? "white" : "var(--foreground)",
                lineHeight: 1,
                marginBottom: "0.375rem",
              }}
            >
              {card.value}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                color: card.accent ? "rgba(255,255,255,0.65)" : "var(--muted-foreground)",
              }}
            >
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction list */}
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
            gridTemplateColumns: "1fr auto auto auto",
            padding: "0.75rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--muted)",
          }}
        >
          {["Member", "Amount", "Status", "Date"].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {!payments || payments.length === 0 ? (
          <div
            style={{
              padding: "4rem 1.25rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.4 }}>◆</div>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--foreground)",
                marginBottom: "0.375rem",
              }}
            >
              No payments yet
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              Payments collected via Paystack will appear here.
            </p>
          </div>
        ) : (
          payments.map((p) => {
            const member = p.profiles as { full_name: string } | null;
            const statusColor =
              p.status === "completed"
                ? "var(--primary)"
                : p.status === "pending"
                ? "oklch(0.75 0.15 85)"
                : "var(--destructive)";
            return (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--foreground)",
                  }}
                >
                  {member?.full_name ?? "—"}
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    fontFamily: "var(--font-syne)",
                  }}
                >
                  ₦{(p.amount ?? 0).toLocaleString("en-NG")}
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    padding: "0.2rem 0.625rem",
                    borderRadius: "100px",
                    background: `color-mix(in oklch, ${statusColor} 12%, transparent)`,
                    color: statusColor,
                    border: `1px solid color-mix(in oklch, ${statusColor} 25%, transparent)`,
                  }}
                >
                  {p.status}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                  {(p.paid_at ?? p.created_at)
                    ? new Date(p.paid_at ?? p.created_at).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
