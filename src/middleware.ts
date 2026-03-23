import { defineMiddleware } from "astro:middleware";
import { createServerSupabaseClient } from "./lib/supabase/server";
import { ROUTES } from "./lib/constants/routes";

const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.AUTH_LOGIN,
  ROUTES.AUTH_REGISTER,
  ROUTES.AUTH_FORGOT_PASSWORD,
  ROUTES.AUTH_RESET_PASSWORD,
  "/auth/verify-email",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
];

const STATIC_ASSET_PREFIXES = [
  "/_astro/",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isStaticAsset(pathname: string) {
  return STATIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;

  if (isStaticAsset(pathname)) {
    return next();
  }

  const supabase = createServerSupabaseClient(cookies);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.supabase = supabase;
  context.locals.session = session;
  context.locals.user = user;

  if (isPublicRoute(pathname)) {
    if (
      user &&
      (
        pathname === ROUTES.AUTH_LOGIN ||
        pathname === ROUTES.AUTH_REGISTER ||
        pathname === ROUTES.AUTH_FORGOT_PASSWORD ||
        pathname === ROUTES.AUTH_RESET_PASSWORD
      )
    ) {
      const role = user.app_metadata?.role || user.user_metadata?.role;

      if (role === "tenant") {
        return context.redirect(ROUTES.APP_TENANT_HOME);
      }

      return context.redirect(ROUTES.APP_DASHBOARD);
    }

    return next();
  }

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Nicht autorisiert" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return next();
  }

  const isAppRoute = pathname.startsWith(ROUTES.APP_ROOT);

  if (isAppRoute && !user) {
    const returnTo = encodeURIComponent(pathname);
    return context.redirect(`${ROUTES.AUTH_LOGIN}?returnTo=${returnTo}`);
  }

  if (!user) {
    const returnTo = encodeURIComponent(pathname);
    return context.redirect(`${ROUTES.AUTH_LOGIN}?returnTo=${returnTo}`);
  }

  const role = user.app_metadata?.role || user.user_metadata?.role || "guest";

  if (pathname.startsWith("/app/tenant") && role !== "tenant") {
    return context.redirect(ROUTES.APP_DASHBOARD);
  }

  if (pathname.startsWith("/app/") && !pathname.startsWith("/app/tenant") && role === "tenant") {
    return context.redirect(ROUTES.APP_TENANT_HOME);
  }

  return next();
});