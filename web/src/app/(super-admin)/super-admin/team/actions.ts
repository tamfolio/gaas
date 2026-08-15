"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function invitePlatformStaff(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "platform_admin") return { error: "Only platform admins can invite staff" };

  const email    = (formData.get("email") as string).trim().toLowerCase();
  const fullName = (formData.get("full_name") as string).trim();

  // Check if already exists
  const { data: existing } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .single();

  if (existing) return { error: "This email already has a platform account" };

  const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data:       { full_name: fullName, role: "platform_staff" },
      redirectTo: `${SITE_URL}/auth/callback?next=/super-admin`,
    }
  );

  if (authError) return { error: authError.message };

  await adminClient
    .from("profiles")
    .update({ full_name: fullName, role: "platform_staff" })
    .eq("id", authData.user.id);

  revalidatePath("/super-admin/team");
  return { success: true };
}

export async function removePlatformStaff(staffProfileId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "platform_admin") return { error: "Only platform admins can remove staff" };

  const { data: target } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", staffProfileId)
    .single();

  if (target?.role !== "platform_staff") return { error: "Can only remove platform staff members" };

  await adminClient
    .from("profiles")
    .update({ role: "member" })
    .eq("id", staffProfileId);

  revalidatePath("/super-admin/team");
  return { success: true };
}
