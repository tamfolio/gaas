import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GymAdminSidebar } from "@/components/gym-admin-sidebar";
import type { UserRole } from "@/types";

export default async function GymAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, gym_id")
    .eq("id", user.id)
    .single();

  const GYM_STAFF_ROLES = ["gym_admin", "second_admin", "front_desk", "accountant"];
  if (!profile || !GYM_STAFF_ROLES.includes(profile.role) || !profile.gym_id) redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("name, has_branches")
    .eq("id", profile.gym_id!)
    .single();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <GymAdminSidebar
        userName={profile.full_name ?? user.email ?? ""}
        gymName={gym?.name ?? "Your Gym"}
        hasBranches={gym?.has_branches ?? false}
        userRole={profile.role as UserRole}
      />
      <main
        id="dash-main"
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
