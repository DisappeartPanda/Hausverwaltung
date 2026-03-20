import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "../../types/database";

export function createServerSupabaseClient(cookies: AstroCookies) {
  return createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookies.toString());
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

// Hilfsfunktion: Aktuellen User mit Session holen
export async function getCurrentUser(cookies: AstroCookies) {
  const supabase = createServerSupabaseClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error || new Error("Nicht eingeloggt") };
  }
  
  return { user, error: null };
}

// Hilfsfunktion: Session holen
export async function getSession(cookies: AstroCookies) {
  const supabase = createServerSupabaseClient(cookies);
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { session: null, error: error || new Error("Keine Session") };
  }
  
  return { session, error: null };
}