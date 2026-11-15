import { createAdminClient } from "@/lib/supabase/server";
import type { WorkoutPlanInput } from "@/components/workout/types";

/** Gym roles allowed to create/replace a member's workout plan from the admin dashboard. */
export const WORKOUT_PLAN_ADMIN_ROLES = ["gym_admin", "second_admin"] as const;

export type SaveWorkoutPlanResult = { success: true } | { error: string };

function validate(title: string, planData: WorkoutPlanInput): string | null {
  if (!title || title.length > 120) return "Plan title is required (max 120 characters).";
  if (!Array.isArray(planData?.weeks) || planData.weeks.length === 0) return "Plan has no weeks.";
  const days = planData.weeks.flatMap((w) => (Array.isArray(w?.days) ? w.days : []));
  if (days.length === 0) return "Add at least one training day.";
  if (days.some((d) => !Array.isArray(d?.exercises) || d.exercises.length === 0))
    return "Every training day needs at least one exercise.";
  return null;
}

/**
 * Archives the member's current active plan and inserts the new one.
 * Callers MUST authorise the user (role, gym, member ownership) before calling this —
 * it writes with the service-role client.
 */
export async function saveWorkoutPlan({
  gymId,
  memberId,
  trainerId,
  title,
  planData,
}: {
  gymId: string;
  memberId: string;
  trainerId: string | null;
  title: string;
  planData: WorkoutPlanInput;
}): Promise<SaveWorkoutPlanResult> {
  const invalid = validate(title, planData);
  if (invalid) return { error: invalid };

  const admin = createAdminClient();

  const { error: archiveError } = await admin
    .from("workout_plans")
    .update({ status: "archived" })
    .eq("gym_id", gymId)
    .eq("gym_member_id", memberId)
    .eq("status", "active");
  if (archiveError) return { error: archiveError.message };

  const { error } = await admin.from("workout_plans").insert({
    gym_id: gymId,
    gym_member_id: memberId,
    trainer_id: trainerId,
    title,
    plan_data: planData,
    status: "active",
    ai_generated: false,
  });
  if (error) return { error: error.message };

  return { success: true };
}
