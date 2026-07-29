import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function dateStr(daysFromNow: number) {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
  }

  const targets = [
    { date: dateStr(7), type: "expiry_7d", message: (name: string, date: string) => `Hi ${name}, your membership expires in 7 days on ${date}. Renew early to avoid any interruption.` },
    { date: dateStr(3), type: "expiry_3d", message: (name: string, date: string) => `Hi ${name}, your membership expires in 3 days on ${date}. Please renew soon to stay active.` },
  ];

  let sent = 0;
  let skipped = 0;

  for (const target of targets) {
    const { data: expiring } = await adminClient
      .from("gym_members")
      .select("id, gym_id, profile_id, end_date, profiles:profile_id(full_name)")
      .eq("end_date", target.date)
      .eq("status", "active");

    if (!expiring?.length) continue;

    for (const member of expiring) {
      const profileId = member.profile_id as string;
      const gymId = member.gym_id as string;
      const profile = member.profiles as unknown as { full_name: string } | null;
      const name = profile?.full_name ?? "Member";
      const endDate = new Date(member.end_date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

      // Dedup: skip if we already sent this type of alert for this member recently
      const { data: existing } = await adminClient
        .from("notifications")
        .select("id")
        .eq("profile_id", profileId)
        .eq("type", target.type)
        .gte("created_at", new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      await adminClient.from("notifications").insert({
        gym_id: gymId,
        profile_id: profileId,
        title: "Membership expiring soon",
        body: target.message(name, endDate),
        type: target.type,
        is_read: false,
      });

      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
