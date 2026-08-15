export type UserRole =
  | "platform_admin"
  | "platform_staff"
  | "gym_admin"
  | "second_admin"
  | "front_desk"
  | "accountant"
  | "trainer"
  | "member";

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
  referral_reward_days: number;
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
  guest_passes_per_month: number;
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
  type: "announcement" | "payment" | "membership" | "workout" | "checkin" | "staff_invite" | "expiry_7d" | "expiry_3d";
  is_read: boolean;
  created_at: string;
}

export interface GymStaffInvite {
  id: string;
  gym_id: string;
  email: string;
  full_name: string;
  role: "second_admin" | "front_desk" | "accountant";
  invited_by: string;
  status: "pending_owner_approval" | "pending_acceptance";
  created_at: string;
  inviter?: Profile;
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

export interface ReferralCode {
  id: string;
  gym_id: string;
  member_id: string;
  code: string;
  created_at: string;
}

export interface Referral {
  id: string;
  gym_id: string;
  referrer_member_id: string;
  referred_member_id: string;
  status: "pending" | "converted";
  days_awarded: number | null;
  converted_at: string | null;
  created_at: string;
}

export interface GuestVisit {
  id: string;
  gym_id: string;
  member_id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  visited_at: string;
  created_at: string;
  member?: GymMember;
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
