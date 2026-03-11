import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type DefectInsert = Database["public"]["Tables"]["defects"]["Insert"];
type DefectRow = Database["public"]["Tables"]["defects"]["Row"];

export async function createDefect(input: DefectInsert): Promise<DefectRow> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("defects")
    .insert(input)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Mangel konnte nicht erstellt werden.");
  }

  return data;
}

export async function listDefectsByOrganization(
  organizationId: string,
): Promise<DefectRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("defects")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Mängel konnten nicht geladen werden.");
  }

  return data ?? [];
}