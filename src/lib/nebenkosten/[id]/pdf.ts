import type { APIRoute } from 'astro';
import { supabase } from '../../supabase1/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  // Daten laden...
  const { data: abrechnung } = await supabase
    .from('nebenkostenabrechnungen')
    .select(`
      *,
      objekte(bezeichnung, adresse, vermieter_id),
      nebenkosten_positionen(*)
    `)
    .eq('id', id)
    .single();

  if (!abrechnung || abrechnung.objekte.vermieter_id !== session.user.id) {
    return new Response('Not found', { status: 404 });
  }

  // PDF erstellen
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Nebenkostenabrechnung', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Abrechnungsjahr: ${abrechnung.abrechnungsjahr}`, 20, 45);
  
  // Tabelle mit autoTable
  autoTable(doc, {
    startY: 60,
    head: [['Kostenart', 'Betrag', 'Verteilung']],
    body: abrechnung.nebenkosten_positionen.map((p: any) => [
      p.kostenart,
      `${p.betrag.toFixed(2)} €`,
      p.verteilung,
    ]),
  });

  const pdfBuffer = doc.output('arraybuffer');
  
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Nebenkosten_${abrechnung.abrechnungsjahr}.pdf"`,
    },
  });
};