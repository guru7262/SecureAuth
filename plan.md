# SecureBase Implementation Plan

## 1. Product Direction

SecureBase is an independent authentication-event intelligence platform for site owners.

A customer keeps their own authentication system, database, users, passwords, and sessions. Their backend sends SecureBase limited authentication event metadata so SecureBase can monitor behavior, calculate trust, and recommend protective actions.

SecureBase must not become a dependency in the customer's login or signup flow.

## 2. Core Principles

- Customer authentication must continue working if SecureBase is unavailable.
- SecureBase must never receive passwords or full customer user records.
- SecureBase stores only event metadata needed for analysis.
- SecureBase recommends actions; the customer's application decides whether to enforce them.
- Event delivery should be fire-and-forget and fail open.
- SecureBase owns its own MongoDB data.
- MongoDB is the only supported storage engine for the first version.
- Every phase must produce a usable, demonstrable feature.

## 3. Current Repository State

### Implemented

- React 18 and Vite frontend.
- Vercel serverless API functions.
- MongoDB connection and collection helpers.
- SecureBase owner signup and login.
- JWT authentication with HttpOnly cookies.
- Password hashing with bcrypt.
- Zod-based request validation.
- Logout, current-user, forgot-password, and reset-password flows.
- Protected dashboard route and responsive dashboard shell.
- Vercel deployment configuration.

### Prototype Only

- Dashboard metrics, charts, threats, risk scores, and events are hard-coded in `client/src/pages/Dashboard.jsx`.
- Dashboard navigation modules are visual placeholders.
- Password reset logs the token instead of sending an email.

### Missing

- Owner API-key generation and management.
- API-key authentication for ingestion requests.
- Event ingestion endpoints.
- Event MongoDB schema and indexes.
- Dashboard API endpoints.
- Real event-backed metrics and recent-event views.
- Integration documentation and an event-sending test script.
- Rate limiting and abuse protection for public endpoints.

## 4. Phase 1: Owner Onboarding and Event Intelligence

### Goal

A site owner can create a SecureBase account, obtain an API key, send authentication events from their own backend, and see those events reflected in the dashboard.

### 4.1 Owner API Keys

Add an API-key system separate from the owner's browser JWT session.

Requirements:

- Generate a cryptographically random key for each owner.
- Show the full key only once at creation time.
- Store only a secure hash of the key in MongoDB.
- Associate each key with its owner account.
- Support key revocation and regeneration.
- Include key creation time, last-used time, and status.
- Authenticate ingestion requests through a dedicated header such as `X-API-Key`.
- Never expose API keys through the dashboard after creation.

Suggested collection: `apiKeys`

Suggested fields:

```text
_id
ownerId
keyHash
keyPrefix
createdAt
lastUsedAt
revokedAt
```

### 4.2 Event Ingestion API

Create these serverless endpoints:

- `POST /api/events/signup`
- `POST /api/events/login`
- `POST /api/events/login-failed`

Each request must:

- Authenticate with an active owner API key.
- Validate the event payload.
- Associate the event with the owner.
- Store only approved metadata.
- Return a clear success response.
- Avoid returning sensitive information.

Initial payload:

```json
{
  "userId": "owner-defined-user-id",
  "timestamp": "2026-09-25T12:00:00.000Z",
  "ip": "203.0.113.10",
  "userAgent": "optional user agent",
  "headers": {
    "optional": "selected metadata only"
  }
}
```

Rules:

- `userId`, `timestamp`, and `ip` are required.
- `userAgent` is optional.
- Do not accept passwords, password hashes, tokens, full user records, or arbitrary unrestricted headers.
- Normalize and limit field sizes.
- Define whether timestamps are accepted from the client or replaced/validated against server time.
- Ingestion failures must be documented as non-blocking for the customer's auth flow.

Suggested collection: `authEvents`

Suggested fields:

```text
_id
ownerId
eventType        // signup, login, login-failed
userId
occurredAt
receivedAt
ip
userAgent
metadata         // explicitly allowlisted fields only
createdAt
```

Suggested indexes:

- `{ ownerId: 1, occurredAt: -1 }`
- `{ ownerId: 1, eventType: 1, occurredAt: -1 }`
- `{ ownerId: 1, userId: 1, occurredAt: -1 }`

### 4.3 Dashboard Data API

Add authenticated owner endpoints for dashboard data:

- `GET /api/dashboard/summary`
- `GET /api/dashboard/events`

