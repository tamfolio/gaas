-- Add 'pending' to the subscription_status check constraint
-- New gyms start as 'pending' until approved by a platform admin

DO $$
DECLARE
  c text;
BEGIN
  SELECT conname INTO c
  FROM pg_constraint
  WHERE conrelid = 'gyms'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%subscription_status%';

  IF c IS NOT NULL THEN
    EXECUTE format('ALTER TABLE gyms DROP CONSTRAINT %I', c);
  END IF;
END $$;

ALTER TABLE gyms
  ADD CONSTRAINT gyms_subscription_status_check
  CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled', 'pending'));

-- Update the default so new registrations start as pending
ALTER TABLE gyms ALTER COLUMN subscription_status SET DEFAULT 'pending';
