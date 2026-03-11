import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "../../env/client";
import type { Database } from "../../types/database";

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getBrowserSupabaseClient() {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }

  return browserClient;
}