import type { APIRoute } from "astro";
import { createServiceRoleSupabaseClient } from "../../../lib/supabase/server";
import { requireAppSession } from "../../../lib/auth/guards";
import { validateProfileUpdateInput } from "../../../validations/profile";

export const POST: APIRoute = async (context) => {
  try {
    const session = await requireAppSession(context as any);

    if (session instanceof Response) {
      return session;
    }

    const body = await context.request.json();
    const result = validateProfileUpdateInput(body);

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
      .from("profiles")
      .update({
        first_name: result.data.firstName,
        last_name: result.data.lastName,
        email: result.data.email,
      })
      .eq("id", session.userId)
      .select()
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error?.message || "Profil konnte nicht gespeichert werden.",
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
              : "Profil konnte nicht aktualisiert werden.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};