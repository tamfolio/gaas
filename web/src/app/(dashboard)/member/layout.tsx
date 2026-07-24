import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemberSidebar } from "@/components/member-sidebar";

export default async function MemberLayout({
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

  if (!profile || profile.role !== "member") redirect("/login");

  if (user.user_metadata?.must_change_password === true) {
    redirect("/change-password");
  }

  const [{ data: gym }, { count: unreadCount }] = await Promise.all([
    supabase.from("gyms").select("name").eq("id", profile.gym_id).single(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("gym_id", profile.gym_id)
      .or(`profile_id.eq.${user.id},profile_id.is.null`)
      .eq("is_read", false),
  ]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <MemberSidebar
        userName={profile.full_name ?? user.email ?? ""}
        gymName={gym?.name ?? "Your Gym"}
        unreadCount={unreadCount ?? 0}
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
