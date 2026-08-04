-- ============================================================
-- GaaS (Gym as a Service) Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- GYMS
-- One row per gym business on the platform
-- ============================================================
create table gyms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  phone text,
  address text,
  logo_url text,
  subscription_status text not null default 'trial' check (subscription_status in ('active', 'trial', 'suspended', 'cancelled')),
  subscription_plan text not null default 'basic' check (subscription_plan in ('basic', 'pro', 'enterprise')),
  paystack_customer_code text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES
-- Extended user data for all user types (linked to auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null check (role in ('platform_admin', 'gym_admin', 'trainer', 'member')),
  gym_id uuid references gyms(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BRANCHES
-- Physical locations belonging to a gym
-- ============================================================
create table branches (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MEMBERSHIP PLANS
-- Plans a gym offers to its members
-- branch_access: 'all' = any branch, 'specific' = see plan_branch_access
-- ============================================================
create table membership_plans (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_days int not null,
  is_active boolean not null default true,
  branch_access text not null default 'all' check (branch_access in ('all', 'specific')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- PLAN BRANCH ACCESS
-- Which branches a 'specific' plan grants access to
-- ============================================================
create table plan_branch_access (
  plan_id   uuid not null references membership_plans(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  primary key (plan_id, branch_id)
);

-- ============================================================
-- GYM TRAINERS
-- Trainers belonging to a gym
-- ============================================================
create table gym_trainers (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  specialization text,
  bio text,
  created_at timestamptz not null default now(),
  unique(gym_id, profile_id)
);

-- ============================================================
-- GYM MEMBERS
-- Members belonging to a gym with their active plan
-- ============================================================
create table gym_members (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  membership_plan_id uuid references membership_plans(id) on delete set null,
  trainer_id uuid references gym_trainers(id) on delete set null,
  status text not null default 'pending' check (status in ('active', 'expired', 'suspended', 'pending')),
  barcode_code text not null unique,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  unique(gym_id, profile_id)
);

-- ============================================================
-- CHECK INS
-- Every scan event at the gym entrance
-- branch_id: which branch was scanned (null for legacy data)
-- ============================================================
create table check_ins (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  gym_member_id uuid not null references gym_members(id) on delete cascade,
  branch_id uuid references branches(id) on delete set null,
  status text not null check (status in ('success', 'denied')),
  checked_in_at timestamptz not null default now()
);

-- ============================================================
-- BMI RECORDS
-- Member body measurements over time
-- ============================================================
create table bmi_records (
  id uuid primary key default uuid_generate_v4(),
  gym_member_id uuid not null references gym_members(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  height_cm numeric(5,2) not null,
  bmi numeric(4,2) not null,
  category text not null check (category in ('underweight', 'normal', 'overweight', 'obese')),
  recorded_at timestamptz not null default now()
);

-- ============================================================
-- WORKOUT PLANS
-- AI-generated plans reviewed by trainers
-- ============================================================
create table workout_plans (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  gym_member_id uuid not null references gym_members(id) on delete cascade,
  trainer_id uuid references gym_trainers(id) on delete set null,
  title text not null,
  plan_data jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  ai_generated boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PAYMENTS
-- Payment records (fed by Paystack webhooks)
-- ============================================================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  gym_member_id uuid not null references gym_members(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('paid', 'pending', 'failed', 'refunded')),
  paystack_reference text unique,
  description text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- In-app notifications for members
-- ============================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid not null references gyms(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null check (type in ('announcement', 'payment', 'membership', 'workout', 'checkin')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures gym data is isolated between tenants
-- ============================================================

alter table gyms enable row level security;
alter table profiles enable row level security;
alter table branches enable row level security;
alter table membership_plans enable row level security;
alter table plan_branch_access enable row level security;
alter table gym_trainers enable row level security;
alter table gym_members enable row level security;
alter table check_ins enable row level security;
alter table bmi_records enable row level security;
alter table workout_plans enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Gym admins can view all profiles in their gym
create policy "Gym admins can view gym profiles"
  on profiles for select using (
    gym_id in (
      select gym_id from profiles where id = auth.uid() and role = 'gym_admin'
    )
  );

-- Gym data: gym admin can only see their own gym
create policy "Gym admin can view own gym"
  on gyms for select using (
    id in (select gym_id from profiles where id = auth.uid())
  );

create policy "Gym admin can update own gym"
  on gyms for update using (
    id in (select gym_id from profiles where id = auth.uid() and role = 'gym_admin')
  );

-- Branches: all gym users can view; only admin can manage
create policy "Gym users can view branches"
  on branches for select using (
    gym_id in (select gym_id from profiles where id = auth.uid())
  );

create policy "Gym admin can manage branches"
  on branches for all using (
    gym_id in (select gym_id from profiles where id = auth.uid() and role = 'gym_admin')
  );

-- Plan branch access: all gym users can read; only admin can manage
create policy "Gym users can view plan branch access"
  on plan_branch_access for select using (
    plan_id in (
      select id from membership_plans
      where gym_id in (select gym_id from profiles where id = auth.uid())
    )
  );

create policy "Gym admin can manage plan branch access"
  on plan_branch_access for all using (
    plan_id in (
      select id from membership_plans
      where gym_id in (select gym_id from profiles where id = auth.uid() and role = 'gym_admin')
    )
  );

-- Membership plans: visible to all members of the gym
create policy "Gym members can view plans"
  on membership_plans for select using (
    gym_id in (select gym_id from profiles where id = auth.uid())
  );

create policy "Gym admin can manage plans"
  on membership_plans for all using (
    gym_id in (select gym_id from profiles where id = auth.uid() and role = 'gym_admin')
  );

-- Gym members: visible to gym admin, trainer, and the member themselves
create policy "Gym members visible to gym staff and self"
  on gym_members for select using (
    gym_id in (select gym_id from profiles where id = auth.uid())
  );

create policy "Gym admin can manage gym members"
  on gym_members for all using (
    gym_id in (select gym_id from profiles where id = auth.uid() and role = 'gym_admin')
  );

-- Check ins: visible to gym admin and the member
create policy "Check ins visible to gym staff and member"
  on check_ins for select using (
    gym_id in (select gym_id from profiles where id = auth.uid())
  );

-- Notifications: users can only see their own
create policy "Users see own notifications"
  on notifications for select using (
    profile_id = auth.uid() or profile_id is null and gym_id in (
      select gym_id from profiles where id = auth.uid()
    )
  );

create policy "Users can mark notifications read"
  on notifications for update using (profile_id = auth.uid());

-- ============================================================
-- INDEXES
-- For common query patterns
-- ============================================================

create index idx_profiles_gym_id on profiles(gym_id);
create index idx_branches_gym_id on branches(gym_id);
create index idx_plan_branch_access_plan_id on plan_branch_access(plan_id);
create index idx_gym_members_gym_id on gym_members(gym_id);
create index idx_gym_members_barcode on gym_members(barcode_code);
create index idx_check_ins_gym_id on check_ins(gym_id);
create index idx_check_ins_member_id on check_ins(gym_member_id);
create index idx_check_ins_date on check_ins(checked_in_at);
create index idx_check_ins_branch_id on check_ins(branch_id);
create index idx_notifications_profile_id on notifications(profile_id);
create index idx_payments_gym_member_id on payments(gym_member_id);
create index idx_workout_plans_member_id on workout_plans(gym_member_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
