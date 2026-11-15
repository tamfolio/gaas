import type { WorkoutPlanData } from "@/types";

export type WorkoutPlanInput = Omit<WorkoutPlanData, "goal"> & { goal?: string };

export type SaveWorkoutPlanAction = (args: {
  memberId: string;
  title: string;
  planData: WorkoutPlanInput;
}) => Promise<{ success: true } | { error: string }>;
