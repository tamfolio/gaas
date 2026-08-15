"use client";

import { useState } from "react";
import Link from "next/link";

export function ReferralPageClient({
  code,
  gymName,
  rewardDays,
  totalReferrals,
  convertedReferrals,
  daysEarned,
}: {
  code: string | null;
  gymName: string;
  rewardDays: number;
  totalReferrals: number;
  convertedReferrals: number;
  daysEarned: number;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ maxWidth: "560px", padding: "2rem 1.75rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/member"
          style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.75rem" }}
        >
          ← Back to dashboard
        </Link>
        <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
          Referrals
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
          Refer &amp; Earn
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: "0.4rem" }}>
          Share your code with friends. Earn {rewardDays} free day{rewardDays !== 1 ? "s" : ""} for every friend who joins and pays.
        </p>
      </div>

      {/* Code card */}
      <div
        style={{
          background: "var(--brand-dark)",
          borderRadius: "0.875rem",
          padding: "2rem",
          marginBottom: "1.25rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", top: 0, right: 0,
            width: "200px", height: "200px",
            background: "radial-gradient(circle, rgba(232,70,10,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <p style={{ fontSize: "0.65rem", color: "var(--brand-dark-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Your referral code
        </p>
        {code ? (
          <>
            <div
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "var(--brand-dark-fg)",
                letterSpacing: "0.18em",
                lineHeight: 1,
                marginBottom: "1.5rem",
              }}
            >
              {code}
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? "oklch(0.35 0.12 155)" : "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.6rem 1.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-jakarta)",
                transition: "background 0.15s",
              }}
            >
              {copied ? "Copied!" : "Copy code"}
            </button>
          </>
        ) : (
          <p style={{ color: "var(--brand-dark-muted)", fontSize: "0.875rem" }}>
            Could not generate a code. Please try refreshing.
          </p>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.875rem",
          marginBottom: "1.75rem",
        }}
      >
        {[
          { label: "Referred", value: totalReferrals },
          { label: "Converted", value: convertedReferrals },
          { label: "Days earned", value: daysEarned },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.25rem 1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "var(--font-syne)", fontSize: "1.875rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "0.3rem" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
          How it works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {[
            { step: "1", text: `Share your code with a friend who wants to join ${gymName}.` },
            { step: "2", text: "The gym admin enters your code when adding your friend as a member." },
            { step: "3", text: `Once your friend makes their first payment, you earn ${rewardDays} free day${rewardDays !== 1 ? "s" : ""} added to your membership.` },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                  background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.68rem", fontWeight: 700, color: "var(--primary)",
                }}
              >
                {step}
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.55, marginTop: "0.2rem" }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
