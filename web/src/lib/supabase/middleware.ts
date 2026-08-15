import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedPaths = ["/gym-admin", "/trainer", "/member", "/super-admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isProtected) {
    const isSuperAdmin = pathname.startsWith("/super-admin");
    const isGymAdmin = pathname.startsWith("/gym-admin");

    if (isSuperAdmin || isGymAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, gym_id")
        .eq("id", user.id)
        .single();

      const PLATFORM_ROLES = ["platform_admin", "platform_staff"];
      const GYM_STAFF_ROLES = ["gym_admin", "second_admin", "front_desk", "accountant"];

      if (isSuperAdmin && !PLATFORM_ROLES.includes(profile?.role ?? "")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      if (isGymAdmin && GYM_STAFF_ROLES.includes(profile?.role ?? "") && profile?.gym_id) {
        const { data: gym } = await supabase
          .from("gyms")
          .select("subscription_status")
          .eq("id", profile.gym_id)
          .single();

        if (gym?.subscription_status === "pending") {
          const url = request.nextUrl.clone();
          url.pathname = "/pending";
          return NextResponse.redirect(url);
        }

        if (gym?.subscription_status === "suspended") {
          const url = request.nextUrl.clone();
          url.pathname = "/suspended";
          return NextResponse.redirect(url);
        }
      }

      if (isGymAdmin && !GYM_STAFF_ROLES.includes(profile?.role ?? "")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
