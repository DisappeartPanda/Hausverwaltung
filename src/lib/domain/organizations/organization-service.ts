import { createServiceRoleSupabaseClient } from "../../supabase/server";

export type CreateOrganizationInput = {
  name: string;
  billingEmail?: string | null;
  theme?: "dark-green" | "dark-blue" | "light";
};

export type CreateOrganizationMemberInput = {
  organizationId: string;
  userId: string;
  role: "tenant" | "landlord";
  isDefault?: boolean;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createOrganization(input: CreateOrganizationInput) {
  const supabase = createServiceRoleSupabaseClient();

  const slugBase = slugify(input.name);
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      slug,
      billing_email: input.billingEmail ?? null,
      theme: input.theme ?? "dark-green",
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Organisation konnte nicht erstellt werden.");
  }

  return data;
}

export async function createOrganizationMember(
  input: CreateOrganizationMemberInput,
) {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("organization_members")
    .insert({
      organization_id: input.organizationId,
      user_id: input.userId,
      role: input.role,
      is_default: input.isDefault ?? true,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      error?.message || "Organisationsmitgliedschaft konnte nicht erstellt werden.",
    );
  }

  return data;
}