import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type UnitRow = Database["public"]["Tables"]["units"]["Row"];
type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];

export async function createUnit(input: UnitInsert): Promise<UnitRow> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("units")
    .insert(input)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Wohneinheit konnte nicht erstellt werden.");
  }

  return data;
}

export async function listUnitsByOrganization(
  organizationId: string,
): Promise<UnitRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Wohneinheiten konnten nicht geladen werden.");
  }

  return data ?? [];
}