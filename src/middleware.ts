import { defineMiddleware } from "astro:middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) {
        return context.cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        context.cookies.set(key, value, options);
      },
      remove(key: string, options: CookieOptions) {
        context.cookies.delete(key, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = context.url.pathname;
  const isAppRoute = pathname.startsWith("/app");
  const isTenantRoute = pathname.startsWith("/tenant");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if ((isAppRoute || isTenantRoute) && !user) {
    return context.redirect("/login");
  }

  if (isAuthRoute && user) {
    return context.redirect("/app");
  }

  context.locals.supabase = supabase;
  context.locals.user = user;

  return next();
});