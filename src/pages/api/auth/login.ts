import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: "Bitte E-Mail und Passwort angeben.",
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

    const supabase = createServerSupabaseClient(cookies);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error?.message || "Login fehlgeschlagen.",
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const role =
      data.user.user_metadata?.role ??
      data.user.app_metadata?.role ??
      "guest";

    const redirectTo =
      role === "tenant"
        ? "/tenant"
        : "/app/dashboard";

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userId: data.user.id,
          email: data.user.email,
          role,
          redirectTo,
        },
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
          form: "Login konnte nicht verarbeitet werden.",
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