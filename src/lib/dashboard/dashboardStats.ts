import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServer } from '../supabase1/supabaseServer';
import type { DashboardMode, ResolvedDashboardMode } from './dashboardModes';
import { resolveDashboardMode } from './dashboardModes';

export type ScoreBucket = 'daten' | 'vermietung' | 'wartung' | 'zahlungen';

export type ScoreBreakdown = {
  total: number; // 0..100
  buckets: Record<ScoreBucket, number>; // 0..25 each
  reasons: {
    daten: string[];
    vermietung: string[];
    wartung: string[];
    zahlungen: string[];
  };
  nextGains: { points: number; text: string; href?: string }[];
};

export interface DashboardStats {
  objekte: number;
  einheiten: number;
  vermietet: number;
  mieter: number;

  wartungenOffen: number;
  wartungenUeberfaellig: number;

  mieteGesamt: number;
  leerstandRate: number;

  // ✅ “SaaS Score”
  score: number;
  scoreFarbe: string;
  scoreText: string;
  scoreSubtext: string;

  // ✅ Score Erklärung
  scoreBreakdown: ScoreBreakdown;

  // Zahlungen (Ist) aus mietzahlungen
  zahlungen30Summe: number;
  zahlungen30Delta: number;
  zahlungenOffen: number;
  zahlungenUeberfaellig: number;
}

type OBJ = { id: string; name?: string | null; adresse?: string | null; plz?: string | null; stadt?: string | null };
type WE = {
  id: string;
  objekt_id: string;
  status: string | null;
  kaltmiete: number | null;
  bezeichnung?: string | null;
  zimmer_anzahl?: number | null;
  wohnflaeche_qm?: number | null;
};
type MT = { id: string; wohneinheit_id: string | null };
type INS = { status: string | null; naechste_wartung: string | null; objekt_id: string | null };
type MV = { id: string; wohneinheit_id: string | null };

type MZ = {
  betrag: number | null;
  status: string | null;
  zahlungsdatum?: string | null;
  zahlungsmonat?: string | null;
};

type DashboardResult = {
  stats: DashboardStats;
  dashboardMode: DashboardMode;
  resolvedMode: ResolvedDashboardMode;
  session?: { access_token: string; refresh_token: string };
};

function isValidDashboardMode(x: any): x is DashboardMode {
  return x === 'auto' || x === 'compact' || x === 'standard' || x === 'focus';
}

async function getProfileDashboardMode(supabase: SupabaseClient, userId: string): Promise<DashboardMode> {
  const { data, error } = await supabase
    .from('profile_settings')
    .select('dashboard_mode')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return 'auto';
  const mode = data?.dashboard_mode ?? 'auto';
  return isValidDashboardMode(mode) ? mode : 'auto';
}

export async function getDashboardData(accessToken: string, refreshToken?: string): Promise<DashboardResult> {
  let token = accessToken;
  let supabase: SupabaseClient = getSupabaseServer(token);

  let { data: userWrap, error: userErr } = await supabase.auth.getUser(token);
  let user = userWrap?.user ?? null;

  const isBadJwt = !!(userErr && (userErr as any).code === 'bad_jwt');
  let refreshedSession: DashboardResult['session'] | undefined;

  if ((!user || userErr) && isBadJwt && refreshToken) {
    const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    const session = refreshed?.session ?? null;

    if (!refreshErr && session) {
      refreshedSession = { access_token: session.access_token, refresh_token: session.refresh_token };

      token = session.access_token;
      supabase = getSupabaseServer(token);

      const res2 = await supabase.auth.getUser(token);
      user = res2.data.user ?? null;
      userErr = res2.error;
    }
  }

  const now = new Date();
  const emptyStats = buildStats(
    { objekte: [], wohneinheiten: [], mieter: [], instandhaltung: [], mietzahlungen: [] },
    now
  );
  const emptyMode: DashboardMode = 'auto';

  if (userErr || !user) {
    return {
      stats: emptyStats,
      dashboardMode: emptyMode,
      resolvedMode: resolveDashboardMode(emptyMode, emptyStats.einheiten),
      session: refreshedSession,
    };
  }

  const dashboardMode = await getProfileDashboardMode(supabase, user.id);

  // Owned units
  const { data: ownedUnits, error: ownedUnitsErr } = await supabase
    .from('wohneinheiten')
    .select('id, objekt_id, status, kaltmiete, bezeichnung, zimmer_anzahl, wohnflaeche_qm')
    .eq('eigentuemer_id', user.id)
    .returns<WE[]>();

  if (ownedUnitsErr) {
    const stats = buildStats(
      { objekte: [], wohneinheiten: [], mieter: [], instandhaltung: [], mietzahlungen: [] },
      now
    );
    return {
      stats,
      dashboardMode,
      resolvedMode: resolveDashboardMode(dashboardMode, stats.einheiten),
      session: refreshedSession,
    };
  }

  const wohneinheiten: WE[] = ownedUnits ?? [];
  const wohneinheitIds = wohneinheiten.map((w) => w.id);
  const objektIds = Array.from(new Set(wohneinheiten.map((u) => u.objekt_id).filter(Boolean)));

  // objekte (für Datenqualität)
  const { data: objekteRows } = objektIds.length
    ? await supabase.from('objekte').select('id, name, adresse, plz, stadt').in('id', objektIds).returns<OBJ[]>()
    : { data: [] as OBJ[] };
  const objekte: OBJ[] = objekteRows ?? [];

  // mieter
  const { data: mieter } = wohneinheitIds.length
    ? await supabase.from('mieter').select('id, wohneinheit_id').in('wohneinheit_id', wohneinheitIds).returns<MT[]>()
    : { data: [] as MT[] };

  // instandhaltung
  const instTable = 'instandhaltungen';
  const { data: instandhaltung } = objektIds.length
    ? await supabase
        .from(instTable)
        .select('status, naechste_wartung, objekt_id')
        .in('objekt_id', objektIds)
        .returns<INS[]>()
    : { data: [] as INS[] };

  // mietverträge -> ids
  const mietvertragIds = await loadMietvertragIdsForUnits(supabase, wohneinheitIds);

  // mietzahlungen 60T
  const mietzahlungen = await loadMietzahlungen60T(supabase, mietvertragIds, now);

  const stats = buildStats(
    { objekte, wohneinheiten, mieter: mieter ?? [], instandhaltung: instandhaltung ?? [], mietzahlungen },
    now
  );

  return {
    stats,
    dashboardMode,
    resolvedMode: resolveDashboardMode(dashboardMode, stats.einheiten),
    session: refreshedSession,
  };
}

/* ---------------------------- Loaders ---------------------------- */

const dayMs = 24 * 60 * 60 * 1000;

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function loadMietvertragIdsForUnits(supabase: SupabaseClient, wohneinheitIds: string[]): Promise<string[]> {
  if (!wohneinheitIds.length) return [];
  const { data, error } = await supabase
    .from('mietvertraege')
    .select('id, wohneinheit_id')
    .in('wohneinheit_id', wohneinheitIds)
    .returns<MV[]>();

  if (error || !data?.length) return [];
  return Array.from(new Set(data.map((r) => r.id).filter(Boolean)));
}

