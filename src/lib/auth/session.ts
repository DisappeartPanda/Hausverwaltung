import type { AstroGlobal } from "astro";
import type { Session, User } from "@supabase/supabase-js";
import { getProfileByUserId } from "../domain/profiles/profile-repository";
import { getDefaultOrganizationMembershipByUserId } from "../domain/organizations/organization-member-repository";

export type AppRole = "guest" | "tenant" | "landlord";

export type AppSession = {
  userId: string | null;
  role: AppRole;
  organizationId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  session: Session | null;
  user: User | null;
};

function normalizeRole(value: unknown): AppRole {
  if (value === "tenant") return "tenant";
  if (value === "landlord") return "landlord";
  return "guest";
}

export async function getAppSession(astro: AstroGlobal): Promise<AppSession> {
  const session = astro.locals.session ?? null;
  const user = astro.locals.user ?? null;

  if (!user) {
    return {
      userId: null,
      role: "guest",
      organizationId: null,
      email: null,
      firstName: null,
      lastName: null,
      session: null,
      user: null,
    };
  }

  const [profile, membership] = await Promise.all([
    getProfileByUserId(astro.cookies, user.id),
    getDefaultOrganizationMembershipByUserId(astro.cookies, user.id),
  ]);

  const resolvedRole = normalizeRole(
    membership?.role ?? profile?.default_role ?? "guest",
  );

  return {
    userId: user.id,
    role: resolvedRole,
    organizationId: membership?.organization_id ?? null,
    email: profile?.email ?? user.email ?? null,
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
    session,
    user,
  };
}