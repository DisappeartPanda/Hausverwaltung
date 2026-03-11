import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import type { Database } from "../../types/database";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

function createCookieAdapter(cookies: AstroCookies) {
  return {
    get(key: string) {
      return cookies.get(key)?.value;
    },
    set(key: string, value: string, options: CookieOptions) {
      cookies.set(key, value, options);
    },
    remove(key: string, options: CookieOptions) {
      cookies.delete(key, options);
    },
  };
}

export function createServerSupabaseClient(cookies?: AstroCookies) {
  if (!cookies) {
    return createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey || supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: createCookieAdapter(cookies),
  });
}

export function createServiceRoleSupabaseClient() {
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey || supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export const createSupabaseServerClient = createServerSupabaseClient;