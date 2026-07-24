"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { resend, FROM_EMAIL, buildWelcomeMemberEmail } from "@/lib/resend";

function generateBarcode() {
  return `ER${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;
}

// Avoids visually ambiguous characters (0/O, 1/l/I)
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function addMember(formData: FormData) {
  const adminClient = createAdminClient();

  const gymId = formData.get("gym_id") as string;
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const planId = (formData.get("membership_plan_id") as string) || null;
  const startDate =
    (formData.get("start_date") as string) ||
    new Date().toISOString().split("T")[0];

  const paymentMethod = (formData.get("payment_method") as string) || "none";
  const paymentAmount = parseFloat(formData.get("payment_amount") as string) || 0;
  const paymentReference = (formData.get("payment_reference") as string) || null;

  const paid = paymentMethod !== "none" && paymentAmount > 0;
  const memberStatus = paid ? "active" : "pending";

  const tempPassword = generateTempPassword();

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "member", must_change_password: true },
    });

  if (authError) return { error: authError.message };

  const userId = authData.user.id;

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ gym_id: gymId, role: "member", phone })
    .eq("id", userId);

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  let endDate: string | null = null;
  let planName = "Standard";

  if (planId) {
    const { data: plan } = await adminClient
      .from("membership_plans")
      .select("duration_days, name")
      .eq("id", planId)
      .single();
    if (plan) {
      planName = plan.name;
      // Only set end date if the member has paid — pending members don't start the clock yet
      if (paid) {
        const end = new Date(startDate);
        end.setDate(end.getDate() + plan.duration_days);
        endDate = end.toISOString().split("T")[0];
      }
    }
  }

  const { data: memberData, error: memberError } = await adminClient
    .from("gym_members")
    .insert({
      gym_id: gymId,
      profile_id: userId,
      membership_plan_id: planId,
      status: memberStatus,
      barcode_code: generateBarcode(),
      start_date: paid ? startDate : null,
      end_date: endDate,
    })
    .select("id")
    .single();

  if (memberError) {
    await adminClient.auth.admin.deleteUser(userId);
    return { error: memberError.message };
  }

  // Record payment if one was made
  if (paid && planId) {
    await adminClient.from("payments").insert({
      gym_id: gymId,
      gym_member_id: memberData.id,
      amount: paymentAmount,
      currency: "NGN",
      status: "paid",
      paystack_reference: paymentReference,
      description: `${planName} membership`,
      paid_at: startDate,
    });
  }

  // Send welcome email — best-effort, don't fail the whole action if email fails
  const { data: gym } = await adminClient
    .from("gyms")
    .select("name")
    .eq("id", gymId)
    .single();

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: `Welcome to ${gym?.name ?? "your gym"} — your EngineRoom login details`,
    html: buildWelcomeMemberEmail({
      gymName: gym?.name ?? "your gym",
      memberName: fullName,
      email,
      tempPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
    }),
  });

  revalidatePath("/gym-admin/members");
  return { success: true };
}

export async function addTrainer(formData: FormData) {
  const adminClient = createAdminClient();

  const gymId = formData.get("gym_id") as string;
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const password = formData.get("password") as string;
  const specialization = (formData.get("specialization") as string) || null;
  const bio = (formData.get("bio") as string) || null;

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "trainer" },
    });

  if (authError) return { error: authError.message };

  const userId = authData.user.id;

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ gym_id: gymId, role: "trainer", phone })
    .eq("id", userId);

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);
    return { error: profileError.message };
  }

  const { error: trainerError } = await adminClient
    .from("gym_trainers")
    .insert({
      gym_id: gymId,
      profile_id: userId,
      specialization,
      bio,
    });

  if (trainerError) {
    await adminClient.auth.admin.deleteUser(userId);
    return { error: trainerError.message };
  }

  revalidatePath("/gym-admin/trainers");
  return { success: true };
}
