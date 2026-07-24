import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { WorkoutPlanData } from "@/types";

export default async function WorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  if (!profile?.gym_id) redirect("/login");

  const { data: member } = await supabase
    .from("gym_members")
    .select("id")
    .eq("profile_id", user.id)
    .eq("gym_id", profile.gym_id)
    .single();

  const { data: plan } = member
    ? await supabase
        .from("workout_plans")
        .select("id, title, plan_data, status, ai_generated, created_at")
        .eq("gym_member_id", member.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "760px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <p
          style={{
            fontSize: "0.68rem",
            color: "var(--muted-foreground)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "0.2rem",
          }}
        >
          Member
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
          Workout Plan
        </h1>
      </div>

      {!plan ? (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
              opacity: 0.25,
              lineHeight: 1,
            }}
          >
            ◆
          </div>
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
              marginBottom: "0.5rem",
            }}
          >
            No active workout plan yet
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted-foreground)",
              maxWidth: "360px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Your trainer will assign an AI-generated workout plan tailored to your goals.
            Check back after your first session.
          </p>
        </div>
      ) : (
        <>
          {/* Plan header */}
          <div
            style={{
              background: "var(--brand-dark)",
              borderRadius: "0.875rem",
              padding: "1.5rem 1.75rem",
              marginBottom: "1.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "180px",
                height: "180px",
                background: "radial-gradient(circle, rgba(232,70,10,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      marginBottom: "0.375rem",
                    }}
                  >
                    Active Plan
                  </p>
                  <h2
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.03em",
                      lineHeight: 1.1,
                    }}
                  >
                    {plan.title}
                  </h2>
                  {(plan.plan_data as WorkoutPlanData)?.goal && (
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginTop: "0.375rem" }}>
                      Goal: {(plan.plan_data as WorkoutPlanData).goal}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {plan.ai_generated && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--primary)",
                        background: "rgba(232,70,10,0.15)",
                        border: "1px solid rgba(232,70,10,0.3)",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "100px",
                      }}
                    >
                      AI Generated
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Weeks */}
          {(plan.plan_data as WorkoutPlanData)?.weeks?.map((week) => (
            <div
              key={week.week}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.875rem 1.25rem",
                  borderBottom: "1px solid var(--border)",
                  background: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  style={{
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.625rem",
                    borderRadius: "100px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Week {week.week}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                  {week.days?.length ?? 0} training days
                </span>
              </div>

              {week.days?.map((day, di) => (
                <div
                  key={day.day}
                  style={{
                    padding: "1.125rem 1.25rem",
                    borderBottom: di < (week.days?.length ?? 0) - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "var(--foreground)",
                      letterSpacing: "-0.01em",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {day.day}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {day.exercises?.map((ex, ei) => (
                      <div
                        key={ei}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "0.625rem 0.875rem",
                          background: "var(--muted)",
                          borderRadius: "0.5rem",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "var(--foreground)",
                            }}
                          >
                            {ex.name}
                          </span>
                          {ex.notes && (
                            <span
                              style={{
                                marginLeft: "0.5rem",
                                fontSize: "0.75rem",
                                color: "var(--muted-foreground)",
                              }}
                            >
                              — {ex.notes}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: "var(--primary)",
                              background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                              border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "100px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ex.sets}×{ex.reps}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 500,
                              color: "var(--muted-foreground)",
                              background: "var(--background)",
                              border: "1px solid var(--border)",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "100px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ex.rest_seconds}s rest
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
