import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type UnitRow = Database["public"]["Tables"]["units"]["Row"];
type UnitInsert = Database["public"]["Tables"]["units"]["Insert"];

export async function createUnit(input: UnitInsert): Promise<UnitRow> {
  const supabase = createServerSupabaseClient();
  const unitsTable = supabase.from("units") as any;

  const { data, error } = await unitsTable
    .insert(input)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Wohneinheit konnte nicht erstellt werden.");
  }

  return data as UnitRow;
}

export async function listUnitsByOrganization(
  organizationId: string
): Promise<UnitRow[]> {
  const supabase = createServerSupabaseClient();
  const unitsTable = supabase.from("units") as any;

  const { data, error } = await unitsTable
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Wohneinheiten konnten nicht geladen werden.");
  }

  return (data ?? []) as UnitRow[];
}

export async function getUnitById(
  unitId: string,
  organizationId: string
): Promise<UnitRow | null> {
  const supabase = createServerSupabaseClient();
  const unitsTable = supabase.from("units") as any;

  const { data, error } = await unitsTable
    .select("*")
    .eq("id", unitId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Wohneinheit konnte nicht geladen werden.");
  }

  return (data as UnitRow | null) ?? null;
}