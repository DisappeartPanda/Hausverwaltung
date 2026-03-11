import type { APIRoute } from "astro";
import { createServiceRoleSupabaseClient } from "../../../lib/supabase/server";
import { requireLandlordSession } from "../../../lib/auth/guards";
import { validateObjectUpdateInput } from "../../../validations/object-update";

export const POST: APIRoute = async (context) => {
  try {
    const session = await requireLandlordSession(context as any);

    if (session instanceof Response) {
      return session;
    }

    const body = await context.request.json();
    const result = validateObjectUpdateInput(body);

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
      .from("objects")
      .update({
        name: result.data.name,
        city: result.data.city,
        street: result.data.street ?? null,
        postal_code: result.data.postalCode ?? null,
      })
      .eq("id", result.data.objectId)
      .eq("organization_id", session.organizationId)
      .select()
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error?.message || "Objekt konnte nicht gespeichert werden.",
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
              : "Objekt konnte nicht aktualisiert werden.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};