/// <reference types="astro/client" />

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./types/database";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user: User | null;
      session: Session | null;
    }
  }
}

export {};