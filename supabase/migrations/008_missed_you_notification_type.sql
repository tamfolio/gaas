-- Add missed_you notification type for the re-engagement cron
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'announcement', 'payment', 'membership', 'workout', 'checkin',
    'staff_invite', 'expiry_7d', 'expiry_3d', 'missed_you'
  ));
