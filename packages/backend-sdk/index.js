/**
 * Sentinel Backend Traffic SDK (ES Module)
 * Tracks live visitors and total visits with zero overhead.
 */

const DEFAULT_ENDPOINT = 'http://localhost:3000/api/traffic';

/**
 * Creates an Express middleware to report website visits.
 * 
 * @param {Object} options
 * @param {string} options.apiKey - Your Sentinel website API key (e.g. sent_live_...)
 * @param {string} [options.endpoint] - Custom Sentinel API endpoint
 * @param {Array<string>} [options.excludePaths] - Paths to ignore (e.g. ['/health', '/favicon.ico'])
 * @returns {Function} Express middleware (req, res, next)
 */
export function sentinelTraffic(options = {}) {
  const apiKey = options.apiKey || process.env.SENTINEL_API_KEY;
  const endpoint = options.endpoint || process.env.SENTINEL_ENDPOINT || DEFAULT_ENDPOINT;
  const excludePaths = options.excludePaths || ['/favicon.ico', '/robots.txt'];

  if (!apiKey) {
    console.warn('[Sentinel SDK] Warning: No apiKey provided. Traffic telemetry is paused.');
  }

  return function sentinelMiddleware(req, res, next) {
    if (apiKey) {
      const path = req.originalUrl || req.url || '/';

      // Check if path is excluded
      const isExcluded = excludePaths.some(p => path.startsWith(p));
      if (!isExcluded) {
        // Asynchronously report visit without blocking request flow
        reportTraffic({
          apiKey,
          endpoint,
          path,
          method: req.method || 'GET',
          ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent']
        }).catch(() => {
          // Fail-safe: Never affect or disrupt host site execution
        });
      }
    }

    next();
  };
}

/**
 * Standalone visit reporter for non-Express environments (FastAPI, Koa, Next.js, etc.)
 */
export async function reportTraffic({ apiKey, endpoint = DEFAULT_ENDPOINT, path = '/', method = 'GET', ip = '127.0.0.1', userAgent = 'Unknown' }) {
  if (!apiKey) return;

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
    // Fail silently in customer backend
    return null;
  }
}

export default sentinelTraffic;
