import type { APIRoute } from 'astro';
import { requireLandlordSession } from '../../../lib/serverAuth';

export const GET: APIRoute = async (ctx) => {
  const auth = await requireLandlordSession(ctx as any);
  if (auth instanceof Response) return auth;

  const { supabase } = auth;
  const id = ctx.params.id!;

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
};