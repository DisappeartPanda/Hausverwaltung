import type { APIRoute } from 'astro';
import { requireLandlordSession } from '../supabase/serverAuth';

const txt = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');
const int = (v: FormDataEntryValue | null) => {
  const n = Number(typeof v === 'string' ? v : '');
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

export const POST: APIRoute = async (ctx) => {
  const auth = await requireLandlordSession(ctx as any);
  if (auth instanceof Response) return auth;

  const { supabase, user } = auth;

  const form = await ctx.request.formData();

  // Basis (falls du name/telefon schon in profiles hast, kannst du es hier ebenfalls updaten)
  const name = txt(form.get('name')) || null;
  const telefon = txt(form.get('telefon')) || null;

  // Deine neuen Felder
  const vermieter_typ = txt(form.get('vermieter_typ')) || null; // privat | gmbh | holding | ...
  const strategie = txt(form.get('strategie')) || null;         // cashflow | wertsteigerung | mix
  const portfolio_ziel = int(form.get('portfolio_ziel'));       // int
  const ziele = txt(form.get('ziele')) || null;
  const wuensche = txt(form.get('wuensche')) || null;
  const notizen = txt(form.get('notizen')) || null;

  const payload: Record<string, any> = {
    id: user.id,
    vermieter_typ,
    strategie,
    portfolio_ziel,
    ziele,
    wuensche,
    notizen,
  };

  // optional nur setzen, wenn du die Spalten wirklich in profiles hast:
  // (wenn bei dir "name" / "telefon" existiert, ist das top. Wenn nicht, einfach weglassen.)
  payload.name = name;
  payload.telefon = telefon;

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

  if (error) return new Response(error.message, { status: 400 });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};