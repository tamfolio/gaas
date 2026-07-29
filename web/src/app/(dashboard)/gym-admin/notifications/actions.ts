"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendAnnouncement(formData: FormData) {
  const adminClient = createAdminClient();

  const gymId = formData.get("gym_id") as string;
  const title = (formData.get("title") as string) || null;
  const body = formData.get("body") as string;
  const audience = formData.get("audience") as string; // "all" | member profile_id

  if (!body?.trim()) return { error: "Message is required." };

  if (audience === "all") {
    const { error } = await adminClient.from("notifications").insert({
      gym_id: gymId,
      profile_id: null,
      title,
      body,
      type: "announcement",
      is_read: false,
    });
    if (error) return { error: error.message };
  } else {
    // Specific member — audience is the profile_id
    const { error } = await adminClient.from("notifications").insert({
      gym_id: gymId,
      profile_id: audience,
      title,
      body,
      type: "announcement",
      is_read: false,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/gym-admin/notifications");
  return { success: true };
}
