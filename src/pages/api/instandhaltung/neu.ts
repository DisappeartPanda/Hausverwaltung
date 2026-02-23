import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  // Validierung
  const objekt_id = formData.get('objekt_id') as string;
  
  // Sicherheitscheck
  const { data: objekt } = await supabase
    .from('objekte')
    .select('vermieter_id')
    .eq('id', objekt_id)
    .single();
    
  if (objekt?.vermieter_id !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  // Daten extrahieren
  const wartungData = {
    objekt_id,
    kategorie: formData.get('kategorie') as string,
    position: formData.get('position') as string || null,
    datum: formData.get('datum') as string,
    naechste_wartung: formData.get('naechste_wartung') as string || null,
    beschreibung: formData.get('beschreibung') as string,
    kosten_material: parseFloat(formData.get('kosten_material') as string) || 0,
    kosten_lohn: parseFloat(formData.get('kosten_lohn') as string) || 0,
    kosten_sonstige: parseFloat(formData.get('kosten_sonstige') as string) || 0,
    durchgefuehrt_von: formData.get('durchgefuehrt_von') as string || null,
    kontakt: formData.get('kontakt') as string || null,
    rechnungsnummer: formData.get('rechnungsnummer') as string || null,
    status: formData.get('status') as string || 'Erledigt',
    erinnerung_aktiv: formData.get('erinnerung_aktiv') === 'true',
    erinnerung_tage: parseInt(formData.get('erinnerung_tage') as string) || 14,
  };

  // Insert
  const { data: wartung, error } = await supabase
    .from('instandhaltung')
    .insert(wartungData)
    .select()
    .single();

  if (error) {
    console.error('Insert error:', error);
    return new Response(error.message, { status: 500 });
  }

  // Belege verarbeiten (hier nur simuliert - in Produktion zu Supabase Storage hochladen)
  const belege = formData.getAll('belege') as File[];
  if (belege.length > 0 && belege[0].size > 0) {
    // Upload zu Supabase Storage und Einträge in instandhaltung_belege
    for (const file of belege) {
      const fileName = `${Date.now()}_${file.name}`;
      
      // Upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('instandhaltung-belege')
        .upload(`${wartung.id}/${fileName}`, file);
        
      if (!uploadError) {
        // DB-Eintrag
        await supabase.from('instandhaltung_belege').insert({
          instandhaltung_id: wartung.id,
          dateiname: file.name,
          url: uploadData.path,
          typ: file.type,
        });
      }
    }
  }

  return redirect(`/instandhaltung/${wartung.id}`);
};