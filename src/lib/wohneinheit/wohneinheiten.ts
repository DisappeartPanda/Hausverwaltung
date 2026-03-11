import type { APIRoute } from 'astro';
import { requireLandlordSession } from '../supabase1/serverAuth';

const toError = (e: unknown) =>
  e instanceof Error ? e : new Error(typeof e === 'string' ? e : JSON.stringify(e));

export const POST: APIRoute = async (ctx) => {
  try {
    const auth = await requireLandlordSession(ctx as any);
    if (auth instanceof Response) return auth;

    const { supabase } = auth;

    const payload = await ctx.request.json().catch(() => null);
    if (!payload) return new Response('Invalid JSON', { status: 400 });

    const { data, error } = await supabase
      .from('wohneinheiten')
      .insert(payload)
      .select('id')
      .single();

    if (error) return new Response(error.message, { status: 400 });

    return new Response(JSON.stringify({ id: data.id }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const err = toError(e);
    console.error('[api/wohneinheiten] ERROR:', err);
    return new Response(err.message, { status: 500 });
  }
};