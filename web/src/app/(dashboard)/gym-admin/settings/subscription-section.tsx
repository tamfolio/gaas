"use client";

import { useState } from "react";
import { initiateGymSubscription } from "./billing-actions";

type Plan = {
  name: string;
  display_name: string;
  price_halfyear: number;
  price_annual: number;
  features: string[];
};

type Payment = {
  id: string;
  plan: string;
  period: string;
  amount: number;
  status: string;
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
};

function formatDate(str: string | null) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  const trial = status === "trial";
  return (
    <span
      style={{
        fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: active ? "oklch(0.35 0.12 155)" : trial ? "var(--primary)" : "var(--muted-foreground)",
        background: active ? "oklch(0.96 0.04 155)" : trial ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "var(--muted)",
        border: `1px solid ${active ? "oklch(0.85 0.07 155)" : trial ? "color-mix(in oklch, var(--primary) 25%, transparent)" : "var(--border)"}`,
        padding: "0.2rem 0.625rem", borderRadius: "100px",
      }}
    >
      {status}
    </span>
  );
}

export function SubscriptionSection({
  currentPlan,
  subscriptionStatus,
  expiresAt,
  subscriptionPeriod,
  plans,
  recentPayments,
}: {
  currentPlan: string | null;
  subscriptionStatus: string;
  expiresAt: string | null;
  subscriptionPeriod: string | null;
  plans: Plan[];
  recentPayments: Payment[];
}) {
  const [period, setPeriod] = useState<"halfyear" | "annual">("annual");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(planName: string) {
    setLoading(planName);
    setError(null);
    const fd = new FormData();
    fd.set("plan", planName);
    fd.set("period", period);
    const result = await initiateGymSubscription(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(null);
    }
  }

  const isActive = subscriptionStatus === "active";
  const isTrial = subscriptionStatus === "trial";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Current status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
            <span style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 700, color: "var(--foreground)", textTransform: "capitalize" }}>
              {currentPlan ?? "No plan"} plan
            </span>
            <StatusBadge status={subscriptionStatus} />
          </div>
          {isActive && expiresAt && (
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
              Renews {formatDate(expiresAt)} · {subscriptionPeriod === "annual" ? "Annual" : "6-month"} billing
            </p>
          )}
          {isTrial && (
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
              Subscribe to a plan to keep your dashboard active after the trial ends.
            </p>
          )}
        </div>
      </div>

      {/* Plans */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
            {isActive ? "Change plan" : "Choose a plan"}
          </h3>
          {/* Period toggle */}
          <div style={{ display: "inline-flex", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.2rem", gap: "0.2rem" }}>
            {([["halfyear", "6 months"], ["annual", "Annual"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setPeriod(val)}
                style={{
                  padding: "0.3rem 0.75rem", borderRadius: "0.25rem", border: "none",
                  background: period === val ? "var(--background)" : "transparent",
                  boxShadow: period === val ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  color: period === val ? "var(--foreground)" : "var(--muted-foreground)",
                  fontSize: "0.75rem", fontWeight: period === val ? 600 : 400, cursor: "pointer",
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                {label}
                {val === "annual" && <span style={{ marginLeft: "0.3rem", fontSize: "0.65rem", color: "var(--primary)", fontWeight: 700 }}>~15% off</span>}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "0.8rem", color: "var(--destructive)", marginBottom: "0.75rem" }}>{error}</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem" }}>
          {plans.map((plan) => {
            const price = period === "annual" ? plan.price_annual : plan.price_halfyear;
            const isCurrent = currentPlan === plan.name && isActive;
            const isLoading = loading === plan.name;

            return (
              <div
                key={plan.name}
                style={{
                  background: isCurrent ? "color-mix(in oklch, var(--primary) 5%, var(--card))" : "var(--card)",
                  border: `1px solid ${plan.name === "pro" || isCurrent ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "0.75rem", overflow: "hidden",
                }}
              >
                {plan.name === "pro" && !isCurrent && (
                  <div style={{ background: "var(--primary)", padding: "0.25rem", textAlign: "center", fontSize: "0.6rem", fontWeight: 700, color: "#fff", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Popular
                  </div>
                )}
                {isCurrent && (
                  <div style={{ background: "color-mix(in oklch, var(--primary) 15%, transparent)", padding: "0.25rem", textAlign: "center", fontSize: "0.6rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                    Current plan
                  </div>
                )}
                <div style={{ padding: "1.25rem" }}>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: "0.95rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "0.375rem" }}>
                    {plan.display_name}
                  </div>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "0.15rem" }}>
                    ₦{price.toLocaleString("en-NG")}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                    / {period === "annual" ? "year" : "6 months"}
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.125rem" }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                        <span style={{ color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={!!loading || isCurrent}
                    style={{
                      width: "100%", padding: "0.5rem",
                      background: isCurrent ? "var(--muted)" : plan.name === "pro" ? "var(--primary)" : "transparent",
                      color: isCurrent ? "var(--muted-foreground)" : plan.name === "pro" ? "#fff" : "var(--foreground)",
                      border: `1px solid ${isCurrent ? "var(--border)" : plan.name === "pro" ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "0.375rem", fontSize: "0.78rem", fontWeight: 600,
                      cursor: loading || isCurrent ? "default" : "pointer",
                      opacity: loading && !isLoading ? 0.5 : 1,
                      fontFamily: "var(--font-jakarta)",
                    }}
                  >
                    {isCurrent ? "Active" : isLoading ? "Redirecting…" : isActive ? "Switch to this plan" : "Subscribe"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing history */}
      {recentPayments.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
            Billing history
          </h3>
          <div style={{ border: "1px solid var(--border)", borderRadius: "0.75rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", fontFamily: "var(--font-jakarta)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                  {["Plan", "Period", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} style={{ padding: "0.625rem 1rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < recentPayments.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "var(--foreground)", textTransform: "capitalize" }}>{p.plan}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--muted-foreground)" }}>{p.period === "annual" ? "Annual" : "6 months"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--foreground)" }}>₦{p.amount.toLocaleString("en-NG")}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                        color: p.status === "paid" ? "oklch(0.35 0.12 155)" : "var(--muted-foreground)",
                        background: p.status === "paid" ? "oklch(0.96 0.04 155)" : "var(--muted)",
                        border: `1px solid ${p.status === "paid" ? "oklch(0.85 0.07 155)" : "var(--border)"}`,
                        padding: "0.15rem 0.5rem", borderRadius: "100px",
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--muted-foreground)" }}>{formatDate(p.paid_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
