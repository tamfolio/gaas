import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TrainerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, gym_id")
    .eq("id", user.id)
    .single();

  if (!profile?.gym_id) redirect("/login");

  const [{ data: trainerRecord }, { data: gym }] = await Promise.all([
    supabase
      .from("gym_trainers")
      .select("id, specialization")
      .eq("gym_id", profile.gym_id)
      .eq("profile_id", user.id)
      .single(),
    supabase.from("gyms").select("name").eq("id", profile.gym_id).single(),
  ]);

  const { count: memberCount } = trainerRecord
    ? await supabase
        .from("workout_plans")
        .select("*", { count: "exact", head: true })
        .eq("trainer_id", trainerRecord.id)
        .eq("status", "active")
    : { count: 0 };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{
          fontSize: "0.8rem",
          color: "var(--muted-foreground)",
          marginBottom: "0.25rem",
          fontWeight: 500,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}>
          Trainer Dashboard
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--foreground)",
            lineHeight: 1.1,
          }}
        >
          {profile.full_name ?? user.email}
        </h1>
        {gym?.name && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
            {gym.name}
            {trainerRecord?.specialization && ` · ${trainerRecord.specialization}`}
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            background: "var(--primary)",
            borderRadius: "0.75rem",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "2.25rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--brand-dark-fg)",
              lineHeight: 1,
              marginBottom: "0.375rem",
            }}
          >
            {memberCount ?? 0}
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
            Active workout plans
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
          }}
        >
          Tools
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {[
          { icon: "◉", title: "My Members", description: "View and manage members assigned to you." },
          { icon: "◆", title: "Workout Plans", description: "Create and manage workout plans. Generate with AI." },
          { icon: "◐", title: "Check-in Log", description: "See today's check-ins for your members." },
          { icon: "◑", title: "BMI Tracker", description: "Record and track member body measurements." },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              opacity: 0.6,
            }}
          >
            <div style={{ fontSize: "1.25rem", color: "var(--muted-foreground)", marginBottom: "0.75rem", lineHeight: 1 }}>
              {item.icon}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                {item.title}
              </h3>
              <span style={{
                fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "var(--muted-foreground)",
                background: "var(--muted)", padding: "0.1rem 0.4rem",
                borderRadius: "100px", border: "1px solid var(--border)",
              }}>
                Soon
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
