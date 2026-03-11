import type { APIRoute } from "astro";
import { createOrganizationMember } from "../../../lib/domain/organizations/organization-service";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const organizationId =
      typeof body?.organizationId === "string"
        ? body.organizationId.trim()
        : "";

    if (!organizationId) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            organizationId: "Bitte gib eine Organisation an.",
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

    const membership = await createOrganizationMember({
      organizationId,
      userId: user.id,
      role: "tenant",
      isDefault: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
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
              : "Bootstrap für Mieter fehlgeschlagen.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};