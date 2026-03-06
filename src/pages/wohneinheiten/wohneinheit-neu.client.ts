type Objekt = { id: string; bezeichnung: string | null };
type CreateResponse = { id: string };

const preObjekt = new URLSearchParams(window.location.search).get('objekt') ?? '';

const select = document.querySelector<HTMLSelectElement>('#objekt_id');
const lockedText = document.querySelector<HTMLElement>('.lockedText');
const errorBox = document.querySelector<HTMLElement>('#error-message');
const form = document.querySelector<HTMLFormElement>('#einheit-form');

function showError(msg: string) {
  if (!errorBox) return;
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
}

function clearError() {
  if (!errorBox) return;
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function toNumber(v: FormDataEntryValue | null) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const ct = res.headers.get('content-type') ?? '';
  const isJson = ct.includes('application/json');

  if (!res.ok) {
    const text = isJson ? JSON.stringify(await res.json()) : await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (isJson ? await res.json() : (await res.text() as any)) as T;
}

async function loadObjektLockedPill() {
  if (!preObjekt || !lockedText) return;

  try {
    clearError();
    const obj = await fetchJson<Objekt>(`/api/objekte/${encodeURIComponent(preObjekt)}`);
    lockedText.textContent = obj.bezeichnung ?? 'Objekt';
  } catch (e: any) {
    console.error('[Einheit neu] loadObjektLockedPill error:', e);
    lockedText.textContent = 'Kein Zugriff';
    showError(String(e?.message ?? e));
  }
}

async function loadObjekteDropdown() {
  if (preObjekt) return;
  if (!select) return;

  try {
    clearError();
    const list = await fetchJson<Objekt[]>('/api/objekte');

    for (const obj of list ?? []) {
      const option = document.createElement('option');
      option.value = obj.id;
      option.textContent = obj.bezeichnung ?? 'Objekt';
      select.appendChild(option);
    }
  } catch (e: any) {
    console.error('[Einheit neu] loadObjekteDropdown error:', e);
    showError(String(e?.message ?? e));
  }
}

function buildPayloadFromForm(fd: FormData, objekt_id: string) {
  const payload: any = {
    objekt_id,
    bezeichnung: fd.get('bezeichnung'),
    typ: fd.get('typ'),
    wohnflaeche_qm: toNumber(fd.get('wohnflaeche_qm')),
    zimmer_anzahl: toNumber(fd.get('zimmer_anzahl')),
    kaltmiete: toNumber(fd.get('kaltmiete')),
    status: fd.get('status'),
  };

  const nk = toNumber(fd.get('nebenkosten_vorauszahlung'));
  if (nk !== null) payload.nebenkosten_vorauszahlung = nk;

  const tuer = fd.get('tuerbezeichnung');
  if (tuer && String(tuer).trim()) payload.tuerbezeichnung = String(tuer).trim();

  return payload;
}

async function handleSubmit(e: Event) {
  e.preventDefault();
  clearError();

  if (!form) return;

  try {
    const fd = new FormData(form);

    const objekt_id =
      (fd.get('objekt_id') as string | null) ||
      (fd.get('objekt_id_locked') as string | null) ||
      preObjekt;

    if (!objekt_id) return showError('Bitte ein Objekt auswählen.');

    const payload = buildPayloadFromForm(fd, objekt_id);

    const created = await fetchJson<CreateResponse>('/api/wohneinheiten', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    window.location.href = `/wohneinheiten/${created.id}`;
  } catch (e: any) {
    console.error('[Einheit neu] submit error:', e);
    showError(String(e?.message ?? e));
  }
}

// init
loadObjektLockedPill();
loadObjekteDropdown();
form?.addEventListener('submit', handleSubmit);