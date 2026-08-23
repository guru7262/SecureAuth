# SecureBase — Build Spec & Phase Roadmap

## What this is
SecureBase is a traffic/identity **analyser** that sits alongside a site owner's app. The owner keeps their own authentication entirely — their own DB, their own login/session logic, untouched and independent. SecureBase never issues JWTs, never writes to the owner's DB, and is never a dependency in the owner's auth path. Instead, the owner's backend notifies SecureBase of auth-relevant events (signup, login, failed login) via a simple webhook/event call, and SecureBase mirrors just that event metadata into its own DB to build a trust score per user/IP, monitor traffic, and apply rate-limit recommendations.

Full auth-provider mode (SecureBase issuing JWTs and owning the login flow) is deferred to a later phase — see Phase 5.

## Core Principles (keep these true in every phase)
- SecureBase is never in the owner's critical auth path. If SecureBase is down, the owner's login/signup must keep working.
- SecureBase never gets write access to the owner's DB. No credentials, no direct writes for v1.
- SecureBase only stores **event metadata** it's told about (user id, event type, timestamp, IP, headers) — never passwords, never full user records.
- SecureBase recommends, owner's app enforces (for scoring/blocking decisions) — avoids SecureBase being liable for "denying" real users.
- Fail-open by default if SecureBase is unreachable — availability > strictness for now.
- v1 scope = MongoDB only (for SecureBase's own storage). Other DBs = future roadmap.
- Every phase should work as a standalone demoable feature, not just a half-built layer.

---

## PHASE 1 — Owner Onboarding + Event Ingestion + Basic Dashboard (BUILD THIS FIRST)
**Goal:** A site owner can sign up for SecureBase, get an API key, send auth events (signup/login/failed-login) to SecureBase via a simple webhook call, and see them show up on a dashboard.

**Build:**
1. **Owner-facing side (SecureBase's own product):**
   - ✅ Owner signup/login (this is SecureBase's own account system, separate from their end-users) — **DONE**
   - ✅ Generates an API key per owner, used to authenticate event calls — **DONE** (JWT-based auth with HttpOnly cookies)
   - ✅ Basic dashboard shell (empty state, will fill in later phases) — **DONE**

2. **Event ingestion (what the owner's app calls):**
   - REST API: `POST /events/signup`, `POST /events/login`, `POST /events/login-failed`
   - Each call sends: user id (owner's own id for that user), timestamp, IP, optional headers/user-agent
   - SecureBase stores this as an event log in its own MongoDB — no password, no full user record, ever
   - This call should be fire-and-forget from the owner's side — a failure to reach SecureBase must never block their own login/signup flow (document this expectation clearly in the integration instructions)

3. **Dashboard v1 shows:**
   - Total signups / logins today
   - Failed login attempts
   - Simple list of recent auth events

**Tech:** Node.js + Express (Vercel Serverless Functions), MongoDB (SecureBase's own event store), JWT auth for the ingestion endpoint, React dashboard (Vite).

**Definition of done:** A test "owner" gets an API key, a test script fires signup/login/failed-login events at your ingestion endpoint, and they show up correctly on the dashboard. Killing the SecureBase server does not break any owner-side auth (there isn't any owner-side dependency to break, by design).

---

## PHASE 2 — Baseline Import for Existing Users (Optional, Read-Only)
**Goal:** For owners with an existing site (users who signed up before integrating SecureBase), give their existing users a fair starting trust score instead of having no history for them.

**Build:**
1. Owner optionally provides a **read-only, scoped** MongoDB credential (only for this one-time import — not required for Phase 1 to work).
2. Read-only schema inspection: sample a MongoDB collection (`findOne`) and list field names found.
3. Simple mapping UI: owner picks which field = user id, which = created_at (dropdowns from inspected fields). No password fields are ever touched or requested.
4. One-time import job: pulls existing user metadata (id + account age only) → creates baseline score entries for old/existing users in SecureBase's own DB.
5. This step is explicitly optional — Phase 1 works fully without it; this only improves scoring quality for pre-existing users.

**Definition of done:** Connecting an existing (pre-populated) MongoDB read-only, mapping fields once, and seeing existing users appear in the dashboard with a default/neutral trust score based on account age.

---

## PHASE 3 — Scoring System (Rule-Based First, No ML Yet)
**Goal:** Every request/user gets a trust score based on simple deterministic rules. This becomes the foundation ML will sit on top of later.

**Build:**
1. Score store: Redis (fast lookups) + MongoDB (historical detail) — two-DB pattern, decide this now.
2. SDK/middleware function: `getScore(userId or IP)` — fast, synchronous-feeling call.
3. Async ingestion endpoint: owner's middleware fire-and-forgets request metadata (IP, headers, timing, endpoint, auth status) to SecureBase.
4. Rule engine (simple, explainable):
   - New/unknown user or IP → neutral default score
   - High request frequency in short time → lower score
   - Repeated failed logins → lower score
   - Old account (from Phase 2 import) with normal activity → slightly higher score
5. Rate limiter using the score + basic thresholds (e.g., X requests/minute per IP/user).

**Definition of done:** A test script hammering the API gets flagged/rate-limited; a normal-behavior test user keeps a neutral/good score. Dashboard shows score changes over time.

---

## PHASE 4 — ML Layer (Upgrade Scoring)
**Goal:** Replace/augment the rule engine with a trained model for bot-likelihood/anomaly scoring.

**Build:**
1. Feature extraction from logged request metadata (timing patterns, header consistency, request frequency, session behavior).
2. Python service (scikit-learn/TensorFlow) exposed via internal API to the Node.js backend.
3. Model output: anomaly/bot-likelihood score, feeds into the same score store as Phase 3 (rules become a fallback/safety net under the ML score, not replaced entirely).
4. Retraining/update path (can be manual for now — document it, don't over-engineer).

**Definition of done:** ML-based score visibly differs from pure rule-based score on the same test traffic, and dashboard can show which detection method flagged a given event.

---

## PHASE 5 — Additional Services (later, after core is solid)
- **Full auth-provider mode (optional/advanced):** SecureBase issues JWTs, hashes passwords, and writes new users directly into the owner's DB via a scoped read/write credential — for owners who want to skip building auth entirely. This reintroduces SecureBase as a dependency in the login path, so it must ship with clear fail-open/fail-closed guidance and be positioned as opt-in, not the default integration.
- Prebuilt installable auth UI framework (npm package + config file, from earlier discussion) — builds on the full auth-provider mode above
- WAF-style rule sets
- Fraud detection
- Multi-DB support (SQL, Firebase, etc.)
- Webhook-based real-time alerts to owners

---

## How to use this doc with AI coding assistants
When starting a session on a specific phase, tell the AI:
- Which phase you're on
- Paste only the relevant phase section above
- Mention the Core Principles section every time (keeps the AI from over-engineering or drifting into full-BaaS scope)
- State current tech stack decisions already made, so it doesn't re-litigate them