async function loadMietzahlungen60T(supabase: SupabaseClient, mietvertragIds: string[], now: Date): Promise<MZ[]> {
  if (!mietvertragIds.length) return [];
  const start60 = new Date(now.getTime() - 60 * dayMs);

  // try zahlungsdatum
  {
    const { data, error } = await supabase
      .from('mietzahlungen')
      .select('betrag, status, zahlungsdatum')
      .in('mietvertrag_id', mietvertragIds)
      .gte('zahlungsdatum', isoDate(start60))
      .lte('zahlungsdatum', isoDate(now))
      .returns<MZ[]>();

    if (!error) return data ?? [];
    const msg = String(error.message ?? '');
    const isMissingCol = msg.includes('column') && msg.includes('zahlungsdatum') && msg.includes('does not exist');
    if (!isMissingCol) return [];
  }

  // fallback zahlungsmonat
  {
    const { data, error } = await supabase
      .from('mietzahlungen')
      .select('betrag, status, zahlungsmonat')
      .in('mietvertrag_id', mietvertragIds)
      .gte('zahlungsmonat', isoDate(start60))
      .lte('zahlungsmonat', isoDate(now))
      .returns<MZ[]>();

    if (error) return [];
    return data ?? [];
  }
}

/* --------------------------- Helpers --------------------------- */

function lower(x: unknown) {
  return String(x ?? '').trim().toLowerCase();
}

function amount(x: unknown) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function parseDateOnly(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(`${s}T00:00:00`);
  return Number.isFinite(d.getTime()) ? d : null;
}

/* --------------------------- Score Logic --------------------------- */

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function scoreMeta(total: number) {
  // Farb-/Textskala wie du sie schon nutzt, nur konsistent
  let farbe = '#22c55e';
  let text = 'Optimal';
  let subtext = 'Alles läuft perfekt!';

  if (total < 90) { farbe = '#84cc16'; text = 'Sehr gut'; subtext = 'Leichte Optimierung möglich'; }
  if (total < 75) { farbe = '#eab308'; text = 'Achtung';  subtext = 'Handlungsbedarf erkannt'; }
  if (total < 50) { farbe = '#f97316'; text = 'Kritisch'; subtext = 'Sofortige Maßnahmen nötig'; }
  if (total < 25) { farbe = '#ef4444'; text = 'Alarm';   subtext = 'Dringender Handlungsbedarf!'; }

  return { farbe, text, subtext };
}

