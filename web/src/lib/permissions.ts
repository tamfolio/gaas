import type { UserRole } from "@/types";

// Nav hrefs each gym role is allowed to see
const GYM_ROLE_NAV: Record<string, string[]> = {
  gym_admin:    ["*"],
  second_admin: [
    "/gym-admin",
    "/gym-admin/members",
    "/gym-admin/trainers",
    "/gym-admin/plans",
    "/gym-admin/payments",
    "/gym-admin/notifications",
    "/gym-admin/check-in",
    "/gym-admin/branches",
    "/gym-admin/profile",
    "/gym-admin/team",
    "/gym-admin/settings",
  ],
  front_desk: [
    "/gym-admin",
    "/gym-admin/check-in",
    "/gym-admin/members",
    "/gym-admin/profile",
  ],
  accountant: [
    "/gym-admin",
    "/gym-admin/payments",
    "/gym-admin/plans",
    "/gym-admin/members",
    "/gym-admin/profile",
  ],
};

const PLATFORM_ROLE_NAV: Record<string, string[]> = {
  platform_admin: ["*"],
  platform_staff: ["/super-admin", "/super-admin/gyms"],
};

export function canAccessGymNav(role: UserRole, href: string): boolean {
  const allowed = GYM_ROLE_NAV[role];
  if (!allowed) return false;
  return allowed.includes("*") || allowed.includes(href);
}

export function canAccessPlatformNav(role: UserRole, href: string): boolean {
  const allowed = PLATFORM_ROLE_NAV[role];
  if (!allowed) return false;
  return allowed.includes("*") || allowed.includes(href);
}

export const ROLE_LABELS: Record<string, string> = {
  platform_admin: "Platform Admin",
  platform_staff: "Platform Staff",
  gym_admin:      "Owner",
  second_admin:   "Second Admin",
  front_desk:     "Front Desk",
  accountant:     "Accountant",
  trainer:        "Trainer",
  member:         "Member",
};

export const GYM_STAFF_ROLES = ["second_admin", "front_desk", "accountant"] as const;
export type GymStaffRole = (typeof GYM_STAFF_ROLES)[number];

// Returns true when a second_admin inviting another second_admin needs owner approval
export function requiresOwnerApproval(
  inviterRole: string,
  targetRole: GymStaffRole
): boolean {
  return inviterRole === "second_admin" && targetRole === "second_admin";
}

export const GYM_ROLES_WITH_TEAM_ACCESS = ["gym_admin", "second_admin"] as const;
