/**
 * Sentinel Traffic SDK - Standalone Single-File Version
 * Drop this file directly into your Node.js, Express, Next.js, or HTML site.
 */

// Auto-detect Sentinel server origin from the script tag's src URL
function detectSentinelOrigin() {
  if (typeof document !== 'undefined') {
    const script = document.currentScript || document.querySelector('script[src*="sentinel-traffic"]');
    if (script && script.src) {
      try {
        const parsed = new URL(script.src);
        if (parsed.origin && !parsed.origin.includes('undefined')) {
          return `${parsed.origin}/api/traffic`;
        }
      } catch {}
    }
  }
  return typeof window !== 'undefined'
    ? `${window.location.origin}/api/traffic`
    : 'http://localhost:3000/api/traffic';
}

const DEFAULT_ENDPOINT = detectSentinelOrigin();

/**
 * Report a single visit asynchronously to Sentinel
 */
export async function trackVisit({
  apiKey,
  endpoint,
  path = '/',
  method = 'GET',
  ip = '127.0.0.1',
  userAgent = 'Unknown'
}) {
  if (!apiKey) return null;

  const targetUrl = endpoint || detectSentinelOrigin();

  try {
    const res = await fetch(targetUrl, {
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
    // Fail silently so customer site execution is never disrupted
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

// Auto-track if loaded in a browser via <script data-api-key="..." data-endpoint="...">
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  function autoTrack() {
    const script = document.currentScript || document.querySelector('script[data-api-key]');
    const scriptApiKey = script?.getAttribute('data-api-key');
    const customEndpoint = script?.getAttribute('data-endpoint') || detectSentinelOrigin();

    if (!scriptApiKey) return;

    function sendPing(path) {
      trackVisit({
        apiKey: scriptApiKey,
        endpoint: customEndpoint,
        path: path || window.location.pathname || '/',
        method: 'GET',
        userAgent: navigator.userAgent
      });
    }

    // 1. Initial ping on page load
    sendPing(window.location.pathname);

    // 2. Heartbeat every 2 minutes — keeps the visitor inside the 5-min live window
    //    so they don't disappear while still on the page
    const HEARTBEAT_MS = 2 * 60 * 1000; // 2 minutes
    const heartbeatTimer = setInterval(() => {
      // Only send heartbeat if the tab is visible
      if (document.visibilityState !== 'hidden') {
        sendPing(window.location.pathname);
      }
    }, HEARTBEAT_MS);

    // 3. Track SPA navigation (React Router, Next.js, etc.)
    //    Intercept history.pushState so route changes register as new visits
    const _origPush = history.pushState.bind(history);
    history.pushState = function (...args) {
      _origPush(...args);
      sendPing(window.location.pathname);
    };
    window.addEventListener('popstate', () => sendPing(window.location.pathname));

    // 4. Cleanup on tab close (best-effort)
    window.addEventListener('beforeunload', () => clearInterval(heartbeatTimer));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoTrack);
  } else {
    autoTrack();
  }
}

export default sentinelTraffic;

