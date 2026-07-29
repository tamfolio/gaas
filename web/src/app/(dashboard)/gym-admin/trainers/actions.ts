"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTrainerProfile(formData: FormData) {
  const adminClient = createAdminClient();

  const gymTrainerId = formData.get("gym_trainer_id") as string;
  const profileId = formData.get("profile_id") as string;
  const fullName = formData.get("full_name") as string;
  const phone = (formData.get("phone") as string) || null;
  const specialization = (formData.get("specialization") as string) || null;
  const bio = (formData.get("bio") as string) || null;

  const [{ error: profileError }, { error: trainerError }] = await Promise.all([
    adminClient.from("profiles").update({ full_name: fullName, phone }).eq("id", profileId),
    adminClient.from("gym_trainers").update({ specialization, bio }).eq("id", gymTrainerId),
  ]);

  if (profileError) return { error: profileError.message };
  if (trainerError) return { error: trainerError.message };

  revalidatePath("/gym-admin/trainers");
  return { success: true };
}

export async function removeTrainer(gymTrainerId: string, profileId: string) {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("gym_trainers")
    .delete()
    .eq("id", gymTrainerId);

  if (error) return { error: error.message };

  await adminClient
    .from("profiles")
    .update({ gym_id: null, role: "member" })
    .eq("id", profileId);

  revalidatePath("/gym-admin/trainers");
  return { success: true };
}
