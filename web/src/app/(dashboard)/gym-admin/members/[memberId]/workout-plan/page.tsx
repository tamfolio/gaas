import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WORKOUT_PLAN_ADMIN_ROLES } from "@/lib/workout-plans";
import { PlanBuilder } from "@/components/workout/plan-builder";
import { adminAssignWorkoutPlan } from "./actions";

export default async function AdminWorkoutPlanPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.gym_id) redirect("/login");
  if (!(WORKOUT_PLAN_ADMIN_ROLES as readonly string[]).includes(profile.role)) {
    redirect("/gym-admin/members");
  }

  const { data: member } = await supabase
    .from("gym_members")
    .select("id, profiles:profile_id(full_name), gym_trainers:trainer_id(profiles:profile_id(full_name))")
    .eq("id", memberId)
    .eq("gym_id", profile.gym_id)
    .single();
  if (!member) notFound();

  const { data: activePlan } = await supabase
    .from("workout_plans")
    .select("title")
    .eq("gym_member_id", memberId)
    .eq("status", "active")
    .maybeSingle();

  const memberName =
    (member.profiles as unknown as { full_name: string } | null)?.full_name ?? "Member";
  const trainerName = (
    member.gym_trainers as unknown as { profiles: { full_name: string } | null } | null
  )?.profiles?.full_name;

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "720px" }}>
      <Link
        href="/gym-admin/members"
        style={{
          fontSize: "0.8rem",
          color: "var(--muted-foreground)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          marginBottom: "1.5rem",
        }}
      >
        ← Back to members
      </Link>

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
          Members
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
          Assign Workout Plan
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginTop: "0.375rem" }}>
          For {memberName}
          {trainerName ? ` · Trainer: ${trainerName}` : " · No trainer assigned"}
        </p>
      </div>

      {activePlan && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid color-mix(in oklch, oklch(0.75 0.15 75) 45%, transparent)",
            background: "color-mix(in oklch, oklch(0.75 0.15 75) 12%, transparent)",
            fontSize: "0.8rem",
            color: "var(--foreground)",
            lineHeight: 1.5,
          }}
        >
          {memberName.split(" ")[0]} already has an active plan, <strong>{activePlan.title}</strong>.
          Saving a new plan will archive it
          {trainerName ? ` — consider checking with ${trainerName} first.` : "."}
        </div>
      )}

      <PlanBuilder
        memberId={memberId}
        memberName={memberName}
        saveAction={adminAssignWorkoutPlan}
        doneHref="/gym-admin/members"
      />
    </div>
  );
}
