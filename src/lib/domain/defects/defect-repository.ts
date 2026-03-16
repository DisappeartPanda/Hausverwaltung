import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type DefectInsert = Database["public"]["Tables"]["defects"]["Insert"];
type DefectRow = Database["public"]["Tables"]["defects"]["Row"];

export async function createDefect(input: DefectInsert): Promise<DefectRow> {
  const supabase = createServerSupabaseClient();
  const defectsTable = supabase.from("defects") as any;

  const { data, error } = await defectsTable
    .insert(input)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Mangel konnte nicht erstellt werden.");
  }

  return data as DefectRow;
}

export async function listDefectsByOrganization(
  organizationId: string
): Promise<DefectRow[]> {
  const supabase = createServerSupabaseClient();
  const defectsTable = supabase.from("defects") as any;

  const { data, error } = await defectsTable
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Mängel konnten nicht geladen werden.");
  }

  return (data ?? []) as DefectRow[];
}

export async function getDefectById(
  defectId: string,
  organizationId: string
): Promise<DefectRow | null> {
  const supabase = createServerSupabaseClient();
  const defectsTable = supabase.from("defects") as any;

  const { data, error } = await defectsTable
    .select("*")
    .eq("id", defectId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Mangel konnte nicht geladen werden.");
  }

  return (data as DefectRow | null) ?? null;
}