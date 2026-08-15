import { createClient } from "@/lib/supabase/server";
import { GuestVisitsClient } from "./guests-client";

export default async function GuestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const gymId = profile!.gym_id!;

  const [{ data: rawVisits }, { data: rawMembers }] = await Promise.all([
    supabase
      .from("guest_visits")
      .select("id, guest_name, guest_phone, guest_email, visited_at, created_at, member:gym_members(id, profile:profiles(full_name))")
      .eq("gym_id", gymId)
      .order("visited_at", { ascending: false })
      .limit(200),
    supabase
      .from("gym_members")
      .select("id, profile:profiles(full_name), membership_plan:membership_plans(guest_passes_per_month)")
      .eq("gym_id", gymId)
      .eq("status", "active")
      .order("created_at"),
  ]);

  // Supabase returns nested joins as arrays — normalize to single objects
  const visits = (rawVisits ?? []).map((v) => {
    const memberArr = v.member as unknown as { id: string; profile: { full_name: string }[] }[] | null;
    const m = Array.isArray(memberArr) ? memberArr[0] : null;
    return {
      id: v.id as string,
      guest_name: v.guest_name as string,
      guest_phone: v.guest_phone as string | null,
      guest_email: v.guest_email as string | null,
      visited_at: v.visited_at as string,
      member: m
        ? { id: m.id, profile: Array.isArray(m.profile) ? (m.profile[0] ?? null) : (m.profile ?? null) }
        : null,
    };
  });

  const eligibleMembers = (rawMembers ?? [])
    .map((m) => {
      const profileArr = m.profile as unknown as { full_name: string }[];
      const planArr = m.membership_plan as unknown as { guest_passes_per_month: number }[];
      return {
        id: m.id as string,
        profile: Array.isArray(profileArr) ? (profileArr[0] ?? null) : (profileArr ?? null),
        membership_plan: Array.isArray(planArr) ? (planArr[0] ?? null) : (planArr ?? null),
      };
    })
    .filter((m) => (m.membership_plan?.guest_passes_per_month ?? 0) > 0);

  return (
    <GuestVisitsClient
      visits={visits}
      eligibleMembers={eligibleMembers}
    />
  );
}
