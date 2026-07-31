import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlanBuilder } from "./plan-builder";

export default async function AssignPlanPage({
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

  const { data: authProfile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  if (!authProfile?.gym_id) redirect("/login");

  const { data: trainerRecord } = await supabase
    .from("gym_trainers")
    .select("id")
    .eq("gym_id", authProfile.gym_id)
    .eq("profile_id", user.id)
    .single();
  if (!trainerRecord) redirect("/login");

  const { data: member } = await supabase
    .from("gym_members")
    .select("id, profiles:profile_id(full_name)")
    .eq("id", memberId)
    .eq("trainer_id", trainerRecord.id)
    .single();

  if (!member) notFound();

  const profile = member.profiles as unknown as { full_name: string } | null;
  const memberName = profile?.full_name ?? "Member";

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "720px" }}>
      <Link
        href={`/trainer/members/${memberId}`}
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
        ← Back to {memberName}
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
          Trainer
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
        </p>
      </div>

      <PlanBuilder memberId={memberId} memberName={memberName} />
    </div>
  );
}
