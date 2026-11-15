-- ============================================================
-- 010: Row-level security for trainers, workout plans, BMI and exercises
--
-- Problem: gym_trainers, workout_plans, bmi_records and exercises have RLS
-- enabled but no SELECT policies, so signed-in users get zero rows.
-- Trainers can't even read their own gym_trainers row, so /trainer
-- redirects them back to /login (every trainer is locked out).
--
-- Read-only (SELECT) policies only. Writes keep going through server
-- actions that use the service-role client after their own checks.
-- Safe to re-run: every policy is dropped first if it exists.
-- ============================================================

-- Helper functions run as the table owner (SECURITY DEFINER) so policies
-- can use them without recursively triggering RLS on the same tables.

-- gym_members.id values assigned to the signed-in trainer
create or replace function public.current_trainer_member_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select gm.id
  from gym_members gm
  join gym_trainers gt on gt.id = gm.trainer_id
  where gt.profile_id = auth.uid();
$$;

-- profiles.id values of members assigned to the signed-in trainer.
-- Must be SECURITY DEFINER: a profiles policy that queried gym_members directly
-- recursed (gym_members' own policy queries profiles) → "infinite recursion".
create or replace function public.current_trainer_member_profile_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select gm.profile_id
  from gym_members gm
  join gym_trainers gt on gt.id = gm.trainer_id
  where gt.profile_id = auth.uid();
$$;

-- gym_members.id values belonging to the signed-in member
create or replace function public.current_member_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select id from gym_members where profile_id = auth.uid();
$$;

-- gym_id of the signed-in user (any role)
create or replace function public.current_user_gym_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select gym_id from profiles where id = auth.uid();
$$;

-- gym_id of the signed-in user when they are gym staff (owner, second admin, front desk, accountant)
create or replace function public.current_staff_gym_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select gym_id from profiles
  where id = auth.uid()
    and role in ('gym_admin', 'second_admin', 'front_desk', 'accountant');
$$;

create or replace function public.current_staff_gym_member_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select gm.id from gym_members gm
  where gm.gym_id = public.current_staff_gym_id();
$$;

revoke all on function public.current_user_gym_id() from public;
grant execute on function public.current_user_gym_id() to authenticated;
revoke all on function public.current_staff_gym_member_ids() from public;
grant execute on function public.current_staff_gym_member_ids() to authenticated;
revoke all on function public.current_trainer_member_ids() from public;
revoke all on function public.current_trainer_member_profile_ids() from public;
revoke all on function public.current_member_ids() from public;
revoke all on function public.current_staff_gym_id() from public;
grant execute on function public.current_trainer_member_ids() to authenticated;
grant execute on function public.current_trainer_member_profile_ids() to authenticated;
grant execute on function public.current_member_ids() to authenticated;
grant execute on function public.current_staff_gym_id() to authenticated;

-- ── gym_trainers ────────────────────────────────────────────
-- Trainer names/specialisations are visible to everyone in the same gym
-- (matches the existing gym_members policy).
drop policy if exists "Gym users can view gym trainers" on gym_trainers;
create policy "Gym users can view gym trainers"
  on gym_trainers for select using (
    profile_id = auth.uid()
    or gym_id = public.current_user_gym_id()
  );

-- ── profiles ────────────────────────────────────────────────
-- Trainers can see the profiles (name, email, phone) of members assigned to them.
drop policy if exists "Trainers can view assigned member profiles" on profiles;
create policy "Trainers can view assigned member profiles"
  on profiles for select using (
    id in (select public.current_trainer_member_profile_ids())
  );

-- ── workout_plans ───────────────────────────────────────────
drop policy if exists "Workout plans visible to member, trainer and gym staff" on workout_plans;
create policy "Workout plans visible to member, trainer and gym staff"
  on workout_plans for select using (
    gym_member_id in (select public.current_member_ids())
    or gym_member_id in (select public.current_trainer_member_ids())
    or gym_id = public.current_staff_gym_id()
  );

-- ── bmi_records ─────────────────────────────────────────────
drop policy if exists "BMI visible to member, trainer and gym staff" on bmi_records;
create policy "BMI visible to member, trainer and gym staff"
  on bmi_records for select using (
    gym_member_id in (select public.current_member_ids())
    or gym_member_id in (select public.current_trainer_member_ids())
    or gym_member_id in (select public.current_staff_gym_member_ids())
  );

-- ── exercises (shared library) ──────────────────────────────
drop policy if exists "Signed-in users can read the exercise library" on exercises;
create policy "Signed-in users can read the exercise library"
  on exercises for select to authenticated using (true);
