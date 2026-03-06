import type { APIRoute } from 'astro';
import { supabase } from '../../supabase/supabase';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  const formData = await request.formData();
  const status = formData.get('status') as string;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  // Sicherheitscheck: Gehört die Wartung diesem Vermieter?
  const { data: wartung } = await supabase
    .from('instandhaltung')
    .select('objekt_id')
    .eq('id', id)
    .single();

  if (!wartung) return new Response('Not found', { status: 404 });

  const { data: objekt } = await supabase
    .from('objekte')
    .select('vermieter_id')
    .eq('id', wartung.objekt_id)
    .single();

  if (objekt?.vermieter_id !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  // Update durchführen
  const { error } = await supabase
    .from('instandhaltung')
    .update({ status, aktualisiert_am: new Date().toISOString() })
    .eq('id', id);

  if (error) return new Response(error.message, { status: 500 });

  return redirect(`/instandhaltung/${id}`);
};