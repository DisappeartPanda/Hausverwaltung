import type { AstroGlobal } from "astro";
import { getAppSession } from "./session";

export async function requireAppSession(astro: AstroGlobal) {
  const session = await getAppSession(astro);

  if (!session.userId) {
    return astro.redirect("/auth/login");
  }

  return session;
}

export async function requireLandlordSession(astro: AstroGlobal) {
  const session = await getAppSession(astro);

  if (!session.userId || session.role !== "landlord") {
    return astro.redirect("/auth/login");
  }

  if (!session.organizationId) {
    return astro.redirect("/auth/register");
  }

  return session;
}

export async function requireTenantSession(astro: AstroGlobal) {
  const session = await getAppSession(astro);

  if (!session.userId || session.role !== "tenant") {
    return astro.redirect("/auth/login");
  }

  if (!session.organizationId) {
    return astro.redirect("/auth/register");
  }

  return session;
}