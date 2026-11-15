import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { createAuthEmailLink } from "./auth-links";
import { sendMail } from "./sendMail";
import { buildInviteEmail } from "./templates";

/**
 * Creates the invited auth user and emails them an accept link through our own
 * email module (replaces supabase.auth.admin.inviteUserByEmail).
 * If the email can't be sent, the just-created user is deleted so the invite can be retried.
 */
export async function sendAccountInvite({
  email,
  fullName,
  role,
  roleLabel,
  next,
  gymName,
  inviterName,
}: {
  email: string;
  fullName: string;
  role: string;
  roleLabel: string;
  /** Path to land on after accepting, e.g. "/trainer" */
  next: string;
  gymName?: string;
  inviterName?: string;
}): Promise<{ user: User } | { error: string }> {
  const link = await createAuthEmailLink({
    type: "invite",
    email,
    next,
    data: { full_name: fullName, role },
  });
  if ("error" in link) return { error: link.error };

  try {
    await sendMail({
      to: email,
      subject: gymName
        ? `You're invited to join ${gymName} on EngineRoom`
        : "You're invited to EngineRoom",
      html: buildInviteEmail({
        inviteeName: fullName,
        roleLabel,
        gymName,
        inviterName,
        acceptUrl: link.url,
      }),
    });
  } catch (err) {
    console.error("[invite] email send failed", err);
    await createAdminClient().auth.admin.deleteUser(link.user.id).catch(() => null);
    return { error: "Couldn't send the invite email. Please try again." };
  }

  return { user: link.user };
}
