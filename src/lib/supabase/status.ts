import type { APIRoute } from 'astro';
import { supabase } from './supabase';

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get('auth-token')?.value;

  if (!token) {
    return new Response(JSON.stringify({ role: 'guest' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Token bei Supabase validieren
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    // Ungültiger Token - Cookies löschen
    cookies.delete('auth-token', { path: '/' });
    cookies.delete('userRole', { path: '/' });
    
    return new Response(JSON.stringify({ role: 'guest' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Profil laden
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single();

  return new Response(JSON.stringify({
    role: profile?.role || 'tenant',
    name: profile?.name || user.email,
    id: user.id,
    email: user.email
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};