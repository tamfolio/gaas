"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function getAdminGymId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  return profile?.gym_id ?? null;
}

export async function logGuestVisit(formData: FormData) {
  const gymId = await getAdminGymId();
  if (!gymId) return { error: "Not authenticated" };

  const adminClient = createAdminClient();
  const memberId = formData.get("member_id") as string;
  const guestName = (formData.get("guest_name") as string)?.trim();
  const guestPhone = (formData.get("guest_phone") as string)?.trim() || null;
  const guestEmail = (formData.get("guest_email") as string)?.trim() || null;
  const visitedAt = (formData.get("visited_at") as string) || new Date().toISOString().split("T")[0];

  if (!memberId || !guestName) return { error: "Member and guest name are required." };

  // Verify member belongs to this gym and get their plan's guest allowance
  const { data: member } = await adminClient
    .from("gym_members")
    .select("id, membership_plan:membership_plans(guest_passes_per_month)")
    .eq("id", memberId)
    .eq("gym_id", gymId)
    .single();

  if (!member) return { error: "Member not found." };

  const rawPlan = member.membership_plan;
  const plan = (Array.isArray(rawPlan) ? rawPlan[0] : rawPlan) as { guest_passes_per_month: number } | null;
  const monthlyLimit = plan?.guest_passes_per_month ?? 0;

  if (monthlyLimit === 0) {
    return { error: "This member's plan does not include guest passes." };
  }

  // Count guest visits this calendar month
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const { count } = await adminClient
    .from("guest_visits")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId)
    .gte("visited_at", monthStart);

  if ((count ?? 0) >= monthlyLimit) {
    return { error: `This member has used all ${monthlyLimit} guest pass${monthlyLimit === 1 ? "" : "es"} for this month.` };
  }

  const { error } = await adminClient.from("guest_visits").insert({
    gym_id: gymId,
    member_id: memberId,
    guest_name: guestName,
    guest_phone: guestPhone,
    guest_email: guestEmail,
    visited_at: visitedAt,
  });

  if (error) return { error: error.message };

  revalidatePath("/gym-admin/guests");
  return { success: true };
}
