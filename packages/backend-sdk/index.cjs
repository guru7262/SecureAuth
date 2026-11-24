/**
 * Sentinel Backend Traffic SDK (CommonJS export)
 */

const DEFAULT_ENDPOINT = 'http://localhost:3000/api/traffic';

function sentinelTraffic(options = {}) {
  const apiKey = options.apiKey || process.env.SENTINEL_API_KEY;
  const endpoint = options.endpoint || process.env.SENTINEL_ENDPOINT || DEFAULT_ENDPOINT;
  const excludePaths = options.excludePaths || ['/favicon.ico', '/robots.txt'];

  if (!apiKey) {
    console.warn('[Sentinel SDK] Warning: No apiKey provided. Traffic telemetry is paused.');
  }

  return function sentinelMiddleware(req, res, next) {
    if (apiKey) {
      const path = req.originalUrl || req.url || '/';
      const isExcluded = excludePaths.some(p => path.startsWith(p));
      if (!isExcluded) {
        reportTraffic({
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

async function reportTraffic({ apiKey, endpoint = DEFAULT_ENDPOINT, path = '/', method = 'GET', ip = '127.0.0.1', userAgent = 'Unknown' }) {
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
    return null;
  }
}

module.exports = sentinelTraffic;
module.exports.sentinelTraffic = sentinelTraffic;
module.exports.reportTraffic = reportTraffic;
module.exports.default = sentinelTraffic;
