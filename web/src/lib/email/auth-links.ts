import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

type AuthLinkResult = { url: string; user: User } | { error: string };

/**
 * Creates a Supabase invite / password-recovery link WITHOUT Supabase sending an email,
 * so we can deliver it through our own email module.
 *
 * The link points at our `/auth/confirm` route, which verifies the one-time token
 * server-side (verifyOtp) and sets the session cookie before redirecting to `next`.
 *
 * - `invite` creates the auth user if it doesn't exist (same as inviteUserByEmail).
 * - `recovery` errors if no user has that email.
 */
export async function createAuthEmailLink(
  params:
    | { type: "invite"; email: string; next: string; data?: Record<string, unknown> }
    | { type: "recovery"; email: string; next: string },
): Promise<AuthLinkResult> {
  const admin = createAdminClient();

  const { data, error } =
    params.type === "invite"
      ? await admin.auth.admin.generateLink({
          type: "invite",
          email: params.email,
          options: { data: params.data },
        })
      : await admin.auth.admin.generateLink({ type: "recovery", email: params.email });

  if (error || !data?.properties?.hashed_token || !data.user) {
    return { error: error?.message ?? "Could not create sign-in link" };
  }

  const url = new URL("/auth/confirm", SITE_URL);
  url.searchParams.set("token_hash", data.properties.hashed_token);
  url.searchParams.set("type", params.type);
  url.searchParams.set("next", params.next);

  return { url: url.toString(), user: data.user };
}
