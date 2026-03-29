/**
 * Cloudflare Pages Function — RSS CORS Proxy
 * Path: /api/rss-proxy?url=<encoded-rss-url>
 *
 * Whitelisted domains only. Caches 5 min.
 */

const ALLOWED_DOMAINS = [
  'google.com',
  'infobae.com',
  'ambito.com',
  'bbc.co.uk',
  'cronista.com',
  'lanacion.com.ar',
  'reuters.com',
  'elpais.com',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function isDomainAllowed(hostname) {
  return ALLOWED_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith('.' + d)
  );
}

export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const reqUrl = new URL(request.url);
  const targetUrl = reqUrl.searchParams.get('url');

  // Validate url parameter
  if (!targetUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing "url" query parameter' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid URL' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  // Whitelist check
  if (!isDomainAllowed(parsed.hostname)) {
    return new Response(
      JSON.stringify({ error: 'Domain not allowed' }),
      { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'BilleteAR-RSS/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      cf: { cacheTtl: 300 },
    });

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${resp.status}` }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const body = await resp.text();
    const contentType = resp.headers.get('Content-Type') || 'application/xml';

    return new Response(body, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Fetch failed', detail: err.message }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
}
