"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack/client";

export async function initiateGymSubscription(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = formData.get("plan") as string;
  const period = formData.get("period") as string;

  if (!["basic", "pro", "enterprise"].includes(plan)) return { error: "Invalid plan." };
  if (!["halfyear", "annual"].includes(period)) return { error: "Invalid billing period." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id) return { error: "Gym not found." };

  const adminClient = createAdminClient();

  const { data: planData } = await adminClient
    .from("platform_plans")
    .select("display_name, price_halfyear, price_annual")
    .eq("name", plan)
    .eq("is_active", true)
    .single();

  if (!planData) return { error: "Plan not found." };

  const amount = period === "annual" ? planData.price_annual : planData.price_halfyear;
  const reference = `ERSUB${Date.now()}${randomBytes(4).toString("hex")}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await adminClient.from("gym_subscription_payments").insert({
    gym_id: profile.gym_id,
    plan,
    period,
    amount,
    paystack_reference: reference,
    status: "pending",
  });

  const result = await initializeTransaction({
    email: user.email!,
    amount,
    reference,
    callback_url: `${siteUrl}/gym-admin/settings?tab=subscription&paid=1`,
    metadata: {
      payment_type: "gym_subscription",
      gym_id: profile.gym_id,
      plan,
      period,
      amount,
    },
  });

  redirect(result.data.authorization_url);
}
