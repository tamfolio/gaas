import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GymAdminSidebar } from "@/components/gym-admin-sidebar";

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

  if (!profile || profile.role !== "gym_admin") redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("name")
    .eq("id", profile.gym_id)
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
