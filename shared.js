/* ══════════════════════════════════════════════════════════
   BilleteAR — shared utilities (loaded before page scripts)
   ══════════════════════════════════════════════════════════ */

const q = id => document.getElementById(id);

function escHTML(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function fetchJSON(url) {
  const proxies = [
    url,
    'https://corsproxy.io/?url=' + encodeURIComponent(url),
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(url)
  ];
  for (const u of proxies) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 7000);
      const r = await fetch(u, { signal: ctrl.signal });
      clearTimeout(tid);
      if (r.ok) return await r.json();
    } catch { continue; }
  }
  throw new Error('fetch failed');
}

/* ── Theme toggle ── */
const _moonSVG='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const _sunSVG='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
function toggleTheme() {
  const light = document.body.classList.toggle('light');
  localStorage.setItem('billetear-theme', light ? 'light' : 'dark');
  const btn = q('themeBtn');
  if (btn) btn.innerHTML = light ? _sunSVG : _moonSVG;
}
(function initTheme() {
  if (localStorage.getItem('billetear-theme') === 'light') {
    document.body.classList.add('light');
    const btn = q('themeBtn');
    if (btn) btn.innerHTML = _sunSVG;
  }
})();

/* ── Refresh button spinner ── */
function triggerRefresh() {
  const btn = q('refreshBtn');
  if (btn) { btn.classList.add('refresh-spinning'); setTimeout(() => btn.classList.remove('refresh-spinning'), 600); }
  refreshAll();
}

/* ── ARS number formatter ── */
function fmtARS(n) {
  if (n == null) return '\u2013';
  return '$\u202f' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ── Generic numeric input formatter (dot-separated) ── */
function formatNumericInput(el) {
  const raw = el.value.replace(/\./g, '').replace(/[^0-9]/g, '');
  if (!raw) { el.value = ''; return; }
  el.value = Number(raw).toLocaleString('es-AR');
}

/* ── PWA: register service worker ── */
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }
