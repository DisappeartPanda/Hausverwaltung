import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../../types/database";

// Singleton Pattern für Browser-Client
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return browserClient;
}

// Für direkte Verwendung
export const supabaseBrowser = getSupabaseBrowserClient();