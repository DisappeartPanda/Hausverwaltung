// src/pages/api/login.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

// ✅ Service-Role nur serverseitig nutzen (niemals PUBLIC_*)
const supabaseAdmin = import.meta.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Robust: JSON lesen (fallback auf text, falls nötig)
    let body: any;
    try {
      body = await request.json();
    } catch {
      const text = await request.text();
      body = JSON.parse(text || '{}');
    }

    const { email, password, rememberMe } = body ?? {};

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'E-Mail und Passwort erforderlich' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: String(email),
      password: String(password),
    });

    if (authError || !authData.user || !authData.session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Ungültige Anmeldedaten' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', authData.user.id)
      .maybeSingle();

    // Profil kann fehlen → fallback
    const role = profile?.role || 'tenant';
    const name = profile?.name || String(email);

    if (pErr) {
      // Kein harter Fail (Login soll nicht blockieren)
      console.warn('profiles select failed:', pErr.message);
    }

    // ✅ Auto-Nachpflege: wenn landlord → stelle sicher, dass es einen vermieter-record gibt
    // WICHTIG: Login darf daran NICHT scheitern (nur warnen)
    if (role === 'landlord') {
      if (!supabaseAdmin) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY fehlt – vermieter wird nicht nachgepflegt.');
      } else {
        // Vorname ableiten, falls DB-Feld (noch) NOT NULL ist
        const fullName = String(profile?.name ?? name ?? '').trim();
        const fallbackVorname =
          fullName.split(/\s+/).filter(Boolean)[0] ||
          String(email).split('@')[0] ||
          'Vermieter';

        const { error: vErr } = await supabaseAdmin
          .from('vermieter')
          .upsert(
            { user_id: authData.user.id, vorname: fallbackVorname },
            { onConflict: 'user_id' }
          );

        if (vErr) {
          console.warn('vermieter upsert failed:', vErr.message);
        }
      }
    }

    // Laufzeit: "Angemeldet bleiben" => 7 Tage, sonst 12 Stunden
    const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 12;

    // In PROD secure = true (https)
    const secure = import.meta.env.PROD;

    // ✅ Access Token (kurzlebig)
    cookies.set('auth-token', authData.session.access_token, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge,
    });

    // ✅ Refresh Token (für Erneuerung)
    cookies.set('refresh-token', authData.session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge,
    });

    // UI Cookies
    cookies.set('userRole', role, {
      path: '/',
      httpOnly: false,
      secure,
      sameSite: 'strict',
      maxAge,
    });

    cookies.set('userName', name, {
      path: '/',
      httpOnly: false,
      secure,
      sameSite: 'strict',
      maxAge,
    });

    return new Response(JSON.stringify({ success: true, role, name }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('LOGIN API ERROR:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Server-Fehler: ' + (err?.message ?? String(err)) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};