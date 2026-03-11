import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { createProfile } from "../../../lib/domain/profiles/profile-service";

function normalizeRole(value: unknown): "tenant" | "landlord" {
  return value === "tenant" ? "tenant" : "landlord";
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const firstName =
      typeof body?.firstName === "string" ? body.firstName.trim() : "";
    const lastName =
      typeof body?.lastName === "string" ? body.lastName.trim() : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body?.password === "string" ? body.password : "";
    const role = normalizeRole(body?.role);

    const errors: Record<string, string> = {};

    if (firstName.length < 2) {
      errors.firstName = "Bitte gib einen gültigen Vornamen an.";
    }

    if (lastName.length < 2) {
      errors.lastName = "Bitte gib einen gültigen Nachnamen an.";
    }

    if (!email) {
      errors.email = "Bitte gib eine E-Mail-Adresse an.";
    }

    if (password.length < 8) {
      errors.password = "Das Passwort muss mindestens 8 Zeichen lang sein.";
    }

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createServerSupabaseClient(cookies);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
    });

    if (error || !data.user) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: {
            form: error?.message || "Registrierung fehlgeschlagen.",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await createProfile({
      userId: data.user.id,
      email: data.user.email ?? email,
      firstName,
      lastName,
      defaultRole: role,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userId: data.user.id,
          email: data.user.email ?? email,
          role,
          requiresEmailConfirmation: !data.session,
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
              : "Registrierung konnte nicht verarbeitet werden.",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};