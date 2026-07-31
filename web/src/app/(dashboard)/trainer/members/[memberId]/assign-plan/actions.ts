"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ExerciseEntry = {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
};

type DayPlan = {
  day: string;
  exercises: ExerciseEntry[];
};

type PlanData = {
  goal?: string;
  weeks: { week: number; days: DayPlan[] }[];
};

export async function assignWorkoutPlan({
  memberId,
  title,
  planData,
}: {
  memberId: string;
  title: string;
  planData: PlanData;
}) {
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
    .eq("trainer_id", trainerRecord.id)
    .single();
  if (!member) return { error: "Member not found or not assigned to you" };

  // Deactivate any existing active plan
  await supabase
    .from("workout_plans")
    .update({ status: "archived" })
    .eq("gym_member_id", memberId)
    .eq("status", "active");

  const { error } = await supabase.from("workout_plans").insert({
    gym_member_id: memberId,
    title,
    plan_data: planData,
    status: "active",
    ai_generated: false,
  });

  if (error) return { error: error.message };
  return { success: true };
}
