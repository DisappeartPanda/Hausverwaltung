import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url =
  import.meta.env.SUPABASE_URL ??
  import.meta.env.PUBLIC_SUPABASE_URL;

const anonKey =
  import.meta.env.SUPABASE_ANON_KEY ??
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('[Supabase ENV missing]', {
    hasUrl: !!url,
    hasAnonKey: !!anonKey,
  });
}

export function getSupabaseServer(token?: string): SupabaseClient {
  return createClient(url!, anonKey!, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

import { createServerClient } from '@supabase/ssr';

export function supabaseServer(Astro: any) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');

  return createServerClient(url, key, {
    cookies: {
      get(name) {
        return Astro.cookies.get(name)?.value;
      },
      set(name, value, options) {
        Astro.cookies.set(name, value, options);
      },
      remove(name, options) {
        Astro.cookies.delete(name, options);
      },
    },
  });
}