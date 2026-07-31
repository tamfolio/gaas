import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack/client";
import { createAdminClient } from "@/lib/supabase/server";

type ChargeData = {
  reference: string;
  amount: number; // in kobo
  status: string;
  metadata?: {
    gym_member_id?: string;
    gym_id?: string;
    plan_id?: string;
    plan_duration_days?: number;
  };
  customer: { email: string };
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as { event: string; data: ChargeData };

  if (event.event === "charge.success") {
    await handleChargeSuccess(event.data);
  }

  // Always return 200 so Paystack stops retrying
  return NextResponse.json({ ok: true });
}

async function handleChargeSuccess(data: ChargeData) {
  const { reference, metadata } = data;
  const adminClient = createAdminClient();

  // Find the pre-created pending payment record
  const { data: payment } = await adminClient
    .from("payments")
    .select("id, status, gym_member_id")
    .eq("paystack_reference", reference)
    .maybeSingle();

  // Idempotency: already processed
  if (payment?.status === "paid") return;

  const gymMemberId = payment?.gym_member_id ?? metadata?.gym_member_id;
  if (!gymMemberId) return;

  // Mark payment as paid
  if (payment) {
    await adminClient
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", payment.id);
  }

  // Resolve plan duration — prefer metadata, fall back to querying the member's plan
  let durationDays = metadata?.plan_duration_days;

  if (!durationDays) {
    const { data: member } = await adminClient
      .from("gym_members")
      .select("membership_plans:membership_plan_id(duration_days)")
      .eq("id", gymMemberId)
      .single();

    const plan = member?.membership_plans as unknown as { duration_days: number } | null;
    durationDays = plan?.duration_days;
  }

  if (!durationDays) return;

  const startDate = new Date().toISOString().split("T")[0];
  const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  await adminClient
    .from("gym_members")
    .update({ status: "active", start_date: startDate, end_date: endDate })
    .eq("id", gymMemberId);
}
