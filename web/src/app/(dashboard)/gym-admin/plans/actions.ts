"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

async function getAdminGymId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  return profile?.gym_id ?? null;
}

export async function createPlan(formData: FormData) {
  const gymId = await getAdminGymId();
  if (!gymId) return { error: "Not authenticated" };

  const adminClient = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const price = parseFloat(formData.get("price") as string);
  const duration_days = parseInt(formData.get("duration_days") as string, 10);
  const branch_access = (formData.get("branch_access") as string) || "all";
  const branch_ids = formData.getAll("branch_ids") as string[];

  if (!name || isNaN(price) || price < 0 || isNaN(duration_days) || duration_days < 1) {
    return { error: "Name, price, and duration are required." };
  }

  const { data: plan, error } = await adminClient
    .from("membership_plans")
    .insert({ gym_id: gymId, name, description, price, duration_days, is_active: true, branch_access })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (branch_access === "specific" && branch_ids.length > 0) {
    await adminClient.from("plan_branch_access").insert(
      branch_ids.map((bid) => ({ plan_id: plan.id, branch_id: bid }))
    );
  }

  revalidatePath("/gym-admin/plans");
  revalidatePath("/gym-admin/members");
  return { success: true };
}

export async function updatePlan(planId: string, formData: FormData) {
  const gymId = await getAdminGymId();
  if (!gymId) return { error: "Not authenticated" };

  const adminClient = createAdminClient();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const price = parseFloat(formData.get("price") as string);
  const duration_days = parseInt(formData.get("duration_days") as string, 10);
  const branch_access = (formData.get("branch_access") as string) || "all";
  const branch_ids = formData.getAll("branch_ids") as string[];

  if (!name || isNaN(price) || price < 0 || isNaN(duration_days) || duration_days < 1) {
    return { error: "Name, price, and duration are required." };
  }

  const { error } = await adminClient
    .from("membership_plans")
    .update({ name, description, price, duration_days, branch_access })
    .eq("id", planId)
    .eq("gym_id", gymId);

  if (error) return { error: error.message };

  // Replace branch access rows
  await adminClient.from("plan_branch_access").delete().eq("plan_id", planId);
  if (branch_access === "specific" && branch_ids.length > 0) {
    await adminClient.from("plan_branch_access").insert(
      branch_ids.map((bid) => ({ plan_id: planId, branch_id: bid }))
    );
  }

  revalidatePath("/gym-admin/plans");
  revalidatePath("/gym-admin/members");
  return { success: true };
}

export async function togglePlanStatus(planId: string, isActive: boolean): Promise<void> {
  const gymId = await getAdminGymId();
  if (!gymId) return;

  const adminClient = createAdminClient();
  await adminClient
    .from("membership_plans")
    .update({ is_active: !isActive })
    .eq("id", planId)
    .eq("gym_id", gymId);

  revalidatePath("/gym-admin/plans");
}
