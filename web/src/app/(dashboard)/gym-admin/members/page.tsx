import { createClient } from "@/lib/supabase/server";
import { AddMemberSheet } from "@/components/add-member-sheet";
import { MembersClient } from "./members-client";

export default async function MembersPage() {
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

  const [{ data: members, count }, { data: plans }] = await Promise.all([
    supabase
      .from("gym_members")
      .select(
        "id, status, start_date, end_date, created_at, barcode_code, profiles:profile_id(id, full_name, email, phone), membership_plans:membership_plan_id(id, name, price, duration_days)",
        { count: "exact" }
      )
      .eq("gym_id", gymId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("membership_plans")
      .select("id, name, price, duration_days")
      .eq("gym_id", gymId)
      .eq("is_active", true),
  ]);

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "1100px" }}>
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
            Gym Members
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
            Members
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
        <AddMemberSheet gymId={gymId} plans={plans ?? []} />
      </div>

      <MembersClient
        members={(members as any) ?? []}
        gymId={gymId}
        plans={plans ?? []}
      />
    </div>
  );
}
