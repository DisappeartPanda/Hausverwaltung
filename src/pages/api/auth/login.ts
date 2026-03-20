import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

// Einfaches In-Memory Rate Limiting (für Production besser Redis verwenden)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 Minuten

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (attempt.count >= MAX_ATTEMPTS) {
    const resetInMinutes = Math.ceil((attempt.resetTime - now) / 60000);
    return { allowed: false, remaining: 0 };
  }

  attempt.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - attempt.count };
}

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  try {
    // Rate Limiting prüfen
    const clientIp = clientAddress || "unknown";
    const rateLimit = checkRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Zu viele Anmeldeversuche. Bitte in 15 Minuten erneut versuchen.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Body parsen
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    // Validierung
    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "E-Mail und Passwort erforderlich." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Ungültige E-Mail-Adresse." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "Passwort muss mindestens 8 Zeichen haben." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Login via Supabase
    const supabase = createServerSupabaseClient(cookies);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      // Generische Fehlermeldung (nicht verraten ob E-Mail existiert)
      return new Response(
        JSON.stringify({ success: false, error: "Anmeldedaten sind ungültig." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Optional: E-Mail-Verifizierung prüfen
    // if (!data.user.email_confirmed_at) {
    //   return new Response(
    //     JSON.stringify({ success: false, error: "E-Mail nicht bestätigt." }),
    //     { status: 403, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // Erfolgreich - Session ist bereits in Cookies gesetzt
    const role = data.user.app_metadata?.role || data.user.user_metadata?.role || "guest";
    const redirectTo = role === "tenant" ? "/app/tenant" : "/app/dashboard";

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
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Login API error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Ein technischer Fehler ist aufgetreten." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};