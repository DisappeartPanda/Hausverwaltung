export const ROLES = {
  GUEST: "guest",
  TENANT: "tenant",
  LANDLORD: "landlord",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function isTenant(role: UserRole | null | undefined): boolean {
  return role === ROLES.TENANT;
}

export function isLandlord(role: UserRole | null | undefined): boolean {
  return role === ROLES.LANDLORD;
}

export function isGuest(role: UserRole | null | undefined): boolean {
  return !role || role === ROLES.GUEST;
}