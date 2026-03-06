import type { APIRoute } from 'astro';
import { requireLandlordSession } from '../supabase/serverAuth';

const toError = (e: unknown) =>
  e instanceof Error ? e : new Error(typeof e === 'string' ? e : JSON.stringify(e));

/**
 * GET /api/objekte/:id
 * (dein bisheriger Code, leicht gehärtet)
 */
export const GET: APIRoute = async (ctx) => {
  try {
    const auth = await requireLandlordSession(ctx as any);
    if (auth instanceof Response) return auth;

    const { supabase } = auth as any;
    const id = String(ctx.params.id ?? '');
    if (!id) return new Response('Missing id', { status: 400 });

    const { data, error } = await supabase
      .from('objekte')
      .select('id, bezeichnung')
      .eq('id', id)
      .maybeSingle();

    if (error) return new Response(error.message, { status: 400 });
    if (!data) return new Response('Not found', { status: 404 });

    return new Response(JSON.stringify(data), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const err = toError(e);
    console.error('[api/objekte/:id] GET ERROR:', err);
    return new Response(err.message, { status: 500 });
  }
};

/**
 * DELETE /api/objekte/:id
 *
 * Löscht:
 * 1) alle Mieter der Wohneinheiten des Objekts
 * 2) alle Wohneinheiten des Objekts
 * 3) das Objekt selbst
 *
 * Ownership:
 * - Objekt muss dem eingeloggten User gehören (objekte.vermieter_id === user.id)
 *   (Wenn du anders prüfst: hier anpassen.)
 */
export const DELETE: APIRoute = async (ctx) => {
  try {
    const auth = await requireLandlordSession(ctx as any);
    if (auth instanceof Response) return auth;

    const { supabase } = auth as any;

    // user
    const { data: userWrap, error: userErr } = await supabase.auth.getUser();
    const userId = userWrap?.user?.id ?? null;
    if (userErr || !userId) return new Response('Unauthorized', { status: 401 });

    const objektId = String(ctx.params.id ?? '');
    if (!objektId) return new Response('Missing id', { status: 400 });

    // 0) Ownership check über objekte.vermieter_id
    const { data: obj, error: objErr } = await supabase
      .from('objekte')
      .select('id, vermieter_id')
      .eq('id', objektId)
      .maybeSingle();

    if (objErr) return new Response(objErr.message, { status: 400 });
    if (!obj) return new Response('Not found', { status: 404 });
    if (obj.vermieter_id !== userId) return new Response('Forbidden', { status: 403 });

    // 1) Wohneinheiten-IDs zum Objekt holen
    const { data: units, error: unitsErr } = await supabase
      .from('wohneinheiten')
      .select('id')
      .eq('objekt_id', objektId);

    if (unitsErr) return new Response(unitsErr.message, { status: 400 });

    const unitIds = (units ?? []).map((u: any) => u.id).filter(Boolean);

    // 2) Mieter löschen, die an diesen Einheiten hängen
    if (unitIds.length > 0) {
      const { error: delMieterErr } = await supabase
        .from('mieter')
        .delete()
        .in('wohneinheit_id', unitIds);

      if (delMieterErr) return new Response(delMieterErr.message, { status: 400 });
    }

    // 3) Wohneinheiten löschen
    const { error: delUnitsErr } = await supabase
      .from('wohneinheiten')
      .delete()
      .eq('objekt_id', objektId);

    if (delUnitsErr) return new Response(delUnitsErr.message, { status: 400 });

    // 4) Objekt löschen
    const { error: delObjErr } = await supabase.from('objekte').delete().eq('id', objektId);
    if (delObjErr) return new Response(delObjErr.message, { status: 400 });

    return new Response(JSON.stringify({ ok: true, id: objektId, deleted_units: unitIds.length }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const err = toError(e);
    console.error('[api/objekte/:id] DELETE ERROR:', err);
    return new Response(err.message, { status: 500 });
  }
};