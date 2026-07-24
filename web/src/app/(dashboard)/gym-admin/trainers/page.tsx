import { createClient } from "@/lib/supabase/server";
import { AddTrainerSheet } from "@/components/add-trainer-sheet";

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
      "id, specialization, bio, created_at, profiles:profile_id(full_name, email, phone)",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {trainers.map((t) => {
            const p = t.profiles as unknown as { full_name: string; email: string; phone: string | null } | null;
            const initials = (p?.full_name ?? "")
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={t.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "color-mix(in oklch, var(--primary) 14%, var(--muted))",
                      border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      flexShrink: 0,
                    }}
                  >
                    {initials || "?"}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "var(--foreground)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {p?.full_name ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginTop: "0.1rem" }}>
                      {p?.email}
                    </div>
                  </div>
                </div>

                {t.specialization && (
                  <div style={{ marginBottom: "0.625rem" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--primary)",
                        background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                        border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "100px",
                      }}
                    >
                      {t.specialization}
                    </span>
                  </div>
                )}

                {t.bio && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      lineHeight: 1.55,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {t.bio}
                  </p>
                )}

                <div
                  style={{
                    marginTop: "0.875rem",
                    paddingTop: "0.875rem",
                    borderTop: "1px solid var(--border)",
                    fontSize: "0.72rem",
                    color: "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    Added{" "}
                    {new Date(t.created_at).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {p?.phone && <span>{p.phone}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
