-- Extend profiles role check to include new staff roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'platform_admin', 'platform_staff',
    'gym_admin', 'second_admin', 'front_desk', 'accountant',
    'trainer', 'member'
  ));

-- Extend notifications type check to include staff_invite + expiry types used by cron
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'announcement', 'payment', 'membership', 'workout', 'checkin',
    'staff_invite', 'expiry_7d', 'expiry_3d'
  ));

-- Pending staff invites (used for second_admin-invites-second_admin approval flow)
CREATE TABLE IF NOT EXISTS gym_staff_invites (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id      uuid        REFERENCES gyms(id) ON DELETE CASCADE NOT NULL,
  email       text        NOT NULL,
  full_name   text        NOT NULL,
  role        text        NOT NULL CHECK (role IN ('second_admin', 'front_desk', 'accountant')),
  invited_by  uuid        REFERENCES profiles(id) NOT NULL,
  status      text        NOT NULL DEFAULT 'pending_acceptance'
                CHECK (status IN ('pending_owner_approval', 'pending_acceptance')),
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE gym_staff_invites ENABLE ROW LEVEL SECURITY;

-- gym_admin and second_admin can read invites for their gym
CREATE POLICY "gym staff can view invites" ON gym_staff_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.gym_id = gym_staff_invites.gym_id
        AND profiles.role IN ('gym_admin', 'second_admin')
    )
  );

-- gym_admin and second_admin can create invites
CREATE POLICY "gym staff can create invites" ON gym_staff_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.gym_id = gym_staff_invites.gym_id
        AND profiles.role IN ('gym_admin', 'second_admin')
    )
  );

-- only gym_admin can approve/decline (update) invites
CREATE POLICY "gym admin can update invites" ON gym_staff_invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.gym_id = gym_staff_invites.gym_id
        AND profiles.role = 'gym_admin'
    )
  );

-- gym_admin and second_admin can cancel invites
CREATE POLICY "gym staff can delete invites" ON gym_staff_invites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.gym_id = gym_staff_invites.gym_id
        AND profiles.role IN ('gym_admin', 'second_admin')
    )
  );
