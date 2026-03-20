import type { AstroGlobal } from "astro";
import { createServerSupabaseClient } from "../supabase/server";
import { ROUTES } from "../constants/routes";

export interface SessionResult {
  user: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}

/**
 * Prüft ob User eingeloggt ist (jede Rolle)
 */
export async function requireSession(
  Astro: AstroGlobal
): Promise<SessionResult | Response> {
  const supabase = createServerSupabaseClient(Astro.cookies);
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    const returnUrl = encodeURIComponent(Astro.url.pathname);
    return Astro.redirect(`${ROUTES.AUTH_LOGIN}?returnTo=${returnUrl}`);
  }

  // Rolle aus app_metadata (sicher) oder user_metadata (Fallback)
  const role = user.app_metadata?.role || user.user_metadata?.role || "guest";

  // Organisation des Users laden
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return {
    user: {
      id: user.id,
      email: user.email!,
      role: membership?.role || role,
      organizationId: membership?.organization_id,
    },
  };
}

/**
 * Prüft ob User ein Tenant (Mieter) ist
 */
export async function requireTenantSession(
  Astro: AstroGlobal
): Promise<SessionResult | Response> {
  const result = await requireSession(Astro);
  
  if (result instanceof Response) {
    return result;
  }

  // Prüfe ob Tenant oder zumindest Member mit Tenant-Rolle
  const allowedRoles = ["tenant", "owner", "admin"]; // Owner/Admin können auch Tenant-Bereich sehen?
  
  if (!allowedRoles.includes(result.user.role)) {
    return Astro.redirect(ROUTES.APP_DASHBOARD);
  }

  return result;
}

/**
 * Prüft ob User Landlord/Verwalter ist
 */
export async function requireLandlordSession(
  Astro: AstroGlobal
): Promise<SessionResult | Response> {
  const result = await requireSession(Astro);
  
  if (result instanceof Response) {
    return result;
  }

  const allowedRoles = ["owner", "admin", "member", "viewer"];
  
  if (!allowedRoles.includes(result.user.role)) {
    return Astro.redirect(ROUTES.APP_TENANT_HOME);
  }

  return result;
}

/**
 * Prüft ob User Admin/Owner ist
 */
export async function requireAdminSession(
  Astro: AstroGlobal
): Promise<SessionResult | Response> {
  const result = await requireSession(Astro);
  
  if (result instanceof Response) {
    return result;
  }

  if (!["owner", "admin"].includes(result.user.role)) {
    return Astro.redirect(ROUTES.APP_DASHBOARD);
  }

  return result;
}