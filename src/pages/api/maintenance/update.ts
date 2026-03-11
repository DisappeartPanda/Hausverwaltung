import type { APIRoute } from "astro";
import { createServiceRoleSupabaseClient } from "../../../lib/supabase/server";
import { requireLandlordSession } from "../../../lib/auth/guards";
import { validateMaintenanceUpdateInput } from "../../../validations/maintenance-update";

export const POST: APIRoute = async (context) => {
  try {
    const session = await requireLandlordSession(context as any);

    if (session instanceof Response) {
      return session;
    }

    const body = await context.request.json();
    const result = validateMaintenanceUpdateInput(body);

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
      .from("maintenance")
      .update({
        title: result.data.title,
        object_id: result.data.objectId ?? null,
        scheduled_date: result.data.scheduledDate ?? null,
        status: result.data.status,
        note: result.data.note ?? null,
      })
      .eq("id", result.data.maintenanceId)
      .eq("organization_id", session.organizationId)
      .select()
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error?.message || "Wartung konnte nicht gespeichert werden.",
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
              : "Wartung konnte nicht aktualisiert werden.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};