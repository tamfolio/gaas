-- 007: Platform subscription management (gym pays EngineRoom)

-- 1. Add subscription tracking columns to gyms
ALTER TABLE gyms
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_period      text CHECK (subscription_period IN ('halfyear', 'annual'));

-- 2. Platform plans: configurable pricing — update amounts in super-admin when finalised
--    Prices stored in Naira (not kobo)
CREATE TABLE IF NOT EXISTS platform_plans (
  id              uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text     NOT NULL UNIQUE CHECK (name IN ('basic', 'pro', 'enterprise')),
  display_name    text     NOT NULL,
  price_halfyear  integer  NOT NULL,
  price_annual    integer  NOT NULL,
  member_limit    integer,           -- null = unlimited
  branch_limit    integer,           -- null = unlimited
  features        text[]   NOT NULL DEFAULT '{}',
  is_active       boolean  NOT NULL DEFAULT true,
  sort_order      integer  NOT NULL DEFAULT 0
);

INSERT INTO platform_plans (name, display_name, price_halfyear, price_annual, member_limit, branch_limit, features, sort_order)
VALUES
  ('basic',
   'Basic',
   30000, 50000,
   100, 1,
   ARRAY[
     'Up to 100 members',
     '1 branch location',
     'Member check-ins & QR codes',
     'Paystack payment collection',
     'Email support'
   ],
   1),
  ('pro',
   'Pro',
   75000, 130000,
   500, 5,
   ARRAY[
     'Up to 500 members',
     'Up to 5 branches',
     'Everything in Basic',
     'Guest pass management',
     'Referral system',
     'Staff roles & permissions',
     'Priority support'
   ],
   2),
  ('enterprise',
   'Enterprise',
   180000, 300000,
   null, null,
   ARRAY[
     'Unlimited members',
     'Unlimited branches',
     'Everything in Pro',
     'AI-generated workout plans',
     'Dedicated account manager'
   ],
   3)
ON CONFLICT (name) DO NOTHING;

-- 3. Gym subscription payment history
CREATE TABLE IF NOT EXISTS gym_subscription_payments (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id             uuid        NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan               text        NOT NULL,
  period             text        NOT NULL CHECK (period IN ('halfyear', 'annual')),
  amount             integer     NOT NULL, -- Naira
  paystack_reference text        UNIQUE,
  status             text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  period_start       date,
  period_end         date,
  paid_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE platform_plans            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_platform_plans" ON platform_plans
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_active_plans" ON platform_plans
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "service_role_gym_sub_payments" ON gym_subscription_payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "gym_staff_read_own_sub_payments" ON gym_subscription_payments
  FOR SELECT TO authenticated
  USING (gym_id IN (
    SELECT gym_id FROM profiles WHERE id = auth.uid() AND gym_id IS NOT NULL
  ));
