import { defineMiddleware } from "astro:middleware";
import { ROUTES } from "./lib/constants/routes";
import { createServerSupabaseClient } from "./lib/supabase/server";
import { getPostLoginRoute } from "./lib/auth/redirects";
import { getUserRole } from "./lib/auth/user-role";

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
    const role = getUserRole(user);
    return context.redirect(getPostLoginRoute(role));
  }

  return next();
});