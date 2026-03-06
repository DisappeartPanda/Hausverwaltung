import type { APIRoute } from 'astro';
import { requireLandlordSession } from '../supabase/serverAuth';

const toError = (e: unknown) =>
  e instanceof Error ? e : new Error(typeof e === 'string' ? e : JSON.stringify(e));

export const DELETE: APIRoute = async (ctx) => {
  try {
    const auth = await requireLandlordSession(ctx as any);
    if (auth instanceof Response) return auth;

    const { supabase } = auth as any;

    // user
    const { data: userWrap, error: userErr } = await supabase.auth.getUser();
    const userId = userWrap?.user?.id ?? null;
    if (userErr || !userId) return new Response('Unauthorized', { status: 401 });

    const id = String(ctx.params.id ?? '');
    if (!id) return new Response('Missing id', { status: 400 });

    // ownership check
    const { data: unit, error: unitErr } = await supabase
      .from('wohneinheiten')
      .select('id, eigentuemer_id')
      .eq('id', id)
      .maybeSingle();

    if (unitErr) return new Response(unitErr.message, { status: 400 });
    if (!unit) return new Response('Not found', { status: 404 });
    if (unit.eigentuemer_id !== userId) return new Response('Forbidden', { status: 403 });

    // delete tenant(s) first
    const { error: delMieterErr } = await supabase.from('mieter').delete().eq('wohneinheit_id', id);
    if (delMieterErr) return new Response(delMieterErr.message, { status: 400 });

    // delete unit
    const { error: delUnitErr } = await supabase.from('wohneinheiten').delete().eq('id', id);
    if (delUnitErr) return new Response(delUnitErr.message, { status: 400 });

    return new Response(JSON.stringify({ ok: true, id }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const err = toError(e);
    console.error('[api/wohneinheiten/:id] DELETE ERROR:', err);
    return new Response(err.message, { status: 500 });
  }
};