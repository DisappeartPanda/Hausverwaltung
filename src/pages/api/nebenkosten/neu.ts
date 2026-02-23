import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  // Auth-Check
  const objekt_id = formData.get('objekt_id') as string;
  const { data: objekt } = await supabase
    .from('objekte')
    .select('vermieter_id')
    .eq('id', objekt_id)
    .single();
    
  if (objekt?.vermieter_id !== session.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  // Abrechnung erstellen
  const abrechnungData = {
    objekt_id,
    abrechnungsjahr: parseInt(formData.get('abrechnungsjahr') as string),
    zeitraum_von: formData.get('zeitraum_von') as string,
    zeitraum_bis: formData.get('zeitraum_bis') as string,
    status: 'Entwurf',
  };

  const { data: abrechnung, error } = await supabase
    .from('nebenkostenabrechnungen')
    .insert(abrechnungData)
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  // Positionen verarbeiten (FormData enthält Arrays als positionen[0][betrag] etc.)
  const positionen: any[] = [];
  const entries = Array.from(formData.entries());
  
  // Gruppiere nach Index
  const gruppiert = new Map();
  entries.forEach(([key, value]) => {
    const match = key.match(/positionen\[(\d+)\]\[(\w+)\]/);
    if (match) {
      const [, index, field] = match;
      if (!gruppiert.has(index)) gruppiert.set(index, {});
      gruppiert.get(index)[field] = value;
    }
  });

  // Nur Positionen mit Betrag > 0 speichern
  gruppiert.forEach((pos) => {
    const betrag = parseFloat(pos.betrag) || 0;
    if (betrag > 0) {
      positionen.push({
        abrechnung_id: abrechnung.id,
        kostenart: pos.kostenart,
        betrag,
        verteilung: pos.verteilung,
        verteilung_anteil: pos.anteil ? parseInt(pos.anteil) : null,
      });
    }
  });

  if (positionen.length > 0) {
    const { error: posError } = await supabase
      .from('nebenkosten_positionen')
      .insert(positionen);
      
    if (posError) console.error('Positions error:', posError);
  }

  return redirect(`/nebenkosten/${abrechnung.id}`);
};