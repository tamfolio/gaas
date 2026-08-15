import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { invitePlatformStaff, removePlatformStaff } from "./actions";

export default async function PlatformTeamPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "platform_admin") redirect("/super-admin");

  const { data: staff } = await adminClient
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "platform_staff")
    .order("created_at", { ascending: true });

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "640px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
          Platform
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
          Team
        </h1>
      </div>

      {/* Current platform staff */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
          Platform staff
          {staff && staff.length > 0 && (
            <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
              {staff.length}
            </span>
          )}
        </h2>
        {!staff || staff.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "2.5rem 1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>No platform staff yet.</p>
          </div>
        ) : (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", overflow: "hidden" }}>
            {staff.map((member, i) => (
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
                    background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--primary) 22%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--primary)",
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
                <span style={{ padding: "0.2rem 0.6rem", borderRadius: "100px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted-foreground)", background: "var(--muted)", border: "1px solid var(--border)", flexShrink: 0 }}>
                  Staff
                </span>
                <form action={async () => { "use server"; await removePlatformStaff(member.id); }}>
                  <button type="submit" style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.3rem 0.625rem", fontSize: "0.72rem", color: "var(--muted-foreground)", cursor: "pointer", fontFamily: "var(--font-jakarta)", flexShrink: 0 }}>
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite form */}
      <div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.875rem" }}>
          Add platform staff
        </h2>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          <form action={async (fd: FormData) => { "use server"; await invitePlatformStaff(fd); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", lineHeight: 1.6, padding: "0.75rem", background: "var(--muted)", borderRadius: "0.5rem" }}>
              Platform staff can view all gyms and approve/reject registrations. They cannot suspend or delete gyms, and cannot manage other staff.
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