The endpoints must scope every query to the authenticated owner. They must never allow one owner to read another owner's events.

Summary metrics:

- Signups today.
- Successful logins today.
- Failed logins today.
- Total events today.
- Recent event count or activity trend.

Recent events:

- Event type.
- User ID.
- IP address.
- User agent when available.
- Event time.

Support pagination and a bounded date range for event queries.

### 4.4 Dashboard Integration

Replace the hard-coded Phase 1 dashboard data with API-backed data.

Keep the existing visual language, but make these parts real first:

- KPI cards for signup, login, and failed-login totals.
- Recent authentication event list.
- Loading, empty, and error states.
- Refresh behavior.
- Clear distinction between collected events and future risk-analysis features.

The existing threat, bot, ML, and adaptive-protection modules should remain explicitly marked as future functionality until their data and logic exist.

### 4.5 Integration Example and Verification

Add documentation showing how a customer's backend sends events without blocking authentication.

The integration example should:

- Send the request asynchronously.
- Set a short timeout.
- Ignore SecureBase failures from the customer's auth response path.
- Avoid logging secrets or sensitive payloads.

Add a small test script that:

1. Sends signup, login, and login-failed events.
2. Verifies successful ingestion.
3. Fetches dashboard data using the owner session.
4. Confirms the events appear with the correct owner scope.
5. Verifies invalid keys and invalid payloads are rejected.

### Phase 1 Definition Of Done

- A new owner can register and sign in.
- The owner can generate and revoke an API key.
- A test script can send all three event types.
- Events are stored in SecureBase's MongoDB with owner isolation.
- Dashboard totals and recent events come from MongoDB.
- Invalid API keys and malformed payloads fail safely.
- No password or full user record is accepted or stored.
- Customer authentication remains independent of SecureBase availability.
- The feature can be demonstrated locally and deployed to Vercel.

## 5. Phase 2: Optional Baseline Import

Add an optional, one-time read-only import for existing customer users.

- Accept a narrowly scoped read-only MongoDB connection.
- Inspect a sample document only.
- Present discovered fields for user ID and account creation date.
- Never request or read password fields.
- Import only user ID and account age into SecureBase's database.
- Provide progress, completion, and failure states.
- Keep Phase 1 fully usable without this feature.

## 6. Phase 3: Rule-Based Trust Scoring

Introduce explainable scoring after event ingestion is reliable.

- Store historical scoring details in MongoDB.
- Add Redis only when fast score lookups are required and the deployment model is defined.
- Start unknown users and IPs at a neutral score.
- Lower scores for repeated failed logins and high request frequency.
- Slightly increase scores for established accounts with normal activity.
- Expose a score lookup API or SDK for customer middleware.
- Provide recommendations for rate limiting while keeping enforcement in the customer's app.

## 7. Phase 4: ML-Assisted Detection

Add ML only after rule-based scoring and data quality are established.

- Define and version feature extraction.
- Train an anomaly or bot-likelihood model from approved metadata.
- Keep deterministic rules as a fallback and safety layer.
- Record why an event was flagged and which method produced the result.
- Start with a manually triggered retraining process.

## 8. Later Features

Defer these until the event platform is stable:

- Full auth-provider mode.
- Installable authentication UI package.
- WAF rule sets.
- Fraud detection.
- SQL, Firebase, and other database integrations.
- Real-time owner alerts.

Full auth-provider mode must remain opt-in because it changes SecureBase from an independent observer into a dependency in the customer's auth path.

## 9. Security and Reliability Checklist

- Hash API keys at rest.
- Use constant-time key-hash comparison where applicable.
- Scope every owner query by owner ID.
- Add request-body size limits.
- Validate and allowlist event fields.
- Add ingestion rate limiting before public release.
- Avoid storing sensitive headers by default.
- Add retention rules for event metadata.
- Keep secrets in environment variables.
- Use secure cookies in production.
- Document fail-open integration behavior.
- Add audit logging for API-key creation, revocation, and use.

## 10. Suggested Implementation Order

1. Define API-key and event schemas.
2. Add shared owner/API-key authentication helpers.
3. Add API-key management endpoints and dashboard controls.
4. Add event validation and ingestion endpoints.
5. Add indexes and owner-scoped dashboard query endpoints.
6. Replace dashboard mock data with real API data.
7. Add integration documentation and the event test script.
8. Run local end-to-end verification and deploy a Phase 1 demo.
9. Only then begin baseline import and scoring work.
