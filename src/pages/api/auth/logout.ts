import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { ROUTES } from "../../../lib/constants/routes";

export const ALL: APIRoute = async ({ cookies, redirect }) => {
  const supabase = createServerSupabaseClient(cookies);

  await supabase.auth.signOut();

  return redirect(ROUTES.AUTH_LOGIN);
};