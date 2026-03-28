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
function toggleTheme() {
  const light = document.body.classList.toggle('light');
  localStorage.setItem('billetear-theme', light ? 'light' : 'dark');
  const btn = q('themeBtn');
  if (btn) btn.textContent = light ? '\u2600\uFE0F' : '\uD83C\uDF19';
}
(function initTheme() {
  if (localStorage.getItem('billetear-theme') === 'light') {
    document.body.classList.add('light');
    const btn = q('themeBtn');
    if (btn) btn.textContent = '\u2600\uFE0F';
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
