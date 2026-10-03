import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-mw", "1");
  response.headers.set("x-mw-path", request.nextUrl.pathname);
  response.headers.set("x-mw-host", request.headers.get("host") ?? "none");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
