  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('kontakt');
    const role = root?.getAttribute('data-role') || 'guest';

    // Toast / Channels (dein Code – aber Selector fix!)
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    const form = document.getElementById('contact-form');

    const showToast = (text) => {
      toastText.textContent = text;
      toast.classList.add('show');
      window.clearTimeout(window.__toastTimer);
      window.__toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
    };

    document.querySelectorAll('.c-channel').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const action = btn.getAttribute('data-action');
        const value = btn.getAttribute('data-value');
        if (!action || !value) return;

        if (action === 'call') return (window.location.href = `tel:${value.replaceAll(' ', '')}`);
        if (action === 'mail') return (window.location.href = `mailto:${value}`);

        try {
          await navigator.clipboard.writeText(value);
          showToast('In Zwischenablage kopiert');
        } catch {
          showToast('Kopieren nicht möglich');
        }
      });
    });

    // ✅ LANDLORD: Objekte dynamisch laden wie bei Wohneinheit-neu
    if (role === 'landlord') {
      const select = document.getElementById('objekt_id');
      const hint = document.getElementById('objekt_hint');

      if (select) {
        try {
          const res = await fetch('/api/objekte', { headers: { accept: 'application/json' } });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json(); // [{id, bezeichnung}, ...]

          // alte Optionen (bis auf placeholder) löschen
          select.querySelectorAll('option:not([disabled])').forEach((o) => o.remove());

          if (!Array.isArray(data) || data.length === 0) {
            if (hint) hint.textContent = 'Keine Objekte gefunden.';
            return;
          }

          for (const o of data) {
            const opt = document.createElement('option');
            opt.value = String(o.id);
            opt.textContent = o.bezeichnung ?? 'Objekt';
            select.appendChild(opt);
          }

          if (hint) hint.textContent = 'Wählen Sie das passende Objekt.';
        } catch (e) {
          if (hint) hint.textContent = 'Objekte konnten nicht geladen werden.';
          console.error('[contact] load objekte failed:', e);
        }
      }
    }

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Nachricht gesendet (Demo)');
      form.reset();
    });
  });