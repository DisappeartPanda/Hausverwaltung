import type { APIRoute } from 'astro';
import { requireLandlordSession } from '../supabase1/serverAuth';

const toError = (e: unknown) =>
  e instanceof Error ? e : new Error(typeof e === 'string' ? e : JSON.stringify(e));

export const GET: APIRoute = async (ctx) => {
  try {
    const auth = await requireLandlordSession(ctx as any);
    if (auth instanceof Response) return auth;

    const { supabase } = auth;

    const { data, error } = await supabase
      .from('objekte')
      .select('id, bezeichnung')
      .order('bezeichnung', { ascending: true });

    if (error) return new Response(error.message, { status: 400 });

    return new Response(JSON.stringify(data ?? []), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const err = toError(e);
    console.error('[api/objekte] ERROR:', err);
    return new Response(err.message, { status: 500 });
  }
};