import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendMail, buildMissedYouEmail } from "@/lib/email";
import { sendPushToProfile } from "@/lib/push";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  const now = new Date();

  // Window: last check-in was between 5 and 6 days ago — fires exactly once per member per absence streak
  const windowEnd   = new Date(now);
  windowEnd.setDate(windowEnd.getDate() - 5);
  windowEnd.setHours(0, 0, 0, 0);

  const windowStart = new Date(windowEnd);
  windowStart.setDate(windowStart.getDate() - 1);

  // Find active members whose last successful check-in falls in the 5-day window
  const { data: members, error } = await adminClient
    .from("gym_members")
    .select(`
      id,
      gym_id,
      profile_id,
      gyms:gym_id ( name ),
      profiles:profile_id ( full_name, email )
    `)
    .eq("status", "active");

  if (error || !members?.length) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0 });
  }

  let sent = 0;
  let skipped = 0;

  for (const member of members) {
    const profile = member.profiles as unknown as { full_name: string; email: string } | null;
    const gym     = member.gyms    as unknown as { name: string } | null;

    if (!profile?.email) { skipped++; continue; }

    // Get this member's most recent successful check-in
    const { data: lastCheckIn } = await adminClient
      .from("check_ins")
      .select("checked_in_at")
      .eq("gym_member_id", member.id)
      .eq("status", "success")
      .order("checked_in_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let qualifies = false;

    if (lastCheckIn) {
      const lastAt = new Date(lastCheckIn.checked_in_at);
      qualifies = lastAt >= windowStart && lastAt < windowEnd;
    } else {
      // Never checked in — qualify if they joined 5–6 days ago
      const { data: gm } = await adminClient
        .from("gym_members")
        .select("start_date")
        .eq("id", member.id)
        .single();

      if (gm?.start_date) {
        const startedAt = new Date(gm.start_date);
        qualifies = startedAt >= windowStart && startedAt < windowEnd;
      }
    }

    if (!qualifies) { skipped++; continue; }

    // Dedup: skip if we already sent a missed-you email to this member in the last 5 days
    const { data: existing } = await adminClient
      .from("notifications")
      .select("id")
      .eq("profile_id", member.profile_id)
      .eq("type", "missed_you")
      .gte("created_at", windowStart.toISOString())
      .limit(1);

    if (existing?.length) { skipped++; continue; }

    const gymName    = gym?.name ?? "your gym";
    const memberName = profile.full_name ?? "there";

    await adminClient.from("notifications").insert({
      gym_id:     member.gym_id,
      profile_id: member.profile_id,
      title:      "We missed you!",
      body:       `It's been 5 days since your last visit to ${gymName}. Come back and keep the momentum going!`,
      type:       "missed_you",
      is_read:    false,
    });

    await sendPushToProfile(adminClient, member.profile_id as string, {
      title: `We missed you, ${memberName}!`,
      body:  `It's been 5 days since your last visit to ${gymName}. Come back today!`,
      url:   "/member/dashboard",
    }).catch(() => null);

    await sendMail({
      to:      profile.email,
      subject: `We missed you at ${gymName}, ${memberName}!`,
      html:    buildMissedYouEmail({ memberName, gymName, loginUrl: `${siteUrl}/login` }),
    }).catch(() => null);

    sent++;
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
