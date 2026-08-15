-- 006: Referrals and guest visit tracking

-- 1. Referral reward days configurable per gym (default 7)
ALTER TABLE gyms
  ADD COLUMN IF NOT EXISTS referral_reward_days integer NOT NULL DEFAULT 7;

-- 2. Guest pass quota on membership plans (0 = guests not allowed)
ALTER TABLE membership_plans
  ADD COLUMN IF NOT EXISTS guest_passes_per_month integer NOT NULL DEFAULT 0;

-- 3. Referral codes — one per member per gym
CREATE TABLE IF NOT EXISTS referral_codes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id     uuid        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id  uuid        NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  code       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code),
  UNIQUE (gym_id, member_id)
);

-- 4. Referrals — tracks who referred who and whether it converted
CREATE TABLE IF NOT EXISTS referrals (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id             uuid        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  referrer_member_id uuid        NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  referred_member_id uuid        NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  status             text        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'converted')),
  days_awarded       integer,
  converted_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_member_id)
);

-- 5. Guest visits — logged by gym staff for quota tracking and marketing
CREATE TABLE IF NOT EXISTS guest_visits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      uuid        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id   uuid        NOT NULL REFERENCES gym_members(id) ON DELETE CASCADE,
  guest_name  text        NOT NULL,
  guest_phone text,
  guest_email text,
  visited_at  date        NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_visits   ENABLE ROW LEVEL SECURITY;

-- Service role: full access (all server actions use service role)
CREATE POLICY "service_role_referral_codes" ON referral_codes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_referrals" ON referrals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_guest_visits" ON guest_visits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read their own gym's data
CREATE POLICY "authenticated_read_referral_codes" ON referral_codes
  FOR SELECT TO authenticated
  USING (gym_id IN (
    SELECT gym_id FROM profiles WHERE id = auth.uid() AND gym_id IS NOT NULL
  ));

CREATE POLICY "authenticated_read_referrals" ON referrals
  FOR SELECT TO authenticated
  USING (gym_id IN (
    SELECT gym_id FROM profiles WHERE id = auth.uid() AND gym_id IS NOT NULL
  ));

CREATE POLICY "authenticated_read_guest_visits" ON guest_visits
  FOR SELECT TO authenticated
  USING (gym_id IN (
    SELECT gym_id FROM profiles WHERE id = auth.uid() AND gym_id IS NOT NULL
  ));
