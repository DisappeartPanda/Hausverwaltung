import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type ObjectInsert = Database["public"]["Tables"]["objects"]["Insert"];
type ObjectRow = Database["public"]["Tables"]["objects"]["Row"];

export async function createObject(input: ObjectInsert): Promise<ObjectRow> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("objects")
    .insert(input)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Objekt konnte nicht erstellt werden.");
  }

  return data;
}

export async function listObjectsByOrganization(
  organizationId: string,
): Promise<ObjectRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("objects")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Objekte konnten nicht geladen werden.");
  }

  return data ?? [];
}