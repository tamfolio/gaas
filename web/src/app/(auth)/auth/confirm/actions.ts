"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyAuthLink } from "@/lib/auth-link-token";

/**
 * Redeems a signed invite / password-reset link. Runs only when the person clicks
 * "Continue" on /auth/confirm — never on page load — so link scanners can't consume it.
 */
export async function confirmAuthLink(formData: FormData) {
  const payload = verifyAuthLink(formData.get("t") as string | null);
  if (!payload) redirect("/login?error=link-expired");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: payload.type, token_hash: payload.h });
  if (error) redirect("/login?error=link-expired");

  redirect(payload.next);
}
