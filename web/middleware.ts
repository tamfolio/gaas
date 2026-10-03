import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const hostname = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  ).split(":")[0];
  const pathname = request.nextUrl.pathname;

  // gym.engineroom.com.ng → redirect root to /login
  if (hostname.startsWith("gym.") && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
