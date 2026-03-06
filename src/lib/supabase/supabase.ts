import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

// Typen für die neuen Tabellen
export interface Instandhaltung {
  id: string;
  objekt_id: string;
  datum: string;
  naechste_wartung: string | null;
  kategorie: 'Dach/Fassade' | 'Heizung/Sanitär' | 'Fenster/Türen' | 'Elektro/Sicherheit' | 'Außenanlagen' | 'Lüftung/Klima' | 'Sonstiges';
  position: string | null;
  beschreibung: string;
  kosten_material: number;
  kosten_lohn: number;
  kosten_sonstige: number;
  durchgefuehrt_von: string | null;
  kontakt: string | null;
  status: 'Geplant' | 'In Bearbeitung' | 'Erledigt' | 'Überfällig';
  rechnungsnummer: string | null;
  erinnerung_aktiv: boolean;
  erinnerung_tage: number;
  erstellt_am: string;
  aktualisiert_am: string;
  // Joined data
  objekte?: { bezeichnung: string; adresse: string };
  belege?: InstandhaltungBeleg[];
}

export interface InstandhaltungBeleg {
  id: string;
  dateiname: string;
  url: string;
  typ: string | null;
}

export interface NebenkostenAbrechnung {
  id: string;
  objekt_id: string;
  abrechnungsjahr: number;
  zeitraum_von: string;
  zeitraum_bis: string;
  status: 'Entwurf' | 'Versendet' | 'Abgeschlossen';
  erstellt_am: string;
  versendet_am: string | null;
  objekte?: { bezeichnung: string; adresse: string };
  positionen?: NebenkostenPosition[];
  summen?: {
    gesamtkosten: number;
    warme_kosten: number;
    kalte_kosten: number;
  };
}

export interface NebenkostenPosition {
  id: string;
  kostenart: string;
  betrag: number;
  verteilung: 'flaeche' | 'verbrauch' | 'anteil' | 'fix';
  verteilung_anteil: number | null;
  notizen: string | null;
}

export interface Ruecklage {
  id: string;
  objekt_id: string;
  jahr: number;
  eingezahlt: number;
  ausgegeben: number;
  stand: number;
  notizen: string | null;
  objekte?: { bezeichnung: string; adresse: string };
}

// Hilfsfunktionen für Datenabfragen
export async function getAnstehendeWartungen(vermieterId: string, tage: number = 30) {
  const zielDatum = new Date();
  zielDatum.setDate(zielDatum.getDate() + tage);
  
  const { data, error } = await supabase
    .from('instandhaltung')
    .select('*, objekte(bezeichnung, adresse)')
    .eq('status', 'Geplant')
    .lte('naechste_wartung', zielDatum.toISOString().split('T')[0])
    .order('naechste_wartung', { ascending: true });
    
  if (error) throw error;
  return data || [];
}

export async function getWartungsStatistiken(objektId: string) {
  const { data, error } = await supabase
    .from('instandhaltung')
    .select('kategorie, status, kosten_material, kosten_lohn, kosten_sonstige')
    .eq('objekt_id', objektId);
    
  if (error) throw error;
  
  // Aggregation im Client
  const stats = {
    total: data?.length || 0,
    nachKategorie: {} as Record<string, number>,
    nachStatus: {} as Record<string, number>,
    gesamtkosten: 0
  };
  
  data?.forEach(w => {
    stats.nachKategorie[w.kategorie] = (stats.nachKategorie[w.kategorie] || 0) + 1;
    stats.nachStatus[w.status] = (stats.nachStatus[w.status] || 0) + 1;
    stats.gesamtkosten += (w.kosten_material || 0) + (w.kosten_lohn || 0) + (w.kosten_sonstige || 0);
  });
  
  return stats;
}