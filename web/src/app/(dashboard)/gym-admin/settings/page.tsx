import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import { BranchesToggle } from "./branches-toggle";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const { data: gym } = await supabase
    .from("gyms")
    .select("name, email, phone, address, subscription_plan, has_branches")
    .eq("id", profile!.gym_id!)
    .single();

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "560px" }}>
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
          Configuration
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
          Settings
        </h1>
      </div>

      {/* Gym details — editable */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
            marginBottom: "0.875rem",
          }}
        >
          Gym details
        </h2>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.875rem",
            padding: "1.5rem",
          }}
        >
          <SettingsForm
            gym={{
              name: gym?.name ?? null,
              email: gym?.email ?? null,
              phone: gym?.phone ?? null,
              address: gym?.address ?? null,
            }}
          />
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
            marginBottom: "0.875rem",
          }}
        >
          Features
        </h2>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.875rem",
            overflow: "hidden",
          }}
        >
          <BranchesToggle enabled={gym?.has_branches ?? false} />
        </div>
      </div>

      {/* Subscription — read-only */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
            marginBottom: "0.875rem",
          }}
        >
          Subscription
        </h2>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.875rem",
            padding: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--foreground)",
                textTransform: "capitalize",
                marginBottom: "0.2rem",
              }}
            >
              {gym?.subscription_plan ?? "Free"} plan
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
              Billing and plan upgrades coming soon.
            </div>
          </div>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--primary)",
              background: "color-mix(in oklch, var(--primary) 10%, transparent)",
              border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
              padding: "0.2rem 0.625rem",
              borderRadius: "100px",
            }}
          >
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
