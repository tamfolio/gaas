import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/referrals";
import { ReferralPageClient } from "./referral-client";

export default async function ReferralPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id) redirect("/login");

  const adminClient = createAdminClient();

  // Get member record
  const { data: member } = await adminClient
    .from("gym_members")
    .select("id")
    .eq("gym_id", profile.gym_id)
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/member");

  // Get or create referral code
  let code: string | null = null;

  const { data: existingCode } = await adminClient
    .from("referral_codes")
    .select("code")
    .eq("gym_id", profile.gym_id)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existingCode) {
    code = existingCode.code;
  } else {
    // Generate a unique code (retry on collision)
    let attempts = 0;
    while (!code && attempts < 5) {
      const candidate = generateReferralCode();
      const { error } = await adminClient.from("referral_codes").insert({
        gym_id: profile.gym_id,
        member_id: member.id,
        code: candidate,
      });
      if (!error) code = candidate;
      attempts++;
    }
  }

  // Get referral stats
  const { data: referrals } = await adminClient
    .from("referrals")
    .select("status, days_awarded")
    .eq("referrer_member_id", member.id);

  const total = referrals?.length ?? 0;
  const converted = referrals?.filter((r) => r.status === "converted").length ?? 0;
  const daysEarned = referrals
    ?.filter((r) => r.status === "converted")
    .reduce((sum, r) => sum + (r.days_awarded ?? 0), 0) ?? 0;

  // Get gym's reward days so we can show "earn X days per referral"
  const { data: gym } = await adminClient
    .from("gyms")
    .select("name, referral_reward_days")
    .eq("id", profile.gym_id)
    .single();

  return (
    <ReferralPageClient
      code={code}
      gymName={gym?.name ?? "your gym"}
      rewardDays={gym?.referral_reward_days ?? 7}
      totalReferrals={total}
      convertedReferrals={converted}
      daysEarned={daysEarned}
    />
  );
}
