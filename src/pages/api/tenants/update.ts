import type { APIRoute } from "astro";
import { createServiceRoleSupabaseClient } from "../../../lib/supabase/server";
import { requireLandlordSession } from "../../../lib/auth/guards";
import { validateTenantUpdateInput } from "../../../validations/tenant-update";

export const POST: APIRoute = async (context) => {
  try {
    const session = await requireLandlordSession(context as any);

    if (session instanceof Response) {
      return session;
    }

    const body = await context.request.json();
    const result = validateTenantUpdateInput(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: result.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data, error } = await supabase
      .from("tenants")
      .update({
        first_name: result.data.firstName,
        last_name: result.data.lastName,
        email: result.data.email,
        phone: result.data.phone ?? null,
        unit_id: result.data.unitId ?? null,
        move_in_date: result.data.moveInDate ?? null,
      })
      .eq("id", result.data.tenantId)
      .eq("organization_id", session.organizationId)
      .select()
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error?.message || "Mieter konnte nicht gespeichert werden.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
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
              : "Mieter konnte nicht aktualisiert werden.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};