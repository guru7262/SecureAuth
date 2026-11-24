/**
 * Sentinel SDK Demo App
 * Run this script to simulate live traffic hitting a protected customer server!
 *
 * Usage:
 *   node example-server.js <YOUR_API_KEY>
 */

import http from 'http';
import { reportTraffic } from './index.js';

const API_KEY = process.argv[2] || process.env.SENTINEL_API_KEY || 'sent_live_demo87654321abcdef0123456789';
const ENDPOINT = process.env.SENTINEL_ENDPOINT || 'http://localhost:3000/api/traffic';
const PORT = 8080;

console.log(`\n======================================================`);
console.log(` Sentinel Backend SDK Test Server`);
console.log(` Tracking traffic with API Key: ${API_KEY}`);
console.log(` Endpoint: ${ENDPOINT}`);
console.log(`======================================================\n`);

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';
  console.log(`[Customer App] Incoming visit: ${req.method} ${url}`);

  // Report traffic to Sentinel asynchronously
  reportTraffic({
    apiKey: API_KEY,
    endpoint: ENDPOINT,
    path: url,
    method: req.method || 'GET',
    ip: req.socket.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent']
  }).catch(() => {});

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Welcome to your customer website!',
    path: url,
    sentinelTracking: 'Active',
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`Customer test app is running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/ or curl it to see visits increase in your Sentinel dashboard!\n`);
});
