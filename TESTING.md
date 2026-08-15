# Test Checklist

Status: ⬜ untested · ✅ passing · ❌ failing

---

## Roles & Permissions (new)

### Gym Owner invites staff
- ⬜ Owner invites Front Desk → magic link email arrives, user signs in, lands on `/gym-admin`
- ⬜ Owner invites Accountant → same flow
- ⬜ Owner invites Second Admin → goes through directly (no approval needed)
- ⬜ Duplicate invite for same email → shows error "invite already pending"
- ⬜ Invite existing team member → shows error "already part of your team"

### Second Admin invites staff
- ⬜ Second Admin invites Front Desk → goes through directly
- ⬜ Second Admin invites Accountant → goes through directly
- ⬜ Second Admin invites Second Admin → held for owner approval
  - ⬜ Owner receives in-app notification (type: staff_invite)
  - ⬜ Owner receives email with gym name + inviter name + approve link
  - ⬜ Owner approves → magic link sent to invitee
  - ⬜ Owner declines → invite removed from pending list

### Sidebar nav per role
- ⬜ `gym_admin` — sees all nav items
- ⬜ `second_admin` — sees all except (verify no missing items)
- ⬜ `front_desk` — sees only Dashboard, Check-in, Members, Profile
- ⬜ `accountant` — sees only Dashboard, Payments, Plans, Members, Profile
- ⬜ Role label in sidebar footer shows correctly (Owner / Second Admin / Front Desk / Accountant)

### Remove staff
- ⬜ Owner can remove any staff member
- ⬜ Second Admin can remove Front Desk and Accountant
- ⬜ Second Admin cannot remove another Second Admin → shows error
- ⬜ Removed staff loses access immediately on next page load

### Platform staff (super-admin)
- ⬜ Platform Admin invites Platform Staff → magic link sent
- ⬜ Platform Staff can access `/super-admin` and `/super-admin/gyms`
- ⬜ Platform Staff cannot access `/super-admin/team`
- ⬜ Platform Admin can remove Platform Staff

---

## Super-Admin Panel

- ⬜ Overview stats load correctly (total gyms, pending, active, suspended, members)
- ⬜ Pending banner appears when gyms are awaiting approval
- ⬜ Gyms list loads with correct status badges
- ⬜ Status filter tabs work (all / pending / active / trial / suspended / cancelled)
- ⬜ Gym detail page shows correct member/trainer/plan counts
- ⬜ Approve gym → status changes to trial
- ⬜ Reject gym → gym deleted, redirects to gyms list
- ⬜ Suspend active gym → status changes to suspended
- ⬜ Reactivate suspended gym → status changes to trial

---

## Gym Registration & Pending Flow

- ⬜ New gym registers → lands on `/pending`
- ⬜ Pending gym owner cannot access `/gym-admin`
- ⬜ Staff of pending gym cannot access `/gym-admin`
- ⬜ After super-admin approves → gym owner can access dashboard

---

## Members

- ⬜ Add member → welcome email with temp password sent
- ⬜ Member logs in with temp password
- ⬜ Renew membership
- ⬜ Resend invite email
- ⬜ Remove member

---

## Check-ins

- ⬜ QR code scan → successful check-in
- ⬜ Expired membership → denied check-in
- ⬜ Manual check-in works
- ⬜ Check-in logs show in dashboard

---

## Plans

- ⬜ Create plan
- ⬜ Edit plan
- ⬜ Deactivate plan
- ⬜ Plan with branch access (if branches enabled)

---

## Branches

- ⬜ Enable branches toggle in settings
- ⬜ Branches nav item appears in sidebar
- ⬜ Create a branch
- ⬜ Assign branch access to a plan
- ⬜ Check-in validates correct branch

---

## Payments

- ⬜ Payment recorded on member renewal
- ⬜ Payment list loads with correct amounts
- ⬜ Paystack test card: `4084 0840 8408 4081` · Expiry: any future · CVV: `408` · OTP: `12345`

---

## Notifications

- ⬜ Send announcement to all members
- ⬜ Send announcement to single member
- ⬜ Expiry notification cron fires for memberships expiring in 7 days
- ⬜ Expiry notification cron fires for memberships expiring in 3 days
- ⬜ ⚠️ `CRON_SECRET` not yet added to Vercel — cron will fail in production until this is set

---

## Auth

- ⬜ Login with email/password
- ⬜ Logout
- ⬜ Unauthenticated user redirected to `/login`
- ⬜ Wrong role redirected to `/login` (e.g. member trying to access `/gym-admin`)
