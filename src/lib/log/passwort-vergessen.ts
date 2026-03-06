import type { APIRoute } from 'astro';

type ResetRecord = {
  email: string;
  expiresAt: number;
};

// ⚠️ DEMO ONLY: In Memory (geht bei Server-Restarts verloren)
const resetTokens = (globalThis as any).__RESET_TOKENS__ ?? new Map<string, ResetRecord>();
(globalThis as any).__RESET_TOKENS__ = resetTokens;

function generateToken(): string {
  // simple random token (ok for demo). In production: crypto.randomBytes(32).toString('hex')
  return Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'E-Mail fehlt' }), { status: 400 });
    }

    // ✅ Optional: Immer "success" zurückgeben (gegen User-Enumeration)
    // Hier könntest du DB prüfen, ob email existiert. Wenn nicht existiert, trotzdem success.
    // TODO: const user = await db.user.findUnique({ where: { email } });

    const token = generateToken();
    const expiresAt = Date.now() + 1000 * 60 * 30; // 30 Minuten

    resetTokens.set(token, { email, expiresAt });

    const resetLink = `${url.origin}/passwort-zuruecksetzen?token=${encodeURIComponent(token)}`;

    // TODO: Email senden (z.B. Resend, Postmark, Nodemailer)
    // await sendMail({ to: email, subject: 'Passwort zurücksetzen', html: `<a href="${resetLink}">Reset</a>` });

    // Fürs Debuggen in der Konsole:
    console.log('[PASSWORT-RESET] Link:', resetLink);

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