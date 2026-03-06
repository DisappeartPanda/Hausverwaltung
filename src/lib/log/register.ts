import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Service Role Key für Admin-Zugriff (volle Rechte)
const SUPABASE_URL = 'https://qsvpphpriakvemwufhgv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdnBwaHByaWFrdmVtd3VmaGd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU5OTg2NSwiZXhwIjoyMDg3MTc1ODY1fQ.16KglNbsZ8M9lu2VczpnktmWIYrNf4FWokor-6o8uiE';

// Admin-Client mit Service Role
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Normaler Client für Auth-Operationen
const supabase = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdnBwaHByaWFrdmVtd3VmaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTk4NjUsImV4cCI6MjA4NzE3NTg2NX0.ijPWoDg_iRw3BNVnfgMDuZ1pmcB0Gg2O0z_5DDTdNKE');

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();
    const { email, password, vorname, nachname, role } = JSON.parse(text);

    console.log('Registrierung:', { email, role });

    if (!email || !password || !vorname || !nachname || !role) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Alle Pflichtfelder ausfüllen' 
      }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    // 1. User direkt über Admin-API erstellen (sofort verfügbar!)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // E-Mail sofort bestätigen
      user_metadata: {
        vorname,
        nachname,
        role
      }
    });

    if (userError) {
      console.error('Admin createUser Fehler:', userError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: userError.message 
      }), { status: 400, headers: { 'Content-Type': 'application/json' }});
    }

    if (!userData.user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User nicht erstellt' 
      }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }

    const userId = userData.user.id;
    console.log('User erstellt via Admin API:', userId);

    // 2. Profil SOFORT erstellen (User existiert garantiert!)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        role: role,
        name: `${vorname} ${nachname}`
      });

    if (profileError) {
      console.error('Profil Fehler:', profileError);
      
      // Versuch: Trigger hat es schon erstellt? Dann updaten:
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role, name: `${vorname} ${nachname}` })
        .eq('id', userId);
      
      if (updateError) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Profil Fehler: ' + profileError.message 
        }), { status: 500, headers: { 'Content-Type': 'application/json' }});
      }
    }

    console.log('Registrierung komplett!');

    return new Response(JSON.stringify({
      success: true,
      message: 'Registrierung erfolgreich'
    }), { status: 200, headers: { 'Content-Type': 'application/json' }});

  } catch (err) {
    console.error('Server Fehler:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server-Fehler: ' + String(err) 
    }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
};