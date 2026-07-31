import { verifyTransaction } from "@/lib/paystack/client";
import Link from "next/link";

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <CallbackLayout>
        <ResultCard success={false} title="Invalid link" detail="No payment reference found. Please contact your gym." />
      </CallbackLayout>
    );
  }

  let success = false;
  let detail = "We could not confirm your payment. Please contact your gym if you were charged.";

  try {
    const result = await verifyTransaction(reference);
    success = result.data.status === "success";
    detail = success
      ? "Your payment was received. Your membership will be updated shortly."
      : `Payment status: ${result.data.status}. If you were charged, please contact your gym.`;
  } catch {
    detail = "Could not reach payment provider. Please check with your gym.";
  }

  return (
    <CallbackLayout>
      <ResultCard
        success={success}
        title={success ? "Payment successful!" : "Payment not confirmed"}
        detail={detail}
        reference={reference}
      />
    </CallbackLayout>
  );
}

function CallbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.04em", color: "var(--foreground)" }}>
          Engine<span style={{ color: "var(--primary)" }}>Room</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function ResultCard({
  success,
  title,
  detail,
  reference,
}: {
  success: boolean;
  title: string;
  detail: string;
  reference?: string;
}) {
  const iconColor = success ? "oklch(0.52 0.16 155)" : "oklch(0.55 0.18 25)";
  const borderColor = success ? "oklch(0.82 0.12 155)" : "var(--border)";

  return (
    <div
      style={{
        background: "var(--card)",
        border: `2px solid ${borderColor}`,
        borderRadius: "1.25rem",
        padding: "2.5rem 2rem",
        maxWidth: "380px",
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: `color-mix(in oklch, ${iconColor} 12%, transparent)`,
          border: `2px solid color-mix(in oklch, ${iconColor} 30%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          color: iconColor,
          fontWeight: 700,
        }}
      >
        {success ? "✓" : "✕"}
      </div>

      <div>
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.25rem",
            letterSpacing: "-0.03em",
            color: "var(--foreground)",
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
          {detail}
        </p>
      </div>

      {reference && (
        <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", opacity: 0.6, letterSpacing: "0.06em" }}>
          Ref: {reference}
        </p>
      )}

      <Link
        href="/member"
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--primary)",
          textDecoration: "none",
        }}
      >
        Go to dashboard →
      </Link>
    </div>
  );
}
