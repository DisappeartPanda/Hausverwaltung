import type { APIRoute } from 'astro';
import type { UserRole } from '../supabase/role';
import { normalizeRole } from '../supabase/role';

type AiRequestBody = {
  message: string;
  role?: UserRole;
};

type AiResponseBody = {
  ok: true;
  reply: string;
  role: UserRole;
};

type AiErrorBody = {
  ok: false;
  error: string;
};

function buildReply(messageRaw: string, role: UserRole): string {
  const m = messageRaw.toLowerCase();

  // Beispiele: einfache intents (später ersetzbar durch “echte” KI)
  if (m.includes('mangel')) {
    if (role === 'tenant') {
      return 'Als Mieter: Öffnen Sie im Mieterbereich „Meldungen“ → „Neuer Mangel“. Bitte Fotos + kurze Beschreibung hinzufügen.';
    }
    if (role === 'landlord') {
      return 'Als Vermieter: Legen Sie einen Vorgang an und weisen Sie ihn einem Dienstleister zu. Sie können außerdem eine Priorität (z. B. „dringend“) setzen.';
    }
    return 'Sie können einen Mangel nach dem Login melden. Wenn Sie möchten, sage ich Ihnen, wo genau das im Menü ist.';
  }

  if (m.includes('nebenkosten') || m.includes('abrechnung')) {
    return role === 'tenant'
      ? 'Die Nebenkostenabrechnung wird i. d. R. jährlich bereitgestellt. Im Mieterbereich sehen Sie Status und Dokumente, sobald sie veröffentlicht sind.'
      : 'Als Vermieter können Sie die Nebenkostenabrechnung im Bereich „Abrechnungen“ erstellen und veröffentlichen.';
  }

  if (m.includes('kündig')) {
    return role === 'tenant'
      ? 'Eine Kündigung muss schriftlich erfolgen. Im Mieterbereich finden Sie eine Vorlage sowie die Kündigungsfrist aus Ihrem Vertrag.'
      : 'Als Vermieter: Kündigungen sollten dokumentiert werden. Ich kann Ihnen eine Checkliste für Fristen & Zustellung geben.';
  }

  if (m.includes('kaltmiete')) {
    return 'Die Kaltmiete ist die reine Miete ohne Betriebskosten. Betriebskosten/Nebenkosten kommen je nach Vertrag zusätzlich dazu.';
  }

  if (m.includes('miete') && (m.includes('erhöhen') || m.includes('ändern'))) {
    return role === 'landlord'
      ? 'Mieterhöhungen sind an gesetzliche Vorgaben gebunden (z. B. Begründung/Fristen). Im Vermieterbereich finden Sie Vorlagen und eine Schritt-für-Schritt-Hilfe.'
      : 'Änderungen an der Miete erfolgen i. d. R. durch den Vermieter. Bei Fragen kann ich erklären, welche Arten von Mieterhöhungen es gibt und welche Fristen gelten.';
  }

  // Default
  if (role === 'tenant') {
    return 'Ich helfe Ihnen gern. Geht es um Mängel, Dokumente (Nebenkostenabrechnung), Vertrag oder Zahlungen?';
  }
  if (role === 'landlord') {
    return 'Ich helfe Ihnen gern. Geht es um Vorgänge/Mängel, Abrechnungen, Verträge oder Kommunikation mit Mietern?';
  }
  return 'Ich helfe Ihnen gern. Wenn Sie sich einloggen, kann ich Antworten besser auf Ihre Rolle abstimmen.';
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const cookieRole = normalizeRole(cookies.get('userRole')?.value);
    const body = (await request.json()) as Partial<AiRequestBody>;

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return new Response(JSON.stringify({ ok: false, error: 'Nachricht fehlt.' } satisfies AiErrorBody), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const role = normalizeRole(body.role ?? cookieRole);

    const reply = buildReply(message, role);

    return new Response(JSON.stringify({ ok: true, reply, role } satisfies AiResponseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Ungültige Anfrage.' } satisfies AiErrorBody), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
};

// Optional: GET blocken (sauber)
export const GET: APIRoute = async () =>
  new Response(JSON.stringify({ ok: false, error: 'Use POST.' } satisfies AiErrorBody), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });