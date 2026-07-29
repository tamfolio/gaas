import { createClient } from "@/lib/supabase/server";
import { AddTrainerSheet } from "@/components/add-trainer-sheet";
import { TrainersClient } from "./trainers-client";
import type { TrainerRow } from "./trainers-client";

export default async function TrainersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const gymId = profile!.gym_id!;

  const { data: trainers, count } = await supabase
    .from("gym_trainers")
    .select(
      "id, profile_id, specialization, bio, created_at, profiles:profile_id(full_name, email, phone)",
      { count: "exact" }
    )
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "1024px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
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
            Staff
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
            Trainers
            {count !== null && count > 0 && (
              <span
                style={{
                  marginLeft: "0.625rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0",
                }}
              >
                {count}
              </span>
            )}
          </h1>
        </div>
        <AddTrainerSheet gymId={gymId} />
      </div>

      {/* Grid or empty */}
      {!trainers || trainers.length === 0 ? (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "4rem 1.25rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>◈</div>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--foreground)",
              marginBottom: "0.375rem",
            }}
          >
            No trainers yet
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
            Click <strong>+ Add trainer</strong> to register your first trainer.
          </p>
        </div>
      ) : (
        <TrainersClient trainers={trainers as unknown as TrainerRow[]} />
      )}
    </div>
  );
}
