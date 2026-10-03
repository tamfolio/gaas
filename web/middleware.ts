import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const xfh = request.headers.get("x-forwarded-host") ?? "";
  const host = request.headers.get("host") ?? "";
  const nextHostname = request.nextUrl.hostname;
  const hostname = (xfh || host || nextHostname).split(":")[0];
  const pathname = request.nextUrl.pathname;

  // gym.engineroom.com.ng → redirect root to /login
  if (hostname.startsWith("gym.") && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = await updateSession(request);
  // Temporary debug header — remove after confirming hostname detection works
  response.headers.set("x-debug-xfh", xfh);
  response.headers.set("x-debug-host", host);
  response.headers.set("x-debug-next-hostname", nextHostname);
  response.headers.set("x-debug-resolved", hostname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
