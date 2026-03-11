import type { APIRoute } from "astro";
import { createOrganization, createOrganizationMember } from "../../../lib/domain/organizations/organization-service";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const organizationName =
      typeof body?.organizationName === "string"
        ? body.organizationName.trim()
        : "";

    if (organizationName.length < 3) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            organizationName: "Bitte gib einen gültigen Organisationsnamen an.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createServerSupabaseClient(cookies);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: "Kein eingeloggter Benutzer gefunden.",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const organization = await createOrganization({
      name: organizationName,
      billingEmail: user.email ?? null,
      theme: "dark-green",
    });

    const membership = await createOrganizationMember({
      organizationId: organization.id,
      userId: user.id,
      role: "landlord",
      isDefault: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          organization,
          membership,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "Bootstrap für Verwalter fehlgeschlagen.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};