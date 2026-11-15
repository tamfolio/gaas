import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { verifyAuthLink } from "@/lib/auth-link-token";
import { confirmAuthLink } from "./actions";
import { ContinueButton } from "./continue-button";

export const metadata: Metadata = {
  title: "Confirm — EngineRoom",
  // The URL carries a one-time token; keep it out of referrers and search engines.
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const headingStyle = {
  fontFamily: "var(--font-syne)",
  fontSize: "2rem",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  color: "var(--foreground)",
  lineHeight: 1.05,
  marginBottom: "0.4rem",
} as const;

const mutedStyle = { color: "var(--muted-foreground)", fontSize: "0.9rem", lineHeight: 1.5 } as const;

export default async function ConfirmAuthLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const payload = verifyAuthLink(t);

  if (!payload) {
    return (
      <div>
        <h1 style={headingStyle}>Link expired</h1>
        <p style={{ ...mutedStyle, marginBottom: "1.75rem" }}>
          This link is invalid, has already been used, or has expired. Request a new one, or ask
          your gym admin to resend your invite.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/forgot-password" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary-text)" }}>
            Reset password
          </Link>
          <Link href="/login" style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // If a different account is already signed in on this browser, say so before switching.
  const supabase = await createClient();
  const {
    data: { user: current },
  } = await supabase.auth.getUser();
  const switchingFrom =
    current?.email && current.email.toLowerCase() !== payload.email.toLowerCase() ? current.email : null;

  const isInvite = payload.type === "invite";
  const displayName = payload.name?.trim() || payload.email;
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={headingStyle}>{isInvite ? "Accept your invite" : "Reset your password"}</h1>
        <p style={mutedStyle}>
          {isInvite
            ? "Confirm this is you to set up your EngineRoom account."
            : "Confirm this is your account to choose a new password."}
        </p>
      </div>

      {/* Identity card — comes from the signed link, so it can't be spoofed */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          padding: "1rem",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          background: "var(--card)",
          marginBottom: "1.25rem",
        }}
      >
        <div
          aria-hidden
          style={{
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "999px",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: "0.9rem",
            flexShrink: 0,
          }}
        >
          {initials || "?"}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.95rem" }}>{displayName}</div>
          {payload.name && (
            <div style={{ ...mutedStyle, fontSize: "0.82rem", overflowWrap: "anywhere" }}>{payload.email}</div>
          )}
        </div>
      </div>

      {switchingFrom && (
        <p
          style={{
            fontSize: "0.8rem",
            lineHeight: 1.5,
            color: "var(--foreground)",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid color-mix(in oklch, oklch(0.75 0.15 75) 45%, transparent)",
            background: "color-mix(in oklch, oklch(0.75 0.15 75) 12%, transparent)",
            marginBottom: "1.25rem",
            overflowWrap: "anywhere",
          }}
        >
          You&apos;re currently signed in as <strong>{switchingFrom}</strong>. Continuing will sign you out of
          that account.
        </p>
      )}

      <form action={confirmAuthLink}>
        <input type="hidden" name="t" value={t} />
        <ContinueButton label={`Continue as ${payload.name?.trim().split(" ")[0] || payload.email}`} />
      </form>

      <p style={{ ...mutedStyle, fontSize: "0.8rem", marginTop: "1.25rem", textAlign: "center" }}>
        Not you? Don&apos;t continue — just close this page.
      </p>
    </div>
  );
}
