import { ROUTES } from "../constants/routes";
import { ROLES, type UserRole } from "../constants/roles";

export function getPostLoginRoute(role: UserRole | null | undefined): string {
  if (role === ROLES.TENANT) {
    return ROUTES.APP_TENANT_HOME;
  }

  return ROUTES.APP_DASHBOARD;
}