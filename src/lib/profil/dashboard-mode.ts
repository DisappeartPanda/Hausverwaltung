import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../supabase/supabaseServer';
import type { DashboardMode } from '../dashboard/dashboardModes';

export const POST: APIRoute = async ({ request, cookies }) => {
  const access = cookies.get('sb-access-token')?.value;
  if (!access) return new Response('Unauthorized', { status: 401 });

  const supabase = getSupabaseServer(access);
  const { data: userWrap } = await supabase.auth.getUser(access);
  const user = userWrap?.user;
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await request.json().catch(() => null) as { mode?: DashboardMode } | null;
  const mode = body?.mode;

  if (!mode || !['auto','compact','standard','focus'].includes(mode)) {
    return new Response('Bad Request', { status: 400 });
  }

  const { error } = await supabase
    .from('profile_settings')
    .upsert({ user_id: user.id, dashboard_mode: mode }, { onConflict: 'user_id' });

  if (error) return new Response('DB Error', { status: 500 });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};