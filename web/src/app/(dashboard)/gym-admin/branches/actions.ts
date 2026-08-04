"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";

async function getAdminGymId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("gym_id").eq("id", user.id).single();
  return profile?.gym_id ?? null;
}

export async function createBranch(formData: FormData) {
  const gymId = await getAdminGymId();
  if (!gymId) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name) return { error: "Branch name is required." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("branches").insert({ gym_id: gymId, name, address, phone });

  if (error) return { error: error.message };
  revalidatePath("/gym-admin/branches");
  return { success: true };
}

export async function updateBranch(branchId: string, formData: FormData) {
  const gymId = await getAdminGymId();
  if (!gymId) return { error: "Not authenticated" };

  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name) return { error: "Branch name is required." };

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("branches")
    .update({ name, address, phone })
    .eq("id", branchId)
    .eq("gym_id", gymId);

  if (error) return { error: error.message };
  revalidatePath("/gym-admin/branches");
  return { success: true };
}

export async function toggleBranchStatus(branchId: string, isActive: boolean): Promise<void> {
  const gymId = await getAdminGymId();
  if (!gymId) return;

  const adminClient = createAdminClient();
  await adminClient
    .from("branches")
    .update({ is_active: !isActive })
    .eq("id", branchId)
    .eq("gym_id", gymId);

  revalidatePath("/gym-admin/branches");
}
