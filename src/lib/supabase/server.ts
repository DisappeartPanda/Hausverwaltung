import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../../env/server";
import type { Database } from "../../types/database";

function createAstroCookieAdapter(cookies: AstroCookies): CookieMethodsServer {
  return {
    get(name) {
      return cookies.get(name)?.value;
    },
    set(name, value, options) {
      cookies.set(name, value, {
        path: "/",
        ...options,
      });
    },
    remove(name, options) {
      cookies.delete(name, {
        path: "/",
        ...options,
      });
    },
  };
}

export function createServerSupabaseClient(cookies: AstroCookies) {
  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: createAstroCookieAdapter(cookies),
    },
  );
}

export function createServiceRoleSupabaseClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt.");
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}