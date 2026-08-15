import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ROLE_LABELS, GYM_STAFF_ROLES } from "@/lib/permissions";
import { inviteStaff, approveInvite, declineInvite, removeStaff } from "./actions";

const ROLE_BADGE: Record<string, { color: string; bg: string }> = {
  second_admin: { color: "oklch(0.50 0.16 260)", bg: "oklch(0.96 0.04 260)" },
  front_desk:   { color: "oklch(0.52 0.16 155)", bg: "oklch(0.96 0.04 155)" },
  accountant:   { color: "oklch(0.52 0.14 55)",  bg: "oklch(0.97 0.06 90)"  },
  trainer:      { color: "oklch(0.55 0.18 25)",  bg: "oklch(0.97 0.04 25)"  },
};

export default async function TeamPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, gym_id, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id || !["gym_admin", "second_admin"].includes(profile.role)) {
    redirect("/gym-admin");
  }

  const isOwner = profile.role === "gym_admin";

  // Current staff (all non-member, non-owner roles in this gym)
  const { data: staff } = await adminClient
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("gym_id", profile.gym_id)
    .in("role", ["second_admin", "front_desk", "accountant", "trainer"])
    .order("created_at", { ascending: true });

  // Pending owner-approval invites
  const { data: pendingInvites } = await adminClient
    .from("gym_staff_invites")
    .select("id, email, full_name, role, invited_by, created_at")
    .eq("gym_id", profile.gym_id)
    .eq("status", "pending_owner_approval")
    .order("created_at", { ascending: false });

  // Resolve inviter names
  const inviterIds = [...new Set((pendingInvites ?? []).map((i) => i.invited_by))];
  const inviterNames: Record<string, string> = {};
  if (inviterIds.length > 0) {
    const { data: inviters } = await adminClient
      .from("profiles")
      .select("id, full_name")
      .in("id", inviterIds);
    for (const p of inviters ?? []) {
      inviterNames[p.id] = p.full_name ?? "Unknown";
    }
  }

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "720px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
          Settings
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
          Team
        </h1>
      </div>

      {/* Pending approvals — owner only */}
      {isOwner && (pendingInvites ?? []).length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
            Pending approval
          </h2>
          <div style={{ background: "var(--card)", border: "1px solid oklch(0.88 0.10 90)", borderRadius: "0.75rem", overflow: "hidden" }}>
            {(pendingInvites ?? []).map((invite, i, arr) => (
              <div
                key={invite.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)", marginBottom: "0.1rem" }}>
                    {invite.full_name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                    {invite.email} · invited by {inviterNames[invite.invited_by] ?? "a second admin"} as <strong>Second Admin</strong>
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <form action={async () => { "use server"; await approveInvite(invite.id); }}>
                    <button type="submit" style={{ padding: "0.4rem 0.875rem", background: "oklch(0.52 0.16 155)", border: "none", borderRadius: "0.5rem", color: "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-jakarta)" }}>
                      Approve
                    </button>
                  </form>
                  <form action={async () => { "use server"; await declineInvite(invite.id); }}>
                    <button type="submit" style={{ padding: "0.4rem 0.875rem", background: "transparent", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--muted-foreground)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-jakarta)" }}>
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current team */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
          Current staff
          {staff && staff.length > 0 && (
            <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
              {staff.length}
            </span>
          )}
        </h2>
        {!staff || staff.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "2.5rem 1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>No staff added yet.</p>
          </div>
        ) : (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", overflow: "hidden" }}>
            {staff.map((member, i) => {
              const badge = ROLE_BADGE[member.role];
              const canRemove =
                isOwner ||
                (profile.role === "second_admin" && member.role !== "second_admin");
              return (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.875rem 1.25rem",
                    borderBottom: i < staff.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: badge?.bg ?? "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: badge?.color ?? "var(--foreground)",
                      flexShrink: 0,
                    }}
                  >
                    {(member.full_name ?? "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--foreground)", marginBottom: "0.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.full_name ?? "—"}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {member.email}
                    </p>
                  </div>
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "100px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: badge?.color ?? "var(--muted-foreground)", background: badge?.bg ?? "var(--muted)", border: `1px solid color-mix(in oklch, ${badge?.color ?? "var(--muted-foreground)"} 25%, transparent)`, flexShrink: 0 }}>
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                  {canRemove && (
                    <form action={async () => { "use server"; await removeStaff(member.id); }}>
                      <button type="submit" style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.3rem 0.625rem", fontSize: "0.72rem", color: "var(--muted-foreground)", cursor: "pointer", fontFamily: "var(--font-jakarta)", flexShrink: 0 }}>
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite form */}
      <div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
          Invite staff
        </h2>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          <form action={async (fd: FormData) => { "use server"; await inviteStaff(fd); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.375rem" }}>
                  Full name
                </label>
                <input
                  name="full_name"
                  required
                  placeholder="Jane Doe"
                  style={{ width: "100%", padding: "0.6rem 0.875rem", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "0.5rem", fontSize: "0.875rem", color: "var(--foreground)", fontFamily: "var(--font-jakarta)", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.375rem" }}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  style={{ width: "100%", padding: "0.6rem 0.875rem", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "0.5rem", fontSize: "0.875rem", color: "var(--foreground)", fontFamily: "var(--font-jakarta)", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.375rem" }}>
                Role
              </label>
              <select
                name="role"
                required
                style={{ width: "100%", padding: "0.6rem 0.875rem", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "0.5rem", fontSize: "0.875rem", color: "var(--foreground)", fontFamily: "var(--font-jakarta)", boxSizing: "border-box" }}
              >
                <option value="">Select a role…</option>
                {(isOwner ? GYM_STAFF_ROLES : GYM_STAFF_ROLES).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", lineHeight: 1.6, padding: "0.75rem", background: "var(--muted)", borderRadius: "0.5rem" }}>
              <strong style={{ color: "var(--foreground)" }}>Second Admin</strong> — near-full access, cannot change billing or delete the gym.{" "}
              <strong style={{ color: "var(--foreground)" }}>Front Desk</strong> — check-ins and member lookup only.{" "}
              <strong style={{ color: "var(--foreground)" }}>Accountant</strong> — payments and plans view only.
              {!isOwner && <>{" "}Inviting a Second Admin requires owner approval.</>}
            </div>
            <button
              type="submit"
              style={{ alignSelf: "flex-start", padding: "0.6rem 1.25rem", background: "var(--primary)", border: "none", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-jakarta)" }}
            >
              Send invite
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
