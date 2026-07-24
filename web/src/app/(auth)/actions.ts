"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Login failed" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  revalidatePath("/", "layout");

  switch (profile?.role) {
    case "gym_admin":
      redirect("/gym-admin");
    case "trainer":
      redirect("/trainer");
    case "member":
      redirect("/member");
    default:
      redirect("/");
  }
}

export async function registerGym(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const gymName = formData.get("gym_name") as string;
  const gymEmail = formData.get("gym_email") as string;
  const gymPhone = formData.get("gym_phone") as string;
  const gymAddress = formData.get("gym_address") as string;
  const adminName = formData.get("admin_name") as string;
  const adminEmail = formData.get("admin_email") as string;
  const password = formData.get("password") as string;

  // Create the gym first
  const { data: gym, error: gymError } = await adminClient
    .from("gyms")
    .insert({
      name: gymName,
      email: gymEmail,
      phone: gymPhone,
      address: gymAddress,
    })
    .select()
    .single();

  if (gymError) return { error: gymError.message };

  // Create the admin user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminEmail,
    password,
    options: {
      data: {
        full_name: adminName,
        role: "gym_admin",
      },
    },
  });

  if (authError) {
    // Rollback gym creation
    await adminClient.from("gyms").delete().eq("id", gym.id);
    return { error: authError.message };
  }

  if (!authData.user) return { error: "Account creation failed" };

  // Link the admin profile to the gym
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ gym_id: gym.id, role: "gym_admin" })
    .eq("id", authData.user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/", "layout");
  redirect("/gym-admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
  return { success: true };
}
