import type { AstroGlobal } from "astro";
import type { User } from "@supabase/supabase-js";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { getUserRole } from "./user-role";
import { buildAppSession, type AppSession } from "./session";

export function requireUser(user: User | null): string | null {
  if (!user) {
    return ROUTES.AUTH_LOGIN;
  }

  return null;
}

export function requireTenant(user: User | null): string | null {
  if (!user) {
    return ROUTES.AUTH_LOGIN;
  }

  const role = getUserRole(user);

  if (role !== ROLES.TENANT) {
    return ROUTES.APP_DASHBOARD;
  }

  return null;
}

export function requireLandlord(user: User | null): string | null {
  if (!user) {
    return ROUTES.AUTH_LOGIN;
  }

  const role = getUserRole(user);

  if (role !== ROLES.LANDLORD) {
    return ROUTES.APP_TENANT_HOME;
  }

  return null;
}

export async function requireAppSession(
  Astro: AstroGlobal
): Promise<Response | AppSession> {
  const user = Astro.locals.user;
  const session = Astro.locals.session ?? null;

  if (!user) {
    return Astro.redirect(ROUTES.AUTH_LOGIN);
  }

  return buildAppSession(user, session);
}

export async function requireLandlordSession(
  Astro: AstroGlobal
): Promise<Response | AppSession> {
  const user = Astro.locals.user;
  const session = Astro.locals.session ?? null;

  if (!user) {
    return Astro.redirect(ROUTES.AUTH_LOGIN);
  }

  const role = getUserRole(user);

  if (role !== ROLES.LANDLORD) {
    return Astro.redirect(ROUTES.APP_TENANT_HOME);
  }

  return buildAppSession(user, session);
}

export async function requireTenantSession(
  Astro: AstroGlobal
): Promise<Response | AppSession> {
  const user = Astro.locals.user;
  const session = Astro.locals.session ?? null;

  if (!user) {
    return Astro.redirect(ROUTES.AUTH_LOGIN);
  }

  const role = getUserRole(user);

  if (role !== ROLES.TENANT) {
    return Astro.redirect(ROUTES.APP_DASHBOARD);
  }

  return buildAppSession(user, session);
}