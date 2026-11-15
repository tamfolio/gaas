import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { signAuthLink } from "@/lib/auth-link-token";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

/** How long the confirmation page treats a link as valid (Supabase enforces its own expiry too). */
const LINK_TTL_MS = {
  invite: 24 * 60 * 60 * 1000,
  recovery: 60 * 60 * 1000,
} as const;

type AuthLinkResult = { url: string; user: User } | { error: string };

/**
 * Creates a Supabase invite / password-recovery link WITHOUT Supabase sending an email,
 * so we can deliver it through our own email module.
 *
 * The link opens our `/auth/confirm` page, which shows a signed "Continue as <name>"
 * prompt; the one-time token is only redeemed (verifyOtp) when the person clicks Continue.
 * That stops login-CSRF (being tricked into someone else's account) and stops email link
 * scanners from burning the one-time token.
 *
 * - `invite` creates the auth user if it doesn't exist (same as inviteUserByEmail).
 * - `recovery` errors if no user has that email.
 */
export async function createAuthEmailLink(
  params:
    | { type: "invite"; email: string; name?: string | null; next: string; data?: Record<string, unknown> }
    | { type: "recovery"; email: string; name?: string | null; next: string },
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

  const token = signAuthLink({
    h: data.properties.hashed_token,
    type: params.type,
    email: data.user.email ?? params.email,
    name: params.name ?? null,
    next: params.next,
    exp: Date.now() + LINK_TTL_MS[params.type],
  });

  const url = new URL("/auth/confirm", SITE_URL);
  url.searchParams.set("t", token);

  return { url: url.toString(), user: data.user };
}
