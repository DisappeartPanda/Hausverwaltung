import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { AstroCookies } from "astro";

export type OrganizationMemberRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  is_default: boolean;
  created_at: string;
};

export async function listOrganizationMembershipsByUserId(
  cookies: AstroCookies,
  userId: string,
): Promise<OrganizationMemberRow[]> {
  const supabase = createServerSupabaseClient(cookies);

  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      error.message || "Organisationsmitgliedschaften konnten nicht geladen werden.",
    );
  }

  return (data ?? []) as OrganizationMemberRow[];
}

export async function getDefaultOrganizationMembershipByUserId(
  cookies: AstroCookies,
  userId: string,
): Promise<OrganizationMemberRow | null> {
  const memberships = await listOrganizationMembershipsByUserId(cookies, userId);
  return memberships.find((item) => item.is_default) ?? memberships[0] ?? null;
}