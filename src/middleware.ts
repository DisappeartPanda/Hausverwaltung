import { defineMiddleware } from "astro:middleware";
import { createServerSupabaseClient } from "./lib/supabase/server";
import { ROUTES } from "./lib/constants/routes";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerSupabaseClient(context.cookies);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.supabase = supabase;
  context.locals.session = session;
  context.locals.user = user;

  const pathname = context.url.pathname;

  const isAppRoute = pathname.startsWith(ROUTES.APP_ROOT);
  const isAuthRoute =
    pathname === ROUTES.AUTH_LOGIN ||
    pathname === ROUTES.AUTH_REGISTER ||
    pathname === ROUTES.AUTH_FORGOT_PASSWORD ||
    pathname === ROUTES.AUTH_RESET_PASSWORD;

  if (isAppRoute && !user) {
    return context.redirect(ROUTES.AUTH_LOGIN);
  }

  if (isAuthRoute && user) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership?.role === "tenant") {
      return context.redirect(ROUTES.APP_TENANT_HOME);
    }

    if (membership?.role === "owner" || membership?.role === "landlord") {
      return context.redirect(ROUTES.HOME);
    }

    const appRole = user.user_metadata?.role;

    if (appRole === "tenant") {
      return context.redirect(ROUTES.APP_TENANT_HOME);
    }

    if (appRole === "landlord") {
      return context.redirect(ROUTES.HOME);
    }

    return context.redirect(ROUTES.APP_DASHBOARD);
  }

  return next();
});