function computeBreakdown(input: {
  objekte: OBJ[];
  wohneinheiten: WE[];
  instandhaltung: INS[];
  mietzahlungen: MZ[];
}): ScoreBreakdown {
  const reasons = {
    daten: [] as string[],
    vermietung: [] as string[],
    wartung: [] as string[],
    zahlungen: [] as string[],
  };

  // -------------- Datenqualität (0..25) --------------
  // Heuristik: Objekt "vollständig" wenn name+adresse+plz+stadt vorhanden.
  const objs = input.objekte ?? [];
  const objTotal = Math.max(1, objs.length);
  const objComplete = objs.filter((o) =>
    !!(o.name && o.adresse && o.plz && o.stadt)
  ).length;

  const objMissing = objTotal - objComplete;
  const completenessRatio = objTotal ? objComplete / objTotal : 1;
  const datenPts = clamp(Math.round(completenessRatio * 25), 0, 25);

  if (objs.length === 0) {
    reasons.daten.push('Noch keine Objekte vorhanden.');
  } else if (objMissing > 0) {
    reasons.daten.push(`${objMissing} Objekt(e) unvollständig (Name/Adresse/PLZ/Stadt).`);
  } else {
    reasons.daten.push('Objektdaten vollständig.');
  }

  // -------------- Vermietungsquote (0..25) --------------
  const we = input.wohneinheiten ?? [];
  const totalUnits = we.length;
  const rented = we.filter((u) => lower(u.status) === 'vermietet').length;
  const occupancy = totalUnits > 0 ? rented / totalUnits : 1;
  const vermietungPts = clamp(Math.round(occupancy * 25), 0, 25);

  if (totalUnits === 0) reasons.vermietung.push('Noch keine Einheiten vorhanden.');
  else if (rented === totalUnits) reasons.vermietung.push('Alle Einheiten vermietet.');
  else reasons.vermietung.push(`${totalUnits - rented} Einheit(en) frei.`);

  // -------------- Wartungsstatus (0..25) --------------
  const inst = input.instandhaltung ?? [];
  const offen = inst.filter((i) => lower(i.status) === 'geplant').length;
  const ueber = inst.filter((i) => {
    const s = lower(i.status);
    return s === 'überfällig' || s === 'ueberfaellig';
  }).length;

  // Fair: überfällig deutlich stärker gewichten
  let wartungPts = 25 - offen * 2 - ueber * 6;
  wartungPts = clamp(Math.round(wartungPts), 0, 25);

  if (ueber > 0) reasons.wartung.push(`${ueber} Vorgang/Vorgänge überfällig.`);
  if (offen > 0) reasons.wartung.push(`${offen} Vorgang/Vorgänge geplant/offen.`);
  if (ueber === 0 && offen === 0) reasons.wartung.push('Keine offenen Wartungen.');

  // -------------- Zahlungsquote (0..25) --------------
  const mz = input.mietzahlungen ?? [];
  const offenZ = mz.filter((z) => lower(z.status) === 'offen').length;
  const ueberZ = mz.filter((z) => {
    const s = lower(z.status);
    return s === 'ueberfaellig' || s === 'überfällig';
  }).length;

  // “quote” aus Events: je mehr offen/überfällig, desto weniger Punkte
  let zahlungenPts = 25 - offenZ * 2 - ueberZ * 6;
  zahlungenPts = clamp(Math.round(zahlungenPts), 0, 25);

  if (ueberZ > 0) reasons.zahlungen.push(`${ueberZ} Zahlung(en) überfällig.`);
  if (offenZ > 0) reasons.zahlungen.push(`${offenZ} Zahlung(en) offen.`);
  if (ueberZ === 0 && offenZ === 0) reasons.zahlungen.push('Keine offenen Zahlungen.');

  // -------------- Total + Next gains --------------
  const total = clamp(datenPts + vermietungPts + wartungPts + zahlungenPts, 0, 100);

  const nextGains: { points: number; text: string; href?: string }[] = [];

  // +6 Punkte, wenn 2 Objekte vervollständigt werden (max bis 25)
  if (objMissing > 0) {
    const fix2 = Math.min(2, objMissing);
    const perObj = 3; // 2 Objekte => 6 Punkte (wie in deinem Beispiel)
    nextGains.push({
      points: fix2 * perObj,
      text: `+${fix2 * perObj} Punkte, wenn du ${fix2} Objekt(e) vervollständigst`,
      href: '/objekte?edit=1',
    });
  }

  // +4 Punkte, wenn 1 überfällige Wartung erledigt wird
  if (ueber > 0) {
    nextGains.push({
      points: 4,
      text: '+4 Punkte, wenn du 1 überfällige Wartung erledigst',
      href: '/maengel?status=ueberfaellig',
    });
  }

  // +4 Punkte, wenn 1 überfällige Zahlung geklärt wird
  if (ueberZ > 0) {
    nextGains.push({
      points: 4,
      text: '+4 Punkte, wenn du 1 überfällige Zahlung klärst',
      href: '/zahlungen?status=ueberfaellig',
    });
  }

  // +3 Punkte, wenn 1 freie Einheit vermietet wird (wenn es Leerstand gibt)
  if (totalUnits > 0 && rented < totalUnits) {
    nextGains.push({
      points: 3,
      text: '+3 Punkte, wenn du 1 freie Einheit vermietest',
      href: '/wohneinheiten?status=frei',
    });
  }

  // sort descending points, keep top 3
  nextGains.sort((a, b) => b.points - a.points);

  return {
    total,
    buckets: { daten: datenPts, vermietung: vermietungPts, wartung: wartungPts, zahlungen: zahlungenPts },
    reasons,
    nextGains: nextGains.slice(0, 3),
  };
}

/* --------------------------- BuildStats --------------------------- */

