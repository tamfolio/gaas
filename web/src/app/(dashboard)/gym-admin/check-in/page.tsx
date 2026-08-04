import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckInDisplay } from "./check-in-display";
import { AutoRefresh } from "./auto-refresh";

export default async function CheckInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();

  const gymId = profile?.gym_id;
  if (!gymId) redirect("/gym-admin");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const isLocalhost = siteUrl.includes("localhost");

  const { data: gym } = await supabase.from("gyms").select("has_branches").eq("id", gymId).single();

  const { data: branches } = gym?.has_branches
    ? await supabase.from("branches").select("id, name").eq("gym_id", gymId).eq("is_active", true).order("created_at")
    : { data: [] };

  const checkInUrl = `${siteUrl}/checkin/${gymId}`;

  // Today's check-ins
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: gymMembers } = await supabase
    .from("gym_members")
    .select("id, profiles:profile_id(full_name)")
    .eq("gym_id", gymId);

  const memberIds = (gymMembers ?? []).map((m) => m.id);
  const nameMap = new Map(
    (gymMembers ?? []).map((m) => [
      m.id,
      (m.profiles as unknown as { full_name: string } | null)?.full_name ?? "Member",
    ])
  );

  const { data: checkIns } = memberIds.length
    ? await supabase
        .from("check_ins")
        .select("id, checked_in_at, status, gym_member_id")
        .in("gym_member_id", memberIds)
        .gte("checked_in_at", todayStart.toISOString())
        .order("checked_in_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const entries = (checkIns ?? []).map((c) => ({
    id: c.id,
    checked_in_at: c.checked_in_at,
    status: c.status,
    memberName: nameMap.get(c.gym_member_id) ?? "Member",
  }));

  return (
    <>
      <AutoRefresh intervalMs={8000} />
      <CheckInDisplay
        checkInUrl={checkInUrl}
        isLocalhost={isLocalhost}
        entries={entries}
        branches={branches ?? []}
        siteUrl={siteUrl}
        gymId={gymId}
      />
    </>
  );
}
