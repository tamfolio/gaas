"use server";

import { createClient } from "@/lib/supabase/server";
import { saveWorkoutPlan } from "@/lib/workout-plans";
import type { SaveWorkoutPlanAction } from "@/components/workout/types";

export const assignWorkoutPlan: SaveWorkoutPlanAction = async ({ memberId, title, planData }) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: authProfile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  if (!authProfile?.gym_id) return { error: "Gym not found" };

  const { data: trainerRecord } = await supabase
    .from("gym_trainers")
    .select("id")
    .eq("gym_id", authProfile.gym_id)
    .eq("profile_id", user.id)
    .single();
  if (!trainerRecord) return { error: "Trainer record not found" };

  // Verify this member belongs to this trainer
  const { data: member } = await supabase
    .from("gym_members")
    .select("id")
    .eq("id", memberId)
    .eq("gym_id", authProfile.gym_id)
    .eq("trainer_id", trainerRecord.id)
    .single();
  if (!member) return { error: "Member not found or not assigned to you" };

  return saveWorkoutPlan({
    gymId: authProfile.gym_id,
    memberId,
    trainerId: trainerRecord.id,
    title,
    planData,
  });
};
