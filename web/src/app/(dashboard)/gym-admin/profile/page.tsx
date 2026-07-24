import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role, created_at, gym_id")
    .eq("id", user!.id)
    .single();

  const { data: gym } = profile?.gym_id
    ? await supabase.from("gyms").select("name").eq("id", profile.gym_id).single()
    : { data: null };

  const initials = (profile?.full_name ?? "")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "560px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
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
          Account
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
          Profile
        </h1>
      </div>

      {/* Avatar + name card */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "color-mix(in oklch, var(--primary) 14%, var(--muted))",
            border: "2px solid color-mix(in oklch, var(--primary) 25%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--primary)",
            flexShrink: 0,
            fontFamily: "var(--font-syne)",
            letterSpacing: "-0.02em",
          }}
        >
          {initials || "?"}
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--foreground)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {profile?.full_name ?? "—"}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--muted-foreground)",
              marginTop: "0.2rem",
            }}
          >
            {gym?.name ?? "No gym linked"}
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: "0.375rem",
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--primary)",
              background: "color-mix(in oklch, var(--primary) 10%, transparent)",
              border: "1px solid color-mix(in oklch, var(--primary) 22%, transparent)",
              padding: "0.15rem 0.5rem",
              borderRadius: "100px",
            }}
          >
            Gym Admin
          </span>
        </div>
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
          { label: "Email", value: profile?.email ?? user?.email },
          { label: "Phone", value: profile?.phone ?? "Not set" },
          {
            label: "Member since",
            value: profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("en-NG", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "—",
          },
          { label: "Gym", value: gym?.name ?? "—" },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.875rem 1.25rem",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              gap: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--muted-foreground)",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                color: row.value === "Not set" ? "var(--muted-foreground)" : "var(--foreground)",
                textAlign: "right",
              }}
            >
              {row.value ?? "—"}
            </span>
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: "0.875rem",
          fontSize: "0.75rem",
          color: "var(--muted-foreground)",
          lineHeight: 1.5,
        }}
      >
        Profile editing and password changes are coming soon. To reset your password, sign out and use <strong>Forgot password</strong>.
      </p>
    </div>
  );
}
