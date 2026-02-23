import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get('auth-token')?.value;
  
  if (token) {
    await supabase.auth.signOut();
  }
  
  cookies.delete('auth-token', { path: '/' });
  cookies.delete('userRole', { path: '/' });
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};