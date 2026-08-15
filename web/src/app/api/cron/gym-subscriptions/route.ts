import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const now = new Date();

  function addDays(d: Date, days: number) {
    const r = new Date(d);
    r.setDate(r.getDate() + days);
    return r;
  }

  let warned = 0;
  let suspended = 0;
  let skipped = 0;

  // 1. Find active gyms expiring in exactly 7 or 3 days — send warning to gym admin
  const warningThresholds = [
    { days: 7, label: "7 days", body: (name: string, date: string) => `Your EngineRoom subscription for ${name} expires in 7 days on ${date}. Renew now to avoid service interruption.` },
    { days: 3, label: "3 days", body: (name: string, date: string) => `Your EngineRoom subscription for ${name} expires in 3 days on ${date}. Renew immediately to keep your dashboard running.` },
  ];

  for (const threshold of warningThresholds) {
    const targetDate = addDays(now, threshold.days).toISOString().split("T")[0];

    const { data: gyms } = await adminClient
      .from("gyms")
      .select("id, name, subscription_expires_at")
      .eq("subscription_status", "active")
      .gte("subscription_expires_at", `${targetDate}T00:00:00Z`)
      .lt("subscription_expires_at", `${targetDate}T23:59:59Z`);

    for (const gym of gyms ?? []) {
      // Find the gym admin profile
      const { data: admin } = await adminClient
        .from("profiles")
        .select("id")
        .eq("gym_id", gym.id)
        .eq("role", "gym_admin")
        .maybeSingle();

      if (!admin) continue;

      // Dedup — skip if already warned recently
      const { data: existing } = await adminClient
        .from("notifications")
        .select("id")
        .eq("profile_id", admin.id)
        .eq("type", "membership")
        .ilike("title", "%subscription%")
        .gte("created_at", addDays(now, -2).toISOString())
        .limit(1);

      if (existing && existing.length > 0) { skipped++; continue; }

      const expiryDate = new Date(gym.subscription_expires_at).toLocaleDateString("en-NG", {
        day: "numeric", month: "long", year: "numeric",
      });

      await adminClient.from("notifications").insert({
        gym_id: gym.id,
        profile_id: admin.id,
        title: `Subscription expiring in ${threshold.label}`,
        body: threshold.body(gym.name, expiryDate),
        type: "membership",
        is_read: false,
      });

      warned++;
    }
  }

  // 2. Suspend gyms that expired more than 7 days ago (grace period)
  const graceCutoff = addDays(now, -7).toISOString();

  const { data: toSuspend } = await adminClient
    .from("gyms")
    .select("id, name")
    .eq("subscription_status", "active")
    .lt("subscription_expires_at", graceCutoff);

  for (const gym of toSuspend ?? []) {
    await adminClient
      .from("gyms")
      .update({ subscription_status: "suspended" })
      .eq("id", gym.id);

    // Notify gym admin
    const { data: admin } = await adminClient
      .from("profiles")
      .select("id")
      .eq("gym_id", gym.id)
      .eq("role", "gym_admin")
      .maybeSingle();

    if (admin) {
      await adminClient.from("notifications").insert({
        gym_id: gym.id,
        profile_id: admin.id,
        title: "Subscription suspended",
        body: `Access to ${gym.name} has been suspended due to a lapsed EngineRoom subscription. Renew at engineroom.ng to restore access immediately.`,
        type: "membership",
        is_read: false,
      });
    }

    suspended++;
  }

  return NextResponse.json({ ok: true, warned, suspended, skipped });
}
