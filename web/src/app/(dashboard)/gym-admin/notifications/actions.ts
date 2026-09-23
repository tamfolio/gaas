"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendPush, sendPushToProfile } from "@/lib/push";

export async function sendAnnouncement(formData: FormData) {
  const adminClient = createAdminClient();

  const gymId    = formData.get("gym_id") as string;
  const title    = (formData.get("title") as string) || null;
  const body     = formData.get("body") as string;
  const audience = formData.get("audience") as string; // "all" | member profile_id

  if (!body?.trim()) return { error: "Message is required." };

  if (audience === "all") {
    const { error } = await adminClient.from("notifications").insert({
      gym_id:     gymId,
      profile_id: null,
      title,
      body,
      type:       "announcement",
      is_read:    false,
    });
    if (error) return { error: error.message };

    // Push to all members in this gym who have subscribed
    const { data: subs } = await adminClient
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, profiles!inner(gym_id)")
      .eq("profiles.gym_id", gymId);

    if (subs?.length) {
      await sendPush(subs, {
        title: title ?? "Announcement",
        body,
        url: "/member/notifications",
      }).catch(() => null);
    }
  } else {
    // Specific member — audience is the profile_id
    const { error } = await adminClient.from("notifications").insert({
      gym_id:     gymId,
      profile_id: audience,
      title,
      body,
      type:       "announcement",
      is_read:    false,
    });
    if (error) return { error: error.message };

    await sendPushToProfile(adminClient, audience, {
      title: title ?? "Announcement",
      body,
      url:   "/member/notifications",
    }).catch(() => null);
  }

  revalidatePath("/gym-admin/notifications");
  return { success: true };
}
