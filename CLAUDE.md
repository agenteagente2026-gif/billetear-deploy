# BilleteAR — Dashboard Económico Argentino

## Qué es esto
Sitio web multi-página de datos financieros argentinos en tiempo real. Deploy en **https://billetear.netlify.app** vía Netlify (conectar GitHub para auto-deploy).

## Archivos del proyecto
- `index.html` — Página principal: widget de dólares + calculadora bidireccional + heatmap + noticias
- `dolares.html` — Todos los tipos de cambio + calculadora ARS⇄USD + gráfico blue + consulta por fecha
- `cripto.html` — Top criptos + tabla mercado + ganadoras/perdedoras del día
- `mercados.html` — TradingView widgets (acciones, índices, ETFs)
- `indicadores.html` — Riesgo País, inflación, brecha cambiaria con gráficos históricos (Chart.js)
- `noticias.html` — RSS feeds de medios económicos argentinos
- `manifest.json` — PWA manifest
- `sw.js` — Service worker (stale-while-revalidate para shell, network-only para APIs)
- `icon-192.svg`, `icon-512.svg`, `icon-maskable.svg` — Íconos PWA
- `.gitignore` — Archivos excluidos del repo

## Stack técnico
- HTML/CSS/JS puro, sin build system, sin frameworks
- Chart.js 4.4.0 para gráficos históricos
- TradingView widgets (embed) para mercados
- Google Fonts: DM Sans
- PWA: manifest.json + service worker para instalación como app
- Deploy: GitHub repo → Netlify auto-deploy

## APIs utilizadas
| Endpoint | Dato | Estado |
|---|---|---|
| `https://dolarapi.com/v1/dolares` | Todos los tipos de cambio | ✅ OK |
| `https://api.argentinadatos.com/v1/cotizaciones/dolares/{tipo}` | Histórico por tipo de dólar | ✅ OK |
| `https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo` | Riesgo País último valor | ✅ OK |
| `https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais` | Riesgo País histórico | ✅ OK |
| `https://api.argentinadatos.com/v1/finanzas/indices/inflacion` | Inflación mensual histórica | ✅ OK |
| `https://api.coingecko.com/api/v3/coins/markets` | Precios cripto | ✅ OK (free tier) |
| `https://criptoya.com/api/{coin}/ars/0.1` | Cripto por exchange (usdt, usdc, btc) | ✅ OK |
| `https://api.comparadolar.ar/usd` | Dólar por banco y broker/fintech | ✅ OK |
| Yahoo Finance | Acciones | ❌ CORS bloqueado — reemplazado por TradingView |
| Ambito stocks/índices | Merval, acciones | ❌ CORS — reemplazado por TradingView |

**IMPORTANTE — endpoint riesgo país:**
El path correcto es `/finanzas/indices/riesgo-pais` (con "indices" y guión, NO underscore).
Las versiones `/finanzas/riesgo_pais` y `/finanzas/riesgo-pais` (sin "indices") devuelven 404.

## CORS proxy chain
Todas las APIs pasan por este fallback en `fetchJSON()`:
1. Directo
2. `https://corsproxy.io/?url=`
3. `https://api.allorigins.win/raw?url=`

## Temas / diseño
- Dark mode por defecto, light mode toggle (🌙/☀️) en TODAS las páginas, guardado en localStorage (`billetear-theme`)
- CSS custom properties en `:root` para todos los colores
- Paleta: `--sky:#38bdf8`, `--orange:#f97316`, `--green:#22c55e`, `--red:#ef4444`, `--purple:#a78bfa`
- Animación `fadeUp` en cada `.section`
- Skeleton loaders mientras cargan los datos
- Flash verde/rojo cuando cambia un precio

