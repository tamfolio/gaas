"use client";

import { useState } from "react";
import { initiateGymSubscription } from "@/app/(dashboard)/gym-admin/settings/billing-actions";

type Plan = {
  name: string;
  display_name: string;
  price_halfyear: number;
  price_annual: number;
  features: string[];
};

export function SuspendedSubscribeForm({
  plans,
  gymId,
  userEmail,
}: {
  plans: Plan[];
  gymId: string;
  userEmail: string;
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

  return (
    <div style={{ width: "100%", maxWidth: "860px" }}>
      {/* Period toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "inline-flex", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.5rem", padding: "0.25rem", gap: "0.25rem" }}>
          {([["halfyear", "6 months"], ["annual", "Annual"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              style={{
                padding: "0.4rem 1rem", borderRadius: "0.375rem", border: "none",
                background: period === val ? "var(--primary)" : "transparent",
                color: period === val ? "#fff" : "var(--muted-foreground)",
                fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {label}
              {val === "annual" && <span style={{ marginLeft: "0.35rem", fontSize: "0.68rem", opacity: 0.85 }}>Save ~15%</span>}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ textAlign: "center", color: "var(--destructive)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
      )}

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {plans.map((plan) => {
          const price = period === "annual" ? plan.price_annual : plan.price_halfyear;
          const isLoading = loading === plan.name;
          return (
            <div
              key={plan.name}
              style={{
                background: "var(--card)", border: `1px solid ${plan.name === "pro" ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "1rem", overflow: "hidden",
              }}
            >
              {plan.name === "pro" && (
                <div style={{ background: "var(--primary)", padding: "0.3rem", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, color: "#fff", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Most popular
                </div>
              )}
              <div style={{ padding: "1.5rem" }}>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: "1rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "0.5rem" }}>
                  {plan.display_name}
                </div>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: "1.875rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "0.2rem" }}>
                  ₦{price.toLocaleString("en-NG")}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "1.25rem" }}>
                  per {period === "annual" ? "year" : "6 months"}
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      <span style={{ color: "var(--primary)", fontWeight: 700, flexShrink: 0, marginTop: "0.05rem" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={!!loading}
                  style={{
                    width: "100%", padding: "0.625rem",
                    background: plan.name === "pro" ? "var(--primary)" : "transparent",
                    color: plan.name === "pro" ? "#fff" : "var(--foreground)",
                    border: `1px solid ${plan.name === "pro" ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "0.5rem", fontSize: "0.85rem", fontWeight: 600,
                    cursor: loading ? "default" : "pointer", opacity: loading && !isLoading ? 0.5 : 1,
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {isLoading ? "Redirecting…" : "Subscribe now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
