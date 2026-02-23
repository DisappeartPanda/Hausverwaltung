import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'E-Mail und Passwort erforderlich' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Ungültige Anmeldedaten' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', authData.user.id)
      .single();

    cookies.set('auth-token', authData.session!.access_token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    cookies.set('userRole', profile?.role || 'tenant', {
      path: '/',
      httpOnly: false,
      secure: import.meta.env.PROD,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({
      success: true,
      role: profile?.role || 'tenant',
      name: profile?.name || email,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server-Fehler' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};