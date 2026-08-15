"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resend, FROM_EMAIL, buildStaffApprovalRequestEmail } from "@/lib/resend";
import { requiresOwnerApproval } from "@/lib/permissions";
import type { GymStaffRole } from "@/lib/permissions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function inviteStaff(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: inviter } = await supabase
    .from("profiles")
    .select("id, full_name, role, gym_id")
    .eq("id", user.id)
    .single();

  if (!inviter?.gym_id) return { error: "No gym associated with your account" };
  if (!["gym_admin", "second_admin"].includes(inviter.role)) return { error: "Insufficient permissions" };

  const email     = (formData.get("email") as string).trim().toLowerCase();
  const fullName  = (formData.get("full_name") as string).trim();
  const role      = formData.get("role") as GymStaffRole;

  if (!["second_admin", "front_desk", "accountant"].includes(role)) {
    return { error: "Invalid role" };
  }

  // Check for duplicate pending invite
  const { data: existingInvite } = await adminClient
    .from("gym_staff_invites")
    .select("id")
    .eq("gym_id", inviter.gym_id)
    .eq("email", email)
    .single();

  if (existingInvite) return { error: "An invite for this email is already pending" };

  // Check if they're already staff here
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id, role")
    .eq("gym_id", inviter.gym_id)
    .eq("email", email)
    .single();

  if (existingProfile) return { error: "This person is already part of your team" };

  const needsApproval = requiresOwnerApproval(inviter.role, role);

  if (needsApproval) {
    // Store invite as pending_owner_approval
    const { error: insertError } = await adminClient
      .from("gym_staff_invites")
      .insert({
        gym_id:     inviter.gym_id,
        email,
        full_name:  fullName,
        role,
        invited_by: inviter.id,
        status:     "pending_owner_approval",
      });

    if (insertError) return { error: insertError.message };

    // Find gym owner
    const { data: owner } = await adminClient
      .from("profiles")
      .select("id, full_name, email")
      .eq("gym_id", inviter.gym_id)
      .eq("role", "gym_admin")
      .single();

    // Get gym name
    const { data: gym } = await adminClient
      .from("gyms")
      .select("name")
      .eq("id", inviter.gym_id)
      .single();

    if (owner) {
      // In-app notification
      await adminClient.from("notifications").insert({
        gym_id:     inviter.gym_id,
        profile_id: owner.id,
        title:      "Staff approval required",
        body:       `${inviter.full_name ?? "A second admin"} invited ${fullName} as Second Admin — tap to review.`,
        type:       "staff_invite",
      });

      // Email notification
      if (owner.email) {
        await resend.emails.send({
          from:    FROM_EMAIL,
          to:      owner.email,
          subject: `Staff Approval Required — ${fullName} invited as Second Admin`,
          html:    buildStaffApprovalRequestEmail({
            gymName:      gym?.name ?? "Your Gym",
            ownerName:    owner.full_name ?? "there",
            inviterName:  inviter.full_name ?? "A team member",
            inviteeName:  fullName,
            inviteeEmail: email,
            teamUrl:      `${SITE_URL}/gym-admin/team`,
          }),
        });
      }
    }

    revalidatePath("/gym-admin/team");
    return { success: true, pendingApproval: true };
  }

  // Direct invite — send Supabase magic link
  const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data:       { full_name: fullName, role },
      redirectTo: `${SITE_URL}/auth/callback?next=/gym-admin`,
    }
  );

  if (authError) return { error: authError.message };

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ full_name: fullName, gym_id: inviter.gym_id, role })
    .eq("id", authData.user.id);

  if (profileError) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/gym-admin/team");
  return { success: true, pendingApproval: false };
}

export async function approveInvite(inviteId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, gym_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "gym_admin") return { error: "Only the gym owner can approve invites" };

  const { data: invite } = await adminClient
    .from("gym_staff_invites")
    .select("*")
    .eq("id", inviteId)
    .eq("gym_id", profile.gym_id)
    .single();

  if (!invite) return { error: "Invite not found" };

  const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(
    invite.email,
    {
      data:       { full_name: invite.full_name, role: invite.role },
      redirectTo: `${SITE_URL}/auth/callback?next=/gym-admin`,
    }
  );

  if (authError) return { error: authError.message };

  await adminClient
    .from("profiles")
    .update({ full_name: invite.full_name, gym_id: invite.gym_id, role: invite.role })
    .eq("id", authData.user.id);

  await adminClient.from("gym_staff_invites").delete().eq("id", inviteId);

  revalidatePath("/gym-admin/team");
  return { success: true };
}

export async function declineInvite(inviteId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, gym_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "gym_admin") return { error: "Only the gym owner can decline invites" };

  await adminClient
    .from("gym_staff_invites")
    .delete()
    .eq("id", inviteId)
    .eq("gym_id", profile.gym_id);

  revalidatePath("/gym-admin/team");
  return { success: true };
}

export async function removeStaff(staffProfileId: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: remover } = await supabase
    .from("profiles")
    .select("role, gym_id")
    .eq("id", user.id)
    .single();

  if (!["gym_admin", "second_admin"].includes(remover?.role ?? "")) {
    return { error: "Insufficient permissions" };
  }

  const { data: target } = await adminClient
    .from("profiles")
    .select("role, gym_id")
    .eq("id", staffProfileId)
    .single();

  if (!target || target.gym_id !== remover?.gym_id) {
    return { error: "Staff member not found in your gym" };
  }

  // second_admin can only remove front_desk and accountant
  if (remover?.role === "second_admin" && target.role === "second_admin") {
    return { error: "Only the gym owner can remove a Second Admin" };
  }

  // Detach from gym, reset to member
  await adminClient
    .from("profiles")
    .update({ gym_id: null, role: "member" })
    .eq("id", staffProfileId);

  revalidatePath("/gym-admin/team");
  return { success: true };
}
