import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServer } from './supabaseServer';

type AstroLike = {
  request: Request;
  cookies: {
    get: (name: string) => { value?: string } | undefined;
    set: (name: string, value: string, opts: any) => void;
  };
  redirect: (path: string) => Response;
};

export type ServerAuthResult = {
  supabase: SupabaseClient;
  user: User;
  accessToken: string;
};

// ✅ Neu: kann auch eine Response zurückgeben (Redirect)
export type ServerAuthOrRedirect = ServerAuthResult | Response;

const isResponse = (v: unknown): v is Response => {
  return typeof Response !== 'undefined' && v instanceof Response;
};

const toError = (e: unknown, fallback = 'Auth Fehler') => {
  if (e instanceof Error) return e;
  const anyE = e as any;
  const msg =
    anyE?.message ??
    anyE?.error_description ??
    anyE?.details ??
    (typeof e === 'string' ? e : fallback);
  return new Error(String(msg));
};

/**
 * Zentrale SSR-Auth (Redirects werden RETURNED, nicht geworfen!)
 */
export async function requireLandlordSession(Astro: AstroLike): Promise<ServerAuthOrRedirect> {
  const secure = import.meta.env.PROD;
  const maxAge = 60 * 60 * 24 * 7;

  const setAuthCookies = (accessToken: string, refreshToken: string) => {
    Astro.cookies.set('auth-token', accessToken, { path: '/', httpOnly: true, secure, sameSite: 'strict', maxAge });
    Astro.cookies.set('refresh-token', refreshToken, { path: '/', httpOnly: true, secure, sameSite: 'strict', maxAge });
  };

  const clearAuthCookies = () => {
    Astro.cookies.set('auth-token', '', { path: '/', httpOnly: true, secure, sameSite: 'strict', maxAge: 0 });
    Astro.cookies.set('refresh-token', '', { path: '/', httpOnly: true, secure, sameSite: 'strict', maxAge: 0 });
    Astro.cookies.set('userRole', '', { path: '/', httpOnly: false, secure, sameSite: 'strict', maxAge: 0 });
    Astro.cookies.set('auth-retry', '', { path: '/', httpOnly: true, secure, sameSite: 'strict', maxAge: 0 });
  };

  try {
    const access = Astro.cookies.get('auth-token')?.value;
    const refresh = Astro.cookies.get('refresh-token')?.value;
    const role = Astro.cookies.get('userRole')?.value;

    // Role-Guard
    if (!access || role !== 'landlord') {
      clearAuthCookies();
      return Astro.redirect('/login');
    }

    // SSR Client (mit Authorization Header)
    let accessToken = access;
    let supabase = getSupabaseServer(accessToken);

    // 1) Access token prüfen
    let { data: userWrap, error: userErr } = await supabase.auth.getUser(accessToken);
    let user = userWrap?.user ?? null;

    const isBadJwt = !!(userErr && (userErr as any).code === 'bad_jwt');

    // 2) Refresh wenn nötig
    if ((!user || userErr) && isBadJwt) {
      if (!refresh) {
        clearAuthCookies();
        return Astro.redirect('/login');
      }

      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession({
        refresh_token: refresh,
      });

      const session = refreshed?.session ?? null;

      // 2a) Refresh Token wurde schon von einem Parallel-Request rotiert
      if (refreshErr && (refreshErr as any).code === 'refresh_token_already_used') {
        const alreadyRetried = Astro.cookies.get('auth-retry')?.value === '1';

        if (!alreadyRetried) {
          Astro.cookies.set('auth-retry', '1', { path: '/', httpOnly: true, secure, sameSite: 'strict', maxAge: 15 });

          const url = new URL(Astro.request.url);
          url.searchParams.set('__retry', String(Date.now()));

          return Astro.redirect(url.pathname + url.search);
        }

        clearAuthCookies();
        return Astro.redirect('/login');
      }

      // 2b) Normaler Refresh fail
      if (refreshErr || !session) {
        clearAuthCookies();
        return Astro.redirect('/login');
      }

      // 3) Cookies aktualisieren (wichtig wegen Rotation)
      setAuthCookies(session.access_token, session.refresh_token);

      // 4) Weiterarbeiten mit neuem Access Token
      accessToken = session.access_token;
      supabase = getSupabaseServer(accessToken);

      const res2 = await supabase.auth.getUser(accessToken);
      user = res2.data.user ?? null;

      if (!user) {
        clearAuthCookies();
        return Astro.redirect('/login');
      }
    }

    // 5) Erfolg: retry-cookie wieder entfernen (falls gesetzt)
    Astro.cookies.set('auth-retry', '', { path: '/', httpOnly: true, secure, sameSite: 'strict', maxAge: 0 });

    if (!user) {
      clearAuthCookies();
      return Astro.redirect('/login');
    }

    return { supabase, user, accessToken };
  } catch (e) {
    // falls irgendwo doch eine Response auftaucht
    if (isResponse(e)) return e;
    throw toError(e);
  }
}