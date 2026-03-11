import type { User } from "@supabase/supabase-js";
import { ROLES, type UserRole } from "../constants/roles";

export function getUserRole(user: User | null): UserRole {
  const rawRole = user?.user_metadata?.role ?? user?.app_metadata?.role;

  if (rawRole === ROLES.TENANT) {
    return ROLES.TENANT;
  }

  if (rawRole === ROLES.LANDLORD) {
    return ROLES.LANDLORD;
  }

  return ROLES.GUEST;
}