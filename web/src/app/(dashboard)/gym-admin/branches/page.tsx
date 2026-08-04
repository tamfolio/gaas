import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BranchesClient } from "./branches-client";

export default async function BranchesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("gym_id").eq("id", user.id).single();

  const gymId = profile?.gym_id;
  if (!gymId) redirect("/gym-admin");

  const { data: gym } = await supabase
    .from("gyms").select("has_branches").eq("id", gymId).single();

  if (!gym?.has_branches) redirect("/gym-admin/settings");

  const { data: branches, count } = await supabase
    .from("branches")
    .select("id, name, address, phone, is_active, created_at", { count: "exact" })
    .eq("gym_id", gymId)
    .order("created_at", { ascending: true });

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "1024px" }}>
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
            Locations
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
            Branches
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
        <BranchesClient branches={branches ?? []} showAddOnly />
      </div>

      {!branches || branches.length === 0 ? (
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
            No branches yet
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
            Add your first branch to start managing locations.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BranchesClient branches={[]} showAddOnly />
          </div>
        </div>
      ) : (
        <BranchesClient branches={branches} />
      )}
    </div>
  );
}