function buildStats(
  input: { objekte: OBJ[]; wohneinheiten: WE[]; mieter: MT[]; instandhaltung: INS[]; mietzahlungen: MZ[] },
  now: Date
): DashboardStats {
  const objekte = input.objekte ?? [];
  const wohneinheiten = input.wohneinheiten ?? [];
  const instandhaltung = input.instandhaltung ?? [];
  const mietzahlungen = input.mietzahlungen ?? [];

  const objekteCount = objekte.length;
  const einheiten = wohneinheiten.length;
  const vermietet = wohneinheiten.filter((w) => lower(w.status) === 'vermietet').length;

  const mieter = input.mieter?.length ?? 0;

  const wartungenOffen = instandhaltung.filter((i) => lower(i.status) === 'geplant').length;
  const wartungenUeberfaellig = instandhaltung.filter((i) => {
    const s = lower(i.status);
    return s === 'überfällig' || s === 'ueberfaellig';
  }).length;

  const mieteGesamt = wohneinheiten.reduce((sum, w) => sum + (amount(w.kaltmiete) || 0), 0);
  const leerstandRate = einheiten > 0 ? (einheiten - vermietet) / einheiten : 0;

  // Cashflow (0..30) vs (31..60)
  const rowDate = (r: MZ) => parseDateOnly(r.zahlungsdatum ?? r.zahlungsmonat ?? null);

  const sumLast30 = mietzahlungen.reduce((sum, r) => {
    const d = rowDate(r);
    if (!d) return sum;
    const ageDays = Math.floor((now.getTime() - d.getTime()) / dayMs);
    if (ageDays < 0 || ageDays > 30) return sum;
    if (lower(r.status) !== 'eingegangen') return sum;
    return sum + amount(r.betrag);
  }, 0);

  const sumPrev30 = mietzahlungen.reduce((sum, r) => {
    const d = rowDate(r);
    if (!d) return sum;
    const ageDays = Math.floor((now.getTime() - d.getTime()) / dayMs);
    if (ageDays < 31 || ageDays > 60) return sum;
    if (lower(r.status) !== 'eingegangen') return sum;
    return sum + amount(r.betrag);
  }, 0);

  const zahlungenOffen = mietzahlungen.filter((r) => lower(r.status) === 'offen').length;
  const zahlungenUeberfaellig = mietzahlungen.filter((r) => {
    const s = lower(r.status);
    return s === 'ueberfaellig' || s === 'überfällig';
  }).length;

  const round2 = (x: number) => Math.round(x * 100) / 100;

  // Score Breakdown (fair + erklärbar)
  const breakdown = computeBreakdown({ objekte, wohneinheiten, instandhaltung, mietzahlungen });

  const meta = scoreMeta(breakdown.total);

  // Subtext an Größe anpassen
  const n = einheiten;
  const portfolioHint =
    n === 0 ? 'Leg dein erstes Objekt an, um Kennzahlen zu sehen.' :
    n <= 3 ? `Kleines Portfolio (${n} Einheit${n === 1 ? '' : 'en'}) – schnell optimierbar.` :
    n <= 15 ? `Stabiles Portfolio (${n} Einheiten) – Überblick behalten.` :
    n <= 50 ? `Management-Modus: ${n} Einheiten im Blick.` :
              `Großes Portfolio: ${n} Einheiten – Prozesse & Wartungen priorisieren.`;

  return {
    objekte: objekteCount,
    einheiten,
    vermietet,
    mieter,

    wartungenOffen,
    wartungenUeberfaellig,

    mieteGesamt,
    leerstandRate,

    score: breakdown.total,
    scoreFarbe: meta.farbe,
    scoreText: meta.text,
    scoreSubtext: `${meta.subtext} · ${portfolioHint}`,

    scoreBreakdown: breakdown,

    zahlungen30Summe: round2(sumLast30),
    zahlungen30Delta: round2(sumLast30 - sumPrev30),
    zahlungenOffen,
    zahlungenUeberfaellig,
  };
}