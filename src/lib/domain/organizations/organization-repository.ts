import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

export async function getOrganizationById(
  organizationId: string,
): Promise<OrganizationRow | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message || "Organisation konnte nicht geladen werden.");
  }

  return data;
}