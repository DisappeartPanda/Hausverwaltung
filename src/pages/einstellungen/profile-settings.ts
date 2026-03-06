import type { APIRoute } from 'astro';
import { requireLandlordSession } from '../../lib/supabase/serverAuth';

const txt = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

export const POST: APIRoute = async (ctx) => {
  const auth = await requireLandlordSession(ctx as any);
  if (auth instanceof Response) return auth;

  const { supabase, user } = auth;

  const form = await ctx.request.formData();

  const dashboard_mode = txt(form.get('dashboard_mode')) || 'auto';   // auto | manual
  const dashboard_layout = txt(form.get('dashboard_layout')) || 'auto'; // auto | compact | detailed
  const theme = txt(form.get('theme')) || 'dark';                    // dark | light | system

  const { error } = await supabase
    .from('profile_settings')
    .upsert(
      { user_id: user.id, dashboard_mode, dashboard_layout, theme },
      { onConflict: 'user_id' }
    );

  if (error) return new Response(error.message, { status: 400 });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};