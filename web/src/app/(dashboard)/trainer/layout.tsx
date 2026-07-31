import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrainerSidebar } from "@/components/trainer-sidebar";

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
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

  if (!profile || profile.role !== "trainer") redirect("/login");

  const { data: gym } = await supabase
    .from("gyms")
    .select("name")
    .eq("id", profile.gym_id)
    .single();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-jakarta)" }}>
      <TrainerSidebar
        userName={profile.full_name ?? user.email ?? ""}
        gymName={gym?.name ?? "Your Gym"}
      />
      <main
        id="dash-main"
        style={{ flex: 1, background: "var(--muted)", overflowY: "auto", minWidth: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
