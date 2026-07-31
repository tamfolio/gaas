"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateGymDetails(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id) return { error: "Gym not found" };

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;

  if (!name) return { error: "Gym name is required" };

  const { error } = await supabase
    .from("gyms")
    .update({ name, phone, address })
    .eq("id", profile.gym_id);

  if (error) return { error: error.message };

  revalidatePath("/gym-admin/settings");
  return { success: true };
}
