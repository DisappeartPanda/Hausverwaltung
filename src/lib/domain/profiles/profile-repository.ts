import { createServerSupabaseClient } from "../../supabase/server";
import type { AstroCookies } from "astro";

export type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  default_role: string;
  created_at: string;
};

export async function getProfileByUserId(
  cookies: AstroCookies,
  userId: string,
): Promise<ProfileRow | null> {
  const supabase = createServerSupabaseClient(cookies);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message || "Profil konnte nicht geladen werden.");
  }

  return data as ProfileRow;
}