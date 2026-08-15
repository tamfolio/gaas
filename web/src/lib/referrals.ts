import { createAdminClient } from "./supabase/server";

// Generates a 6-char uppercase alphanumeric code avoiding ambiguous characters
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Converts a pending referral if this is the member's first paid payment.
// Called after any payment is recorded as paid (webhook + manual).
export async function convertReferralOnFirstPayment(
  gymMemberId: string,
  gymId: string
) {
  const adminClient = createAdminClient();

  // Only convert on the very first paid payment
  const { count } = await adminClient
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("gym_member_id", gymMemberId)
    .eq("status", "paid");

  if (!count || count > 1) return;

  // Find pending referral for this member
  const { data: referral } = await adminClient
    .from("referrals")
    .select("id, referrer_member_id")
    .eq("referred_member_id", gymMemberId)
    .eq("status", "pending")
    .maybeSingle();

  if (!referral) return;

  // Get reward days from gym settings
  const { data: gym } = await adminClient
    .from("gyms")
    .select("referral_reward_days")
    .eq("id", gymId)
    .single();

  const days = gym?.referral_reward_days ?? 7;

  // Extend referrer's membership end date
  const { data: referrer } = await adminClient
    .from("gym_members")
    .select("end_date")
    .eq("id", referral.referrer_member_id)
    .single();

  if (referrer?.end_date) {
    const newEnd = new Date(referrer.end_date);
    newEnd.setDate(newEnd.getDate() + days);
    await adminClient
      .from("gym_members")
      .update({ end_date: newEnd.toISOString().split("T")[0] })
      .eq("id", referral.referrer_member_id);
  }

  await adminClient
    .from("referrals")
    .update({
      status: "converted",
      days_awarded: days,
      converted_at: new Date().toISOString(),
    })
    .eq("id", referral.id);
}
