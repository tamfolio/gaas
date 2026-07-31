"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack/client";

export async function initiateRenewalPayment() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get the member's current gym_member record with plan details
  const { data: member } = await supabase
    .from("gym_members")
    .select("id, gym_id, membership_plan_id, membership_plans:membership_plan_id(name, price, duration_days)")
    .eq("profile_id", user.id)
    .single();

  if (!member) throw new Error("Membership record not found");
  if (!member.membership_plan_id) throw new Error("No membership plan assigned. Ask your gym admin to assign a plan first.");

  const plan = member.membership_plans as unknown as {
    name: string;
    price: number;
    duration_days: number;
  } | null;

  if (!plan) throw new Error("Plan details not found");
  if (!plan.price || plan.price <= 0) throw new Error("This plan has no payment amount set.");

  const reference = `ER${Date.now()}${randomBytes(4).toString("hex")}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // Pre-create a pending payment record for the webhook to update
  const adminClient = createAdminClient();
  await adminClient.from("payments").insert({
    gym_id: member.gym_id,
    gym_member_id: member.id,
    amount: plan.price,
    currency: "NGN",
    status: "pending",
    paystack_reference: reference,
    description: `${plan.name} membership renewal`,
    paid_at: null,
  });

  // Initialize Paystack — passes metadata so webhook can act even if payment lookup fails
  const result = await initializeTransaction({
    email: user.email!,
    amount: plan.price,
    reference,
    callback_url: `${siteUrl}/payment/callback?reference=${reference}`,
    metadata: {
      gym_member_id: member.id,
      gym_id: member.gym_id,
      plan_id: member.membership_plan_id,
      plan_duration_days: plan.duration_days,
    },
  });

  redirect(result.data.authorization_url);
}
