import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminSidebar } from "@/components/super-admin-sidebar";
import type { UserRole } from "@/types";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const PLATFORM_ROLES = ["platform_admin", "platform_staff"];
  if (!profile || !PLATFORM_ROLES.includes(profile.role)) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-jakarta)" }}>
      <SuperAdminSidebar
        adminName={profile.full_name ?? user.email ?? "Admin"}
        userRole={profile.role as UserRole}
      />
      <main
        id="super-admin-main"
        style={{
          flex: 1,
          background: "var(--muted)",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
