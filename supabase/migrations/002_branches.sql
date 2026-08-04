-- ============================================================
-- Migration 002: Branches + Plan Branch Access
-- Run in Supabase SQL Editor
-- ============================================================

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
-- MEMBERSHIP PLANS — add branch access type
-- 'all'      → member can check in at any branch
-- 'specific' → member can only check in at branches listed in plan_branch_access
-- ============================================================
alter table membership_plans
  add column branch_access text not null default 'all'
  check (branch_access in ('all', 'specific'));

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
-- CHECK INS — add branch tracking
-- Nullable: existing check-ins have no branch
-- ============================================================
alter table check_ins
  add column branch_id uuid references branches(id) on delete set null;

-- ============================================================
-- RLS
-- ============================================================
alter table branches enable row level security;
alter table plan_branch_access enable row level security;

-- Branches: all gym staff and members can view
create policy "Gym users can view branches"
  on branches for select using (
    gym_id in (select gym_id from profiles where id = auth.uid())
  );

-- Branches: only gym admin can manage
create policy "Gym admin can manage branches"
  on branches for all using (
    gym_id in (select gym_id from profiles where id = auth.uid() and role = 'gym_admin')
  );

-- Plan branch access: all gym users can read (needed for check-in validation)
create policy "Gym users can view plan branch access"
  on plan_branch_access for select using (
    plan_id in (
      select id from membership_plans
      where gym_id in (select gym_id from profiles where id = auth.uid())
    )
  );

-- Plan branch access: only gym admin can manage
create policy "Gym admin can manage plan branch access"
  on plan_branch_access for all using (
    plan_id in (
      select id from membership_plans
      where gym_id in (select gym_id from profiles where id = auth.uid() and role = 'gym_admin')
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_branches_gym_id on branches(gym_id);
create index idx_plan_branch_access_plan_id on plan_branch_access(plan_id);
create index idx_check_ins_branch_id on check_ins(branch_id);
