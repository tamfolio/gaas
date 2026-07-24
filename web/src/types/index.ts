export type UserRole = "platform_admin" | "gym_admin" | "trainer" | "member";

export type MembershipStatus = "active" | "expired" | "suspended" | "pending";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface Gym {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string | null;
  subscription_status: "active" | "trial" | "suspended" | "cancelled";
  subscription_plan: "basic" | "pro" | "enterprise";
  paystack_customer_code: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  gym_id: string | null;
  created_at: string;
}

export interface GymMember {
  id: string;
  gym_id: string;
  profile_id: string;
  membership_plan_id: string;
  status: MembershipStatus;
  barcode_code: string;
  start_date: string;
  end_date: string;
  created_at: string;
  profile?: Profile;
  membership_plan?: MembershipPlan;
}

export interface GymTrainer {
  id: string;
  gym_id: string;
  profile_id: string;
  specialization: string | null;
  bio: string | null;
  created_at: string;
  profile?: Profile;
}

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

export interface CheckIn {
  id: string;
  gym_id: string;
  gym_member_id: string;
  checked_in_at: string;
  status: "success" | "denied";
  gym_member?: GymMember;
}

export interface WorkoutPlan {
  id: string;
  gym_id: string;
  gym_member_id: string;
  trainer_id: string | null;
  title: string;
  plan_data: WorkoutPlanData;
  status: "draft" | "active" | "archived";
  ai_generated: boolean;
  created_at: string;
}

export interface WorkoutPlanData {
  goal: string;
  weeks: WorkoutWeek[];
}

export interface WorkoutWeek {
  week: number;
  days: WorkoutDay[];
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string | null;
}

export interface Notification {
  id: string;
  gym_id: string;
  profile_id: string | null;
  title: string;
  body: string;
  type: "announcement" | "payment" | "membership" | "workout" | "checkin";
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  gym_id: string;
  gym_member_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paystack_reference: string | null;
  description: string;
  paid_at: string | null;
  created_at: string;
}

export interface BMIRecord {
  id: string;
  gym_member_id: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  category: "underweight" | "normal" | "overweight" | "obese";
  recorded_at: string;
}
