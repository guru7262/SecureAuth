/**
 * Sentinel Traffic SDK - Standalone Single-File Version
 * Drop this file directly into your Node.js, Express, or Next.js project.
 *
 * Usage in Express:
 *   const { sentinelTraffic } = require('./sentinel-traffic.js');
 *   app.use(sentinelTraffic({ apiKey: 'YOUR_API_KEY' }));
 *
 * Usage in Next.js / Edge (middleware.js):
 *   import { trackVisit } from './sentinel-traffic.js';
 *   trackVisit({ apiKey: 'YOUR_API_KEY', path: request.nextUrl.pathname });
 */

const DEFAULT_ENDPOINT = typeof window !== 'undefined'
  ? `${window.location.origin}/api/traffic`
  : 'http://localhost:3000/api/traffic';

/**
 * Report a single visit asynchronously to Sentinel
 */
export async function trackVisit({
  apiKey,
  endpoint = DEFAULT_ENDPOINT,
  path = '/',
  method = 'GET',
  ip = '127.0.0.1',
  userAgent = 'Unknown'
}) {
  if (!apiKey) return null;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        path,
        method,
        ip: typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1',
        userAgent,
      }),
    });
    return await res.json().catch(() => ({}));
  } catch (err) {
    // Fail silently so customer site is never affected
    return null;
  }
}

/**
 * Express Middleware
 */
export function sentinelTraffic(options = {}) {
  const apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env.SENTINEL_API_KEY : '');
  const endpoint = options.endpoint || (typeof process !== 'undefined' ? process.env.SENTINEL_ENDPOINT : '') || DEFAULT_ENDPOINT;
  const excludePaths = options.excludePaths || ['/favicon.ico', '/robots.txt'];

  return function middleware(req, res, next) {
    if (apiKey) {
      const path = req.originalUrl || req.url || '/';
      const isExcluded = excludePaths.some(p => path.startsWith(p));
      if (!isExcluded) {
        trackVisit({
          apiKey,
          endpoint,
          path,
          method: req.method || 'GET',
          ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent']
        }).catch(() => {});
      }
    }
    next();
  };
}

// Auto-track if loaded in a browser via <script data-api-key="...">
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const currentScript = document.currentScript;
  const scriptApiKey = currentScript?.getAttribute('data-api-key');
  const customEndpoint = currentScript?.getAttribute('data-endpoint') || DEFAULT_ENDPOINT;

  if (scriptApiKey) {
    trackVisit({
      apiKey: scriptApiKey,
      endpoint: customEndpoint,
      path: window.location.pathname,
      method: 'GET',
      userAgent: navigator.userAgent
    });
  }
}

export default sentinelTraffic;
