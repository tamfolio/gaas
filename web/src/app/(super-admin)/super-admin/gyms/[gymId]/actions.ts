"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

async function setGymStatus(gymId: string, status: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("gyms")
    .update({ subscription_status: status })
    .eq("id", gymId);
  if (error) return { error: error.message };
  revalidatePath(`/super-admin/gyms/${gymId}`);
  revalidatePath("/super-admin/gyms");
  revalidatePath("/super-admin");
  return { success: true };
}

export async function approveGym(gymId: string) {
  return setGymStatus(gymId, "trial");
}

export async function suspendGym(gymId: string) {
  return setGymStatus(gymId, "suspended");
}

export async function reactivateGym(gymId: string) {
  return setGymStatus(gymId, "trial");
}

export async function rejectGym(gymId: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("gyms").delete().eq("id", gymId);
  if (error) return { error: error.message };
  revalidatePath("/super-admin/gyms");
  revalidatePath("/super-admin");
  return { deleted: true };
}
