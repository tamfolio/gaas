import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { SuspendedSubscribeForm } from "./subscribe-form";

export default async function SuspendedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id) redirect("/login");

  // Verify the gym is actually suspended
  const { data: gym } = await supabase
    .from("gyms")
    .select("name, subscription_status, subscription_plan, subscription_expires_at")
    .eq("id", profile.gym_id)
    .single();

  // If not suspended, send them to the right place
  if (gym?.subscription_status === "active" || gym?.subscription_status === "trial") {
    redirect("/gym-admin");
  }
  if (gym?.subscription_status === "pending") {
    redirect("/pending");
  }

  // Fetch plan pricing
  const { data: plans } = await supabase
    .from("platform_plans")
    .select("name, display_name, price_halfyear, price_annual, features")
    .eq("is_active", true)
    .order("sort_order");

  const expiredAt = gym?.subscription_expires_at
    ? new Date(gym.subscription_expires_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "2.5rem", marginTop: "1rem" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.04em", color: "var(--foreground)" }}>
            Engine<span style={{ color: "var(--primary)" }}>Room</span>
          </span>
        </Link>
      </div>

      {/* Status card */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1.25rem",
          padding: "2.5rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "56px", height: "56px", borderRadius: "50%",
            background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
            border: "2px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
            fontSize: "1.5rem", marginBottom: "1.5rem",
          }}
        >
          ⚠
        </div>

        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1, marginBottom: "0.75rem" }}>
          Subscription suspended
        </h1>

        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.65, marginBottom: expiredAt ? "0.75rem" : "2rem" }}>
          Access to <strong style={{ color: "var(--foreground)" }}>{gym?.name ?? "your gym"}</strong>&apos;s dashboard has been suspended because your EngineRoom subscription has lapsed.
        </p>

        {expiredAt && (
          <p style={{ fontSize: "0.8rem", color: "var(--destructive)", marginBottom: "2rem" }}>
            Expired on {expiredAt}
          </p>
        )}

        <p style={{ fontSize: "0.85rem", color: "var(--foreground)", fontWeight: 500 }}>
          Choose a plan below to restore access immediately.
        </p>
      </div>

      {/* Plan selection */}
      {plans && plans.length > 0 && (
        <SuspendedSubscribeForm plans={plans} gymId={profile.gym_id} userEmail={user.email!} />
      )}

      {/* Sign out */}
      <form action={logout} style={{ marginTop: "1.5rem" }}>
        <button
          type="submit"
          style={{
            background: "transparent", border: "1px solid var(--border)", borderRadius: "0.5rem",
            padding: "0.5rem 1.25rem", fontSize: "0.8rem", fontWeight: 600,
            color: "var(--muted-foreground)", cursor: "pointer", fontFamily: "var(--font-jakarta)",
          }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
