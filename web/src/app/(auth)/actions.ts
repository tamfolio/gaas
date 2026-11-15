"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendMail, buildPasswordResetEmail, createAuthEmailLink } from "@/lib/email";

const RESET_EMAIL_COOLDOWN_MS = 60_000;

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
    case "platform_admin":
    case "platform_staff":
      redirect("/super-admin");
    case "gym_admin":
    case "second_admin":
    case "front_desk":
    case "accountant":
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

  // Create the gym in pending state — must be approved by a platform admin before access is granted
  const { data: gym, error: gymError } = await adminClient
    .from("gyms")
    .insert({
      name: gymName,
      email: gymEmail,
      phone: gymPhone,
      address: gymAddress,
      subscription_status: "pending",
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
  return { pending: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };

  // Always report success so this form can't be used to discover which emails have accounts.
  try {
    const adminClient = createAdminClient();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, full_name")
      .eq("email", email)
      .maybeSingle();
    if (!profile) return { success: true };

    // Throttle: at most one reset email per address per minute.
    const { data: authUser } = await adminClient.auth.admin.getUserById(profile.id);
    const appMeta = (authUser?.user?.app_metadata ?? {}) as Record<string, unknown>;
    const lastSent = Date.parse(String(appMeta.last_reset_email_at ?? ""));
    if (!Number.isNaN(lastSent) && Date.now() - lastSent < RESET_EMAIL_COOLDOWN_MS) {
      return { success: true };
    }

    const link = await createAuthEmailLink({ type: "recovery", email, next: "/reset-password" });
    if ("error" in link) {
      console.error("[forgotPassword] link generation failed", link.error);
      return { success: true };
    }

    await sendMail({
      to: email,
      subject: "Reset your EngineRoom password",
      html: buildPasswordResetEmail({ name: profile.full_name, resetUrl: link.url }),
    });

    await adminClient.auth.admin.updateUserById(profile.id, {
      app_metadata: { ...appMeta, last_reset_email_at: new Date().toISOString() },
    });
  } catch (err) {
    console.error("[forgotPassword] failed", err);
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
  return { success: true };
}
