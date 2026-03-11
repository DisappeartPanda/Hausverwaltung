import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createServerSupabaseClient(cookies);
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error.message || "Logout fehlgeschlagen.",
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        errors: {
          form: "Logout konnte nicht verarbeitet werden.",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};