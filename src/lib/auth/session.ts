import type { AstroGlobal } from "astro";
import type { Session, User } from "@supabase/supabase-js";
import { ROLES } from "../constants/roles";

export type AppSession = {
  session: Session | null;
  user: User;
  userId: string;
  role: string;
  organizationId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  organizationName: string | null;
};

export function buildAppSession(
  user: User,
  session: Session | null = null
): AppSession {
  return {
    session,
    user,
    userId: user.id,
    role: String(
      user.user_metadata?.role ?? user.app_metadata?.role ?? ROLES.GUEST
    ),
    organizationId:
      (user.user_metadata?.organization_id as string | null | undefined) ??
      (user.app_metadata?.organization_id as string | null | undefined) ??
      null,
    email: user.email ?? null,
    firstName:
      (user.user_metadata?.first_name as string | null | undefined) ?? null,
    lastName:
      (user.user_metadata?.last_name as string | null | undefined) ?? null,
    organizationName:
      (user.user_metadata?.organization_name as string | null | undefined) ??
      null,
  };
}

export async function getAppSession(
  Astro: AstroGlobal
): Promise<Response | AppSession> {
  const user = Astro.locals.user;
  const session = Astro.locals.session ?? null;

  if (!user) {
    return Astro.redirect("/auth/login");
  }

  return buildAppSession(user, session);
}