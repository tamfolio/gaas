import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";
import { BranchesToggle } from "./branches-toggle";
import { ReferralSettings } from "./referral-settings";
import { SubscriptionSection } from "./subscription-section";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const gymId = profile!.gym_id!;

  const [{ data: gym }, { data: plans }, { data: recentPayments }] = await Promise.all([
    supabase
      .from("gyms")
      .select("name, email, phone, address, subscription_plan, subscription_status, subscription_expires_at, subscription_period, has_branches, referral_reward_days")
      .eq("id", gymId)
      .single(),
    createAdminClient()
      .from("platform_plans")
      .select("name, display_name, price_halfyear, price_annual, features")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("gym_subscription_payments")
      .select("id, plan, period, amount, status, period_start, period_end, paid_at")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const sectionHeader = (title: string) => (
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
      {title}
    </h2>
  );

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "640px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
          Configuration
        </p>
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
          Settings
        </h1>
      </div>

      {/* Gym details */}
      <div style={{ marginBottom: "1.75rem" }}>
        {sectionHeader("Gym details")}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          <SettingsForm gym={{ name: gym?.name ?? null, email: gym?.email ?? null, phone: gym?.phone ?? null, address: gym?.address ?? null }} />
        </div>
      </div>

      {/* Features */}
      <div style={{ marginBottom: "1.75rem" }}>
        {sectionHeader("Features")}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden" }}>
          <BranchesToggle enabled={gym?.has_branches ?? false} />
        </div>
      </div>

      {/* Referrals */}
      <div style={{ marginBottom: "1.75rem" }}>
        {sectionHeader("Referrals")}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          <ReferralSettings rewardDays={gym?.referral_reward_days ?? 7} />
        </div>
      </div>

      {/* Subscription */}
      <div>
        {sectionHeader("Subscription")}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          <SubscriptionSection
            currentPlan={gym?.subscription_plan ?? null}
            subscriptionStatus={gym?.subscription_status ?? "trial"}
            expiresAt={gym?.subscription_expires_at ?? null}
            subscriptionPeriod={gym?.subscription_period ?? null}
            plans={plans ?? []}
            recentPayments={recentPayments ?? []}
          />
        </div>
      </div>
    </div>
  );
}