## Funcionalidades implementadas
- **Widget de dólares** (index.html): muestra MEP, CCL, Cripto, Blue, Oficial, Mayorista, Tarjeta con badge de evolución semanal (localStorage snapshot cada 6h)
- **Calculadora bidireccional ARS⇄USD** (index.html hero + dolares.html): selector de tipo de cambio, campo ARS y USD, se actualiza en cualquier dirección
- **Stats bar persistente**: barra sticky debajo del header con Blue, MEP, CCL, Brecha, Riesgo País, BTC
- **Ticker animado**: scroll horizontal con precios en tiempo real
- **Heatmap**: tiles de colores verde/rojo por variación (dólares, cripto, acciones)
- **Ganadoras/perdedoras del día** (cripto.html): top 5 de las 50 mayores criptos por capitalización
- **Gráficos históricos multi-dólar** (dolares.html): Chart.js con Blue/MEP/CCL/Oficial superpuestos, toggles por tipo + indicadores.html
- **Consulta por fecha** (dolares.html): date picker que muestra todos los tipos de cambio de una fecha específica
- **Noticias**: RSS feeds de Ámbito, Infobae, Google News, El Cronista, La Nación via allorigins proxy + tabs AR/Mundo/Mercados
- **Tablas ordenables** (dolares.html): click en headers de columna para ordenar por compra/venta/spread
- **Insight banner** (dolares.html): frase editorial automática con brecha, comparación blue vs MEP
- **Tipografía editorial**: DM Serif Display para títulos, DM Sans para datos
- **Share**: botones WhatsApp, X (Twitter), copiar precios
- **Newsletter**: formulario (sin backend por ahora)
- **Refresh automático**: cada 30s en dolares.html, cada 3 minutos en el resto
- **PWA**: manifest + service worker, instalable como app en celular/desktop
- **Dólar por banco/broker** (dolares.html): tabla con datos de comparadolar.ar, tabs Bancos/Brokers, links a cada proveedor
- **Cripto por exchange con links** (dolares.html): tabs USDT/USDC/BTC, tablas directas (sin acordeón), links a cada exchange

## Secciones eliminadas (no restaurar)
- **Cards de BTC/Brecha/Riesgo/Inflación en el hero de index.html**: reemplazadas por la calculadora + franja de indicadores compacta

## Estructura hero de index.html
El hero tiene dos columnas (`hero-grid`):
- Izquierda: `.dollar-widget` — widget de dólares con buscador
- Derecha: `.hero-calc-wrap` — calculadora bidireccional + strip de indicadores (Brecha, Riesgo País, Inflación)

**IDs importantes en index.html:**
- `mmBrecha`, `mmBrechaSub` — brecha blue/oficial (en hero-calc-wrap)
- `mmRiesgo` — riesgo país (en hero-calc-wrap)
- `mmInfla`, `mmInflaSub` — inflación (en hero-calc-wrap)
- `mmBtc`, `mmBtcChg` — hidden spans (el JS los actualiza pero no se muestran en el hero)
- `calcARS`, `calcUSD`, `calcType`, `calcResult` — calculadora hero
- `sb-blue`, `sb-mep`, `sb-ccl`, `sb-brecha`, `sb-riesgo`, `sb-btc` — stats bar
- `dwRows`, `dwTime`, `dwSearch` — dollar widget

## Estructura dolares.html
Secciones (subnav con scroll spy):
- `#blue` — Hero Blue con sparkline 7d
- `#mep` — MEP/CCL cards con explainer
- `#calculadora` — Convertidor bidireccional ARS⇄USD
- `#cripto-detail` — USDT/USDC/BTC por exchange con tabs (datos de criptoya.com, links a exchanges)
- `#comparadolar` — Dólar por banco y broker/fintech (datos de api.comparadolar.ar, tabs Bancos/Brokers)
- `#medios` — Blue en fuentes (dolarapi, Ámbito, Bluelytics)
- `#historico` — Gráfico Chart.js evolución blue (30D/90D/6M/1A/Todo)
- `#fecha` — Consulta por fecha con date picker
- `#todos` — Grid con todos los tipos de cambio

## JS global pattern
```javascript
const q = id => document.getElementById(id);
async function fetchJSON(url) { /* CORS proxy chain */ }
async function refreshAll() { /* fetch todo, actualizar DOM */ }
refreshAll();
setInterval(refreshAll, 3 * 60 * 1000);
```

## Deploy workflow
### Opción 1: GitHub + Netlify auto-deploy (recomendado)
1. Crear repo en GitHub
2. `git init && git add . && git commit -m "initial"`
3. `git remote add origin <url> && git push -u origin main`
4. En Netlify: New site → Import from Git → seleccionar repo
5. Build command: (vacío), Publish directory: `.`
6. Cada push a main hace deploy automático

### Opción 2: Manual (legacy)
1. Crear ZIP con todos los archivos
2. Subir el ZIP a netlify.com/drop

## Ideas pendientes / roadmap
- Google AdSense (hay placeholder en index.html)
- Gráficos de evolución para MEP y CCL (no solo blue)
- Notificaciones push cuando el blue sube/baja más de X%
