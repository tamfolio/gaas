"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) return { error: error.message };
  revalidatePath("/member/notifications");
  return { success: true };
}

export async function markAllNotificationsRead(gymId: string, profileId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("gym_id", gymId)
    .or(`profile_id.eq.${profileId},profile_id.is.null`)
    .eq("is_read", false);

  if (error) return { error: error.message };
  revalidatePath("/member/notifications");
  return { success: true };
}
