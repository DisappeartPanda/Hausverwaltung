import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type ObjectInsert = Database["public"]["Tables"]["objects"]["Insert"];
type ObjectRow = Database["public"]["Tables"]["objects"]["Row"];

export async function createObject(input: ObjectInsert): Promise<ObjectRow> {
  const supabase = createServerSupabaseClient();

  const objectsTable = supabase.from("objects") as any;

  const { data, error } = await objectsTable
    .insert(input)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Objekt konnte nicht erstellt werden.");
  }

  return data as ObjectRow;
}

export async function listObjectsByOrganization(
  organizationId: string
): Promise<ObjectRow[]> {
  const supabase = createServerSupabaseClient();

  const objectsTable = supabase.from("objects") as any;

  const { data, error } = await objectsTable
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Objekte konnten nicht geladen werden.");
  }

  return (data ?? []) as ObjectRow[];
}

export async function getObjectById(
  objectId: string,
  organizationId: string
): Promise<ObjectRow | null> {
  const supabase = createServerSupabaseClient();

  const objectsTable = supabase.from("objects") as any;

  const { data, error } = await objectsTable
    .select("*")
    .eq("id", objectId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Objekt konnte nicht geladen werden.");
  }

  return (data as ObjectRow | null) ?? null;
}