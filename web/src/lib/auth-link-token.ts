import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed payload carried in the links we email for invites and password resets.
 *
 * The signature lets the /auth/confirm page show *whose* account the link signs into
 * before anything happens. Without it, an attacker could email someone a valid link to
 * the attacker's own account (login CSRF) and edit the displayed name/email to look like
 * the victim's. With it, a link can only ever display the identity it was issued for.
 */
export type AuthLinkType = "invite" | "recovery";

export type AuthLinkPayload = {
  /** Supabase hashed_token from generateLink */
  h: string;
  type: AuthLinkType;
  email: string;
  name: string | null;
  /** Same-site path to land on after verification */
  next: string;
  /** Expiry (ms since epoch) — display-side check; Supabase enforces its own token expiry */
  exp: number;
};

const VERSION = "v1";

/** Server-only signing key, derived from the service-role key with domain separation. */
function signingKey(): Buffer {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createHash("sha256").update(`engineroom:auth-link:${VERSION}:`).update(secret).digest();
}

function sign(data: string): string {
  return createHmac("sha256", signingKey()).update(data).digest("base64url");
}

export function signAuthLink(payload: AuthLinkPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${VERSION}.${body}.${sign(`${VERSION}.${body}`)}`;
}

/** Only allow same-site relative paths (blocks `//evil.com`, `/\evil.com`, absolute URLs). */
export function isSafeNext(next: unknown): next is string {
  return (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
  );
}

/** Returns the payload if the token is authentic, well-formed and unexpired; otherwise null. */
export function verifyAuthLink(token: string | null | undefined): AuthLinkPayload | null {
  if (!token || token.length > 4096) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== VERSION) return null;

  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`));
  const given = Buffer.from(parts[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  let payload: AuthLinkPayload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof payload?.h !== "string" ||
    (payload.type !== "invite" && payload.type !== "recovery") ||
    typeof payload.email !== "string" ||
    !isSafeNext(payload.next) ||
    typeof payload.exp !== "number" ||
    Date.now() > payload.exp
  ) {
    return null;
  }
  return payload;
}
