import { defineMiddleware } from "astro:middleware";
import { createServerSupabaseClient } from "./lib/supabase/server";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerSupabaseClient(context.cookies);

  const [{ data: sessionData }, { data: userData }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ]);

  context.locals.supabase = supabase;
  context.locals.session = sessionData.session ?? null;
  context.locals.user = userData.user ?? null;

  return next();
});