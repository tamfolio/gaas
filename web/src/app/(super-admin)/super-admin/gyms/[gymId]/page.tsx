import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { approveGym, suspendGym, reactivateGym, rejectGym } from "./actions";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "oklch(0.52 0.14 55)",  bg: "oklch(0.97 0.06 90)"  },
  trial:     { label: "Trial",     color: "oklch(0.50 0.16 260)", bg: "oklch(0.96 0.04 260)" },
  active:    { label: "Active",    color: "oklch(0.52 0.16 155)", bg: "oklch(0.96 0.04 155)" },
  suspended: { label: "Suspended", color: "oklch(0.55 0.18 25)",  bg: "oklch(0.97 0.04 25)"  },
  cancelled: { label: "Cancelled", color: "var(--muted-foreground)", bg: "var(--muted)"       },
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "0.625rem",
        padding: "1rem 1.1rem 0.875rem",
      }}
    >
      <p style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

export default async function GymDetailPage({ params }: { params: Promise<{ gymId: string }> }) {
  const { gymId } = await params;
  const adminClient = createAdminClient();

  const { data: gym } = await adminClient
    .from("gyms")
    .select("id, name, email, phone, address, subscription_status, subscription_plan, created_at")
    .eq("id", gymId)
    .single();

  if (!gym) notFound();

  const [
    { count: memberCount },
    { count: trainerCount },
    { count: planCount },
  ] = await Promise.all([
    adminClient.from("gym_members").select("*", { count: "exact", head: true }).eq("gym_id", gymId),
    adminClient.from("profiles").select("*", { count: "exact", head: true }).eq("gym_id", gymId).eq("role", "trainer"),
    adminClient.from("membership_plans").select("*", { count: "exact", head: true }).eq("gym_id", gymId).eq("is_active", true),
  ]);

  const s = STATUS_LABELS[gym.subscription_status] ?? STATUS_LABELS.cancelled;
  const joined = new Date(gym.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

  const isPending = gym.subscription_status === "pending";
  const isSuspended = gym.subscription_status === "suspended";
  const isActive = gym.subscription_status === "active" || gym.subscription_status === "trial";

  type FormAction = (formData: FormData) => Promise<void>;
  const approveAction = approveGym.bind(null, gymId) as unknown as FormAction;
  const suspendAction = suspendGym.bind(null, gymId) as unknown as FormAction;
  const reactivateAction = reactivateGym.bind(null, gymId) as unknown as FormAction;

  async function handleReject() {
    "use server";
    await rejectGym(gymId);
    redirect("/super-admin/gyms");
  }

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "720px" }}>
      {/* Back */}
      <Link
        href="/super-admin/gyms"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem", color: "var(--muted-foreground)", textDecoration: "none", marginBottom: "1.5rem" }}
      >
        ← All gyms
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--foreground)",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}
          >
            {gym.name}
          </h1>
          <span
            style={{
              padding: "0.2rem 0.65rem",
              borderRadius: "100px",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: s.color,
              background: s.bg,
              border: `1px solid color-mix(in oklch, ${s.color} 28%, transparent)`,
            }}
          >
            {s.label}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {isPending && (
            <>
              <form action={approveAction}>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1.1rem",
                    background: "oklch(0.52 0.16 155)",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  Approve
                </button>
              </form>
              <form action={handleReject}>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1.1rem",
                    background: "transparent",
                    border: "1px solid oklch(0.55 0.18 25)",
                    borderRadius: "0.5rem",
                    color: "oklch(0.55 0.18 25)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  Reject
                </button>
              </form>
            </>
          )}
          {isActive && (
            <form action={suspendAction}>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1.1rem",
                  background: "transparent",
                  border: "1px solid oklch(0.55 0.18 25)",
                  borderRadius: "0.5rem",
                  color: "oklch(0.55 0.18 25)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                Suspend
              </button>
            </form>
          )}
          {isSuspended && (
            <form action={reactivateAction}>
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1.1rem",
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                Reactivate
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.875rem",
          marginBottom: "2rem",
        }}
      >
        <Stat label="Members" value={memberCount ?? 0} />
        <Stat label="Trainers" value={trainerCount ?? 0} />
        <Stat label="Active Plans" value={planCount ?? 0} />
      </div>

      {/* Details */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      >
        {[
          { label: "Email", value: gym.email },
          { label: "Phone", value: gym.phone ?? "—" },
          { label: "Address", value: gym.address ?? "—" },
          { label: "Plan", value: gym.subscription_plan },
          { label: "Joined", value: joined },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              padding: "0.875rem 1.25rem",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              gap: "1rem",
            }}
          >
            <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--muted-foreground)", width: "100px", flexShrink: 0 }}>
              {row.label}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--foreground)", fontWeight: 500 }}>
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
