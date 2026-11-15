"use server";

import { createClient } from "@/lib/supabase/server";
import { saveWorkoutPlan, WORKOUT_PLAN_ADMIN_ROLES } from "@/lib/workout-plans";
import type { SaveWorkoutPlanAction } from "@/components/workout/types";

export const adminAssignWorkoutPlan: SaveWorkoutPlanAction = async ({ memberId, title, planData }) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.gym_id) return { error: "Gym not found" };
  if (!(WORKOUT_PLAN_ADMIN_ROLES as readonly string[]).includes(profile.role)) {
    return { error: "Only the gym owner or a second admin can assign workout plans" };
  }

  // Member must belong to the admin's gym
  const { data: member } = await supabase
    .from("gym_members")
    .select("id")
    .eq("id", memberId)
    .eq("gym_id", profile.gym_id)
    .single();
  if (!member) return { error: "Member not found" };

  return saveWorkoutPlan({
    gymId: profile.gym_id,
    memberId,
    trainerId: null,
    title,
    planData,
  });
};
