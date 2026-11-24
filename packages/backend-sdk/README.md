# Sentinel Backend Traffic SDK

A lightweight, non-blocking Node.js traffic telemetry SDK for Sentinel. Tracks **live visitors** and **total visits** across your web applications with zero latency penalty.

---

## 🚀 Quickstart (Express.js)

### 1. Install

```bash
npm install @sentinel-security/node
```

*(Or import directly from `packages/backend-sdk`)*

### 2. Add to your Express App

```javascript
import express from 'express';
import { sentinelTraffic } from '@sentinel-security/node';

const app = express();

// Add Sentinel Traffic Middleware
app.use(sentinelTraffic({
  apiKey: 'YOUR_SENTINEL_API_KEY', // Copied from your Sentinel dashboard
  endpoint: 'http://localhost:3000/api/traffic' // Sentinel API endpoint
}));

app.get('/', (req, res) => {
  res.send('Hello from my website!');
});

app.listen(8080, () => console.log('Server running on http://localhost:8080'));
```

---

## ⚡ Non-Express / Standalone Usage

```javascript
import { reportTraffic } from '@sentinel-security/node';

// Manually report a visit:
await reportTraffic({
  apiKey: 'YOUR_SENTINEL_API_KEY',
  path: '/checkout',
  method: 'POST',
  ip: '203.0.113.195'
});
```

---

## 🛡️ Guarantees

- **Non-blocking**: Requests to Sentinel are fired asynchronously in the background. Your users will never experience any slowdown.
- **Fail-safe**: If Sentinel is unreachable or restarts, your application continues running normally without throwing errors.
