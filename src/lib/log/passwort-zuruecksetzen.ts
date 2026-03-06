import type { APIRoute } from 'astro';

type ResetRecord = {
  email: string;
  expiresAt: number;
};

// Global Map sauber typisieren (ohne "as any")
declare global {
  // eslint-disable-next-line no-var
  var __RESET_TOKENS__: Map<string, ResetRecord> | undefined;
}

const resetTokens: Map<string, ResetRecord> =
  globalThis.__RESET_TOKENS__ ?? new Map<string, ResetRecord>();

globalThis.__RESET_TOKENS__ = resetTokens;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({} as any));
    const token = body?.token;
    const password = body?.password;

    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Token fehlt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'Passwort zu kurz' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const record = resetTokens.get(token);
    if (!record) {
      return new Response(JSON.stringify({ success: false, error: 'Token ungültig' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (Date.now() > record.expiresAt) {
      resetTokens.delete(token);
      return new Response(JSON.stringify({ success: false, error: 'Token abgelaufen' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Token einmalig machen
    resetTokens.delete(token);

    // TODO: Passwort in DB setzen (mit Hash!)
    // const hash = await bcrypt.hash(password, 10);
    // await db.user.update({ where: { email: record.email }, data: { passwordHash: hash } });

    console.log('[PASSWORT-RESET] Passwort geändert für:', record.email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: 'Serverfehler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};