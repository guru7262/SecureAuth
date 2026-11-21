# Sentinel --- AI-Powered Website Security Platform

## Project Planning, System Architecture, and AI Development Specification

**Document purpose:** This document is the source of truth for an AI
coding agent or development team working on the Sentinel college major
project. It defines the product scope, architecture, components, data
flows, SDK contracts, security requirements, development phases, and
acceptance criteria.

**Project type:** College major project / functional prototype\
**Working name:** Sentinel\
**Primary objective:** Build an independent, SDK-based website security
platform that monitors customer websites hosted on any provider, detects
suspicious activity using rules and machine learning, and enforces
security decisions through customer-installed frontend and backend SDKs.

------------------------------------------------------------------------

# 1. Product Vision

Sentinel is an independent website security and monitoring platform. It
is **not a hosting provider, CDN, reverse proxy, or mandatory network
middleman**.

A customer may host their website on Vercel, AWS, Azure, Google Cloud,
Netlify, Hostinger, a VPS, or any other provider. They register their
website in Sentinel and integrate:

1.  A **Frontend JavaScript/TypeScript SDK** for browser-side
    behavioural telemetry.
2.  A **Backend SDK** for trusted server-side request monitoring and
    enforcement.

The SDKs communicate with Sentinel's central API. Sentinel processes
telemetry, applies security rules, evaluates machine-learning
predictions, calculates risk, and returns security decisions. The
customer's backend SDK enforces applicable decisions locally.

## 1.1 Core product principles

-   Independent of the customer's hosting provider.
-   Frontend and backend SDK integration.
-   Hybrid detection: deterministic security rules + ML classification +
    anomaly detection.
-   Enforcement happens in the customer's application through the
    backend SDK.
-   Monitoring-only mode must be available before enforcement is
    enabled.
-   Fail-safe behaviour must be configurable and documented.
-   Multi-tenant architecture: customer data must be isolated.
-   Privacy-conscious collection: collect only what is needed.
-   Modular design so each security feature can be developed and tested
    independently.
-   The project must contain a real trained and evaluated ML model, not
    hard-coded or random predictions.

## 1.2 Important architectural limitation

Because Sentinel is not in the request path, it cannot independently
inspect or block every network request. It can only observe events
instrumented by the frontend/backend SDKs and other explicitly
configured integrations.

The backend SDK is the enforcement point. It can block or challenge
requests that pass through middleware installed in the customer's
application. It cannot stop traffic that overwhelms the customer's
network or hosting provider before the application receives it.

Therefore: - Implement application-layer rate limiting and abuse
controls. - Describe DDoS functionality as application-layer traffic
anomaly detection and mitigation. - Do not claim complete network-layer
DDoS protection. - Do not claim that browser telemetry proves a visitor
is human. - Do not trust frontend-generated risk or identity claims;
validate server-side.

------------------------------------------------------------------------

# 2. Project Goals and Scope

## 2.1 Main goals

1.  Let users register, sign in, and manage one or more websites.
2.  Generate separate public and secret credentials for each website.
3.  Provide easy frontend and backend SDK integration.
4.  Collect browser behaviour and server-side request/security events.
5.  Normalize events and create behavioural features.
6.  Detect bots and suspicious activity using a hybrid detection system.
7.  Produce a risk score, classification, explanation, and recommended
    action.
8.  Enforce decisions through backend middleware.
9.  Provide a dashboard with live and historical security analytics.
10. Store security events, detections, rules, alerts, and audit history.
11. Support local development and reproducible deployment using Docker
    Compose.

## 2.2 In-scope modules

  -----------------------------------------------------------------------
  Module                              Responsibilities
  ----------------------------------- -----------------------------------
  Dashboard and account management    Authentication, website
                                      registration, settings

  Frontend SDK                        Browser telemetry and session
                                      events

  Backend SDK                         Request monitoring, authentication
                                      events, enforcement

  Core API                            SDK ingestion, authentication,
                                      configuration and decision APIs

  Event processing                    Validation, normalization,
                                      aggregation

  Bot detection                       Human / good bot / suspicious
                                      automation / malicious bot
                                      classification

  Anomaly detection                   Identify unusual traffic and
                                      behaviour

  Rule engine                         Deterministic security rules

  Risk and decision engine            Combine signals and select action

  Enforcement                         Allow, monitor, rate-limit,
                                      challenge, block

  API security                        Endpoint abuse and suspicious API
                                      usage

  Authentication security             Brute-force and credential-stuffing
                                      indicators

  Threat intelligence                 Local indicators and reputation
                                      records

  Dashboard analytics                 Traffic, attacks, detections,
                                      actions and alerts

  Audit and configuration             Rule changes, enforcement actions
                                      and admin activity
  -----------------------------------------------------------------------

## 2.3 Out of scope for the initial college prototype

-   Operating a global CDN or reverse proxy.
-   Network-layer DDoS scrubbing.
-   Guaranteed identification of every bot.
-   Automatic integration with every hosting provider.
-   Production-grade global threat intelligence feeds.
-   Guaranteed CAPTCHA solving or identity verification.
-   Collection of passwords, payment card data, or form contents.
-   Blocking requests that never reach the customer's application or
    SDK.

These may be described as future extensions, not as completed features.

------------------------------------------------------------------------

# 3. Users and Main Workflows

## 3.1 Platform user roles

-   **Platform user / website owner:** Registers websites, configures
    rules, views analytics.
-   **Website administrator:** Manages website security settings and
    integrations.
-   **SDK client:** A customer's application sending telemetry and
    requesting decisions.
-   **Sentinel administrator (optional for prototype):** Manages
    platform-level configuration and model versions.

Implement role-based authorization where appropriate. A user must only
access websites they own or have been granted access to.

## 3.2 Website onboarding workflow

1.  User creates a Sentinel account and signs in.
2.  User creates a website entry with a name, domain, category, and
    environment.
3.  Sentinel generates:
    -   `site_id`
    -   public site key for browser SDK
    -   secret server key for backend SDK
4.  Dashboard displays installation instructions.
5.  Customer installs frontend and/or backend SDK.
6.  SDK sends a test event.
7.  Dashboard shows integration status and last-seen timestamp.
8.  User starts in monitor-only mode.
9.  User reviews detections and configures enforcement.
10. User enables selected actions after testing.

Never expose the server secret key in frontend code or public
documentation. Store secrets securely, display them only at creation
where possible, and support rotation/revocation.

## 3.3 Request protection workflow

1.  Visitor sends a request to the customer's website.
2.  Customer backend middleware receives the request.
3.  Middleware extracts permitted request metadata.
4.  Middleware applies immediate local safety controls, such as basic
    rate limiting.
5.  Middleware sends an event or feature summary to Sentinel.
6.  Sentinel validates and processes the event.
7.  Rules and ML services evaluate the activity.
8.  Risk engine creates a decision.
9.  Backend SDK obtains or receives the decision.
10. Middleware applies the configured action before protected
    application logic proceeds.
11. Security event and action are recorded.
12. Dashboard updates analytics.

**Performance requirement:** Do not make every customer request wait
indefinitely for a remote ML prediction. Use short timeouts, caching,
local rules, and configurable fail-open/fail-closed behaviour. Document
the trade-off. For a prototype, synchronous decisions may be implemented
for selected routes, but must have a timeout and fallback.

------------------------------------------------------------------------

# 4. High-Level Architecture

``` text
                         SENTINEL PLATFORM
┌────────────────────────────────────────────────────────────────────┐
│                         Management Layer                           │
│  Web Dashboard | Account/Auth | Website Config | Rules | Reports   │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                         Core API / API Gateway
                                │
┌───────────────────────────────┴────────────────────────────────────┐
│                         Ingestion Layer                            │
│       SDK Event API | Request Validation | Tenant Authentication   │
└───────────────────────────────┬────────────────────────────────────┘
                                │
                         Event Processing
                                │
                   Normalization / Aggregation
                                │
                    Feature Engineering Layer
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
        Rule Detection                       ML Detection
              │                         ┌─────────┴─────────┐
              │                         │                   │
        Security Rules              Classifier        Anomaly Model
              │                         │                   │
              └─────────────────────────┴───────────────────┘
                                │
                         Risk Scoring
                                │
                         Decision Engine
                                │
                   Decision API / Decision Cache
                                │
                  Customer Backend SDK Middleware
                                │
                  Allow / Monitor / Limit / Challenge /
                                Block
                                │
                     Security Event Reporting
                                │
                   Database / Analytics / Alerts
                                │
                         Web Dashboard
```

## 4.1 Client integration view

``` text
CUSTOMER WEBSITE (hosted anywhere)
       │
       ├── Frontend application
       │       └── Sentinel Frontend SDK
       │              └── Browser telemetry ───────────┐
       │                                               │
       └── Customer backend                             │
               └── Sentinel Backend SDK                │
                      ├── Request monitoring           │
                      ├── Local rate limiting          │
                      ├── Decision lookup              │
                      └── Enforcement                  │
                              │                         │
                              └──── Sentinel API ◄─────┘
                                         │
                                  Detection services
                                         │
                                  Decision response
                                         │
                                  Backend enforcement
```

------------------------------------------------------------------------

# 5. Recommended Technology Stack (Option B — Hybrid Architecture)

Use a hybrid stack that leverages Node.js for high-throughput event ingestion and API operations, MongoDB for flexible document/event storage, React for the management dashboard, and a dedicated Python microservice for Machine Learning and anomaly detection.

  -------------------------------------------------------------------------------------------------------
  Area                    Selected Technology                Notes
  ----------------------- ---------------------------------- --------------------------------------------
  Dashboard               React 18 + Vite                    Responsive web dashboard with custom CSS
                                                             design system (located in `client/`)

  UI styling              Custom CSS + CSS Variables         High-performance Vercel/Linear dark theme;
                                                             zero-runtime CSS overhead

  Charts                  Recharts                           Traffic, threat distribution, and timeline
                                                             visualizations

  Frontend SDK            TypeScript / Vanilla JS            Browser behavioural telemetry package
                                                             (`@sentinel-security/browser`)

  Backend SDK             TypeScript / Node.js               Express/Node.js middleware package
                                                             (`@sentinel-security/node`)

  Core API & Ingestion    Node.js + Express / Serverless     High-throughput SDK ingestion, auth,
                                                             website CRUD, rule engine (`api/`)

  ML Microservice         Python + FastAPI                   Dedicated service for bot classification
                          (scikit-learn, XGBoost/LightGBM)   and Isolation Forest anomaly detection
                                                             (`ml-service/`)

  Database                MongoDB                            Document database for users, sites, API keys,
                                                             normalized event logs, and decisions

  Cache / Rate Limiting   Redis (or In-Memory LRU)           Fast lookup cache for rate limits, session
                                                             counters, and active IP scores

  API Documentation       OpenAPI / Swagger + Postman        SDK & Central API contracts

  Testing                 Vitest / Jest, Pytest              Unit and integration tests across JS & Python

  Packaging               npm workspaces                     Manage `client/`, `api/`, and SDK packages

  Deployment              Local / Vercel / Docker Compose    Modular multi-service local environment
  -------------------------------------------------------------------------------------------------------

## 5.1 Architecture topology

Build a **modular hybrid system**:
- `client`: React 18 + Vite management dashboard.
- `api`: Node.js / Express core service handling user accounts, website management, SDK event ingestion (`/api/v1/sdk/events`), deterministic rule evaluation, and decision serving (`/api/v1/sdk/decisions`).
- `ml-service`: Standalone Python microservice (FastAPI/Flask) exposing inference endpoints (`/predict`, `/anomaly`) called by the Node.js decision engine.
- `mongodb`: Database storing tenant accounts, registered websites, API keys, event logs, rules, and security incident logs.
- `packages/browser-sdk`: Browser telemetry library.
- `packages/node-sdk`: Backend middleware library.

------------------------------------------------------------------------

# 6. Frontend SDK Specification

Package name (working): `@sentinel-security/browser`

## 6.1 Responsibilities

-   Initialize using a public site key and site ID.
-   Create or reuse a pseudonymous session identifier.
-   Collect minimal behavioural events.
-   Calculate summaries locally where possible.
-   Batch and send telemetry to Sentinel.
-   Respect consent and customer configuration.
-   Avoid collecting sensitive form values or keystrokes.
-   Handle network errors without breaking the customer's website.

## 6.2 Suggested browser events

  -----------------------------------------------------------------------
  Event                               Data to collect
  ----------------------------------- -----------------------------------
  `page_view`                         Page path (sanitized), timestamp,
                                      referrer category

  `page_visibility`                   Visible/hidden state changes

  `click_summary`                     Count and timing summary, not
                                      arbitrary page content

  `scroll_summary`                    Scroll depth buckets and event
                                      count

  `pointer_summary`                   Coarse interaction frequency; do
                                      not record precise movement trails

  `navigation`                        Navigation sequence using sanitized
                                      paths

  `session_start`                     Session start timestamp

  `session_end`                       Session duration / last activity

  `js_capability`                     Basic supported browser
                                      capabilities
  -----------------------------------------------------------------------

Do not collect: - Passwords. - Payment information. - Text typed into
forms. - Full DOM contents. - Precise mouse trails. - Unnecessary
canvas/audio/device fingerprints. - Sensitive URL query parameters or
tokens.

Browser signals are untrusted and can be forged. Treat them as weak
supporting features, never proof of a human visitor.

## 6.3 Example integration

``` ts
import { SentinelBrowser } from "@sentinel-security/browser";

SentinelBrowser.init({
  siteId: "SITE_ID",
  publicKey: "PUBLIC_SITE_KEY",
  endpoint: "https://api.example.test",
  consent: true,
  mode: "monitor"
});
```

The SDK API should be documented and stable. Exact names may change
during implementation, but keep the public interface simple.

## 6.4 Browser SDK requirements

-   Use TypeScript types.
-   Avoid blocking page rendering.
-   Batch telemetry rather than sending every event individually.
-   Use `sendBeacon` when suitable, with a fetch fallback.
-   Retry only safe telemetry operations with bounded retries.
-   Add sampling and event limits.
-   Support disable/opt-out configuration.
-   Sanitize URLs and referrers.
-   Never include the server secret key.
-   Include unit tests for event collection, batching, sanitization and
    network failure.

------------------------------------------------------------------------

# 7. Backend SDK Specification

Initial package: `@sentinel-security/node`

Start with Node.js and Express. Keep the design extensible to other
languages later.

## 7.1 Responsibilities

-   Authenticate with Sentinel using a server secret.
-   Identify the registered site.
-   Extract request metadata.
-   Exclude configured routes and sensitive fields.
-   Apply local rate limits.
-   Report request and authentication events.
-   Retrieve risk decisions.
-   Enforce allow, monitor, rate-limit, challenge, or block actions.
-   Cache short-lived decisions.
-   Provide a fallback if Sentinel is unavailable.

## 7.2 Example Express integration

``` ts
import express from "express";
import {
  sentinelMiddleware,
  sentinelAuthEvent
} from "@sentinel-security/node";

const app = express();

app.use(express.json());

app.use(sentinelMiddleware({
  siteId: process.env.SENTINEL_SITE_ID!,
  secretKey: process.env.SENTINEL_SECRET_KEY!,
  endpoint: process.env.SENTINEL_API_URL!,
  mode: "monitor",
  timeoutMs: 300,
  failMode: "open"
}));

app.post("/login", async (req, res) => {
  // Application authentication logic.
  // Report success/failure through a safe event API.
  res.sendStatus(200);
});
```

This is an illustrative target API, not a claim that the package already
exists. The AI developer must implement and test it.

## 7.3 Request metadata

Collect only what is necessary: - Method. - Sanitized route or route
template. - Timestamp. - Response status. - Request content length. -
User-Agent (subject to privacy policy). - IP address or a
minimized/pseudonymized representation where feasible. - Session
identifier if supplied by the application. - Authentication outcome
events. - Request duration. - Rate-limit counters.

Do not store request bodies by default. Never collect passwords,
authorization tokens, cookies, payment details, or arbitrary form
content.

## 7.4 Middleware order and enforcement

The middleware must run before protected route handlers.

Suggested flow: 1. Identify route and site. 2. Apply local emergency
rate limit. 3. Build a sanitized event. 4. Check cached decision or
request a remote decision with a short timeout. 5. Apply configured
action. 6. Continue to route or return an appropriate response. 7.
Record the action asynchronously.

For challenge actions, provide a documented integration contract. A
backend cannot display a browser challenge by itself; it can return a
challenge response that the frontend handles, or integrate with a
customer-provided challenge mechanism.

## 7.5 Fail behaviour

Support configuration: - `failMode: "open"` --- if Sentinel is
unavailable, allow the request subject to local safety controls. -
`failMode: "closed"` --- deny protected requests if a decision cannot be
obtained.

Default to `open` for general website routes. For sensitive routes, let
the website owner explicitly choose a stricter policy. Never silently
change the customer's selected mode.

------------------------------------------------------------------------

# 8. Core API and Service Modules

The platform is split into the Core Node.js API (`api/`) and the Python ML Microservice (`ml-service/`).

### Suggested Directory Structure:

``` text
api/
  auth/
    signup.js              # User registration
    login.js               # Sign in & issue JWT
    logout.js              # Clear auth cookie
    me.js                  # Session profile verification
    forgot-password.js     # Password reset token request
    reset-password.js      # Password update with token
  websites/
    index.js               # List websites / Create website
    [siteId]/
      index.js             # Website details / Update settings
      keys.js              # Rotate / revoke SDK keys
      integration.js       # SDK snippet generation
  events/
    ingest.js              # Ingestion endpoint (/api/v1/sdk/events)
  decisions/
    index.js               # Real-time decision endpoint (/api/v1/sdk/decisions)
    feedback.js            # Customer feedback on enforcement
  rules/
    index.js               # Site security rules CRUD
  analytics/
    overview.js            # Traffic, attack summary, KPIs
    traffic.js             # Real-time traffic series
    threats.js             # Incident and threat log
  lib/
    auth.js                # JWT & bcrypt utilities
    mongodb.js             # MongoDB connection pool & collection helpers
    validation.js          # Zod schema definitions
    response.js            # Standardized API response wrappers
    rule-engine.js         # Deterministic rule evaluator
    risk-aggregator.js     # Combines rule score + ML score + anomaly score
    ml-client.js           # HTTP client to Python ml-service

ml-service/
  app.py                   # FastAPI / Flask inference server
  requirements.txt         # scikit-learn, xgboost/lightgbm, pandas, numpy
  models/
    bot_classifier.joblib  # Trained tabular classifier
    anomaly_detector.joblib# Isolation Forest model
  training/
    train_bot_model.py     # Controlled synthetic & labelled traffic trainer
    train_anomaly.py       # Baseline traffic anomaly trainer
    evaluate.py            # ROC-AUC, Precision, Recall, Confusion Matrix
  services/
    features.py            # Feature extractor from raw event payloads
    inference.py           # Model scoring & reason code generation
```

## 8.1 Suggested API endpoints

### Account and website management

  Method   Endpoint                                   Purpose
  -------- ------------------------------------------ ---------------------
  POST     `/api/v1/auth/register`                    Create account
  POST     `/api/v1/auth/login`                       Sign in
  POST     `/api/v1/websites`                         Register website
  GET      `/api/v1/websites`                         List owned websites
  GET      `/api/v1/websites/{site_id}`               Website details
  PATCH    `/api/v1/websites/{site_id}`               Update settings
  POST     `/api/v1/websites/{site_id}/keys/rotate`   Rotate credentials

### SDK ingestion and decisions

  Method   Endpoint                          Purpose
  -------- --------------------------------- ----------------------------------
  POST     `/api/v1/sdk/events`              Submit telemetry/security events
  POST     `/api/v1/sdk/decision`            Request risk decision
  POST     `/api/v1/sdk/decision-feedback`   Report enforcement result
  POST     `/api/v1/sdk/heartbeat`           Report SDK integration status

### Security configuration and analytics

  --------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                 Purpose
  ----------------------- -------------------------------------------------------- -----------------------
  GET                     `/api/v1/websites/{site_id}/rules`                       List security rules

  PUT                     `/api/v1/websites/{site_id}/rules`                       Update security rules

  GET                     `/api/v1/websites/{site_id}/events`                      List security events

  GET                     `/api/v1/websites/{site_id}/detections`                  List detections

  GET                     `/api/v1/websites/{site_id}/analytics/overview`          Dashboard metrics

  GET                     `/api/v1/websites/{site_id}/analytics/timeseries`        Traffic time series

  GET                     `/api/v1/websites/{site_id}/alerts`                      List alerts

  POST                    `/api/v1/websites/{site_id}/alerts/{alert_id}/resolve`   Resolve alert
  --------------------------------------------------------------------------------------------------------

All endpoints must validate ownership and tenant scope. Do not trust a
`site_id` supplied by the caller without checking that the credential is
authorized for that site.

------------------------------------------------------------------------

# 9. Event Schema and Data Pipeline

Define a versioned event contract shared by both SDKs and the central
API.

## 9.1 Common event structure

``` json
{
  "schema_version": "1.0",
  "event_id": "unique-event-id",
  "site_id": "site-id",
  "source": "backend",
  "event_type": "http_request",
  "timestamp": "2026-11-20T12:00:00Z",
  "session_id": "pseudonymous-session-id",
  "data": {
    "method": "POST",
    "route": "/api/login",
    "status_code": 401,
    "duration_ms": 120
  }
}
```

Use UTC timestamps. Validate event size, field types, allowed event
types and schema version.

## 9.2 Pipeline

1.  Receive event.
2.  Authenticate SDK credential.
3.  Validate tenant ownership.
4.  Validate schema and timestamp.
5.  Apply size and rate limits.
6.  Sanitize sensitive fields.
7.  Normalize event.
8.  Store raw/minimized event according to retention policy.
9.  Update session/window aggregates.
10. Build features.
11. Run rules and models.
12. Store detection and decision.
13. Publish dashboard update.

For the first working version, a synchronous pipeline is acceptable. Add
a background queue after the end-to-end flow works.

## 9.3 Time-window features

Calculate features over windows such as: - 10 seconds. - 1 minute. - 5
minutes. - Session lifetime.

Example feature fields: - `requests_10s` - `requests_1m` -
`requests_5m` - `mean_inter_request_ms` - `std_inter_request_ms` -
`unique_routes_1m` - `repeated_route_ratio` - `failed_status_ratio` -
`failed_login_count_5m` - `session_duration_s` - `page_views_1m` -
`click_count_bucket` - `scroll_count_bucket`

Ensure feature values are computed from events available to the server.
Frontend-derived fields must be marked as untrusted.

------------------------------------------------------------------------

# 10. Machine Learning Plan

The ML component must be real, reproducible, explainable, and evaluated.

## 10.1 Detection classes

Use a multi-class classifier where dataset quality permits:

1.  `human`
2.  `good_bot`
3.  `suspicious_automation`
4.  `malicious_bot`

If reliable labels for all four classes are unavailable, begin with
binary classification (`human_or_legitimate` versus
`malicious_or_automated`) and clearly document the limitation. Do not
invent labels.

A good crawler is not malicious merely because it is automated. Verify
known crawlers appropriately; user-agent strings alone can be spoofed.

## 10.2 Models

Recommended development sequence:

  Model                  Purpose                          Priority
  ---------------------- -------------------------------- ----------
  Logistic Regression    Baseline                         First
  Random Forest          Baseline non-linear model        First
  XGBoost or LightGBM    Main tabular classifier          Second
  Isolation Forest       Unsupervised anomaly detection   Second
  LSTM / deep learning   Optional future research         Later

Do not start with deep learning. Tabular behavioural features are a good
fit for tree-based models.

## 10.3 Dataset sources

Use a combination of: - Public research datasets where their license and
schema permit. - Controlled traffic generated by test browsers and
scripts. - A local demonstration website instrumented with the SDKs. -
Carefully reviewed and labelled test scenarios.

Create controlled scenarios for: - Normal browsing. - Legitimate crawler
behaviour. - Rapid page scraping. - Repeated endpoint requests. -
Brute-force login attempts. - Credential-stuffing-like test traffic
using dummy accounts only. - Automated account creation against a local
test app. - API enumeration and repeated invalid requests.

Do not use real users' sensitive data or run attack simulations against
third-party websites.

## 10.4 Dataset quality and leakage prevention

-   Store labels with provenance: how and why the example was labelled.
-   Do not label all high request rates as malicious.
-   Do not label all sessions without mouse activity as bots.
-   Split train/validation/test by session or source group, not random
    rows from the same session.
-   If possible, use a time-based test split to simulate future traffic.
-   Prevent website-specific identifiers from leaking labels.
-   Keep a separate final test set untouched during model tuning.
-   Document class imbalance and use suitable class weights or sampling.

## 10.5 Evaluation metrics

Report: - Precision. - Recall. - F1 score. - Confusion matrix. -
False-positive rate. - False-negative rate. - ROC-AUC and/or PR-AUC
where appropriate. - Per-class metrics for multi-class classification. -
Inference latency.

For a security product, false positives are especially important. A
model that blocks legitimate visitors is not successful even if its
overall accuracy looks high.

## 10.6 Model artifacts and serving

Store: - Model file. - Feature schema/version. - Training
configuration. - Dataset version and provenance. - Evaluation report. -
Model version. - Training timestamp.

Inference must reject missing, malformed or incompatible feature schemas
safely. Never load untrusted model files.

## 10.7 Prediction output

``` json
{
  "model_version": "bot-model-0.1",
  "classification": "suspicious_automation",
  "probabilities": {
    "human": 0.08,
    "good_bot": 0.02,
    "suspicious_automation": 0.78,
    "malicious_bot": 0.12
  },
  "risk_score": 72,
  "reasons": [
    "High request rate in recent window",
    "Repeated route access"
  ]
}
```

Probabilities must come from the trained model and be
calibrated/evaluated where possible. Reasons should be generated from
interpretable features/rules, not fabricated.

------------------------------------------------------------------------

# 11. Rule Engine and Security Modules

ML should not be responsible for every security decision. Use
deterministic rules for well-defined patterns.

## 11.1 Rule engine

Rules should be configurable per website.

Example rule structure:

``` json
{
  "rule_id": "login-failure-limit",
  "enabled": true,
  "scope": "POST /api/login",
  "condition": {
    "metric": "failed_login_count",
    "window_seconds": 60,
    "operator": ">=",
    "value": 10
  },
  "action": "rate_limit",
  "severity": "high"
}
```

Rules must be validated and safely evaluated. Do not execute arbitrary
code from customer-defined rules.

## 11.2 Bot detection

Signals: - Request frequency and timing. - Repeated route patterns. -
Navigation sequence. - Session duration. - Browser capability
indicators. - Browser interaction summaries. - Known legitimate crawler
verification where feasible. - Backend request behaviour.

Avoid simplistic rules such as "no mouse movement means bot." Headless
browsers and real users can have overlapping behaviour.

## 11.3 Application-layer traffic abuse

Detect: - Bursts of requests. - Excessive requests per IP/session. -
Endpoint-specific spikes. - Repeated expensive route access. - Sudden
deviation from baseline.

Enforce through: - Per-IP or pseudonymous-client rate limits. -
Per-route rate limits. - Temporary cooldowns. - Configurable concurrency
limits where supported.

## 11.4 API security

Detect: - Repeated invalid endpoint requests. - Excessive calls to
sensitive endpoints. - Unusual method/route combinations. - Repeated
authorization failures. - API enumeration patterns. - Request-size
anomalies.

Do not claim full API schema validation or protection unless those
controls are implemented. Consider optional OpenAPI schema ingestion as
a later extension.

## 11.5 Authentication security

Customer backend must explicitly report authentication outcomes.
Sentinel cannot reliably infer login success/failure from browser
telemetry alone.

Events may include: - `login_attempt` - `login_success` -
`login_failure` - `password_reset_requested` - `account_created` -
`mfa_failure`

Do not send passwords, password hashes, authentication tokens, or full
credential payloads.

Detect: - Repeated failures by IP/session/account identifier. -
Distributed failures across many accounts. - Unusual attempt
frequency. - Repeated account creation. - Suspicious reset patterns.

Use privacy-preserving/pseudonymous account identifiers where possible.

## 11.6 Threat intelligence

For the prototype, maintain a local table of indicators: - Indicator
type. - Indicator value or protected hash. - Source. - Confidence. -
First seen. - Last seen. - Expiry. - Reason. - Status.

Do not treat a threat indicator as absolute proof. Use it as one signal
in the risk engine. Support expiry and manual review.

------------------------------------------------------------------------

# 12. Risk Scoring and Decision Engine

The decision engine combines: - Rule results. - ML model
probabilities. - Anomaly scores. - Threat indicators. - Route
sensitivity. - Customer-configured policy.

Do not simply add arbitrary weights and assume the resulting number is
statistically calibrated. Begin with a transparent weighted score for
the prototype, document the formula, and tune it using validation data.

## 12.1 Example initial policy

  Risk score   Default action
  ------------ ----------------
  0--20        Allow
  21--40       Monitor
  41--60       Rate limit
  61--80       Challenge
  81--100      Block

These are initial illustrative thresholds. Tune them using validation
results and customer route policy.

## 12.2 Decision response

``` json
{
  "decision_id": "decision-id",
  "site_id": "site-id",
  "action": "rate_limit",
  "risk_score": 55,
  "reason_codes": [
    "HIGH_REQUEST_RATE",
    "REPEATED_ROUTE_ACCESS"
  ],
  "retry_after_seconds": 30,
  "expires_at": "2026-11-20T12:01:00Z"
}
```

Use a stable set of reason codes. Include decision expiry and policy
version. Avoid exposing internal secrets or sensitive detection details
to untrusted clients.

## 12.3 Action semantics

-   `allow`: Continue request.
-   `monitor`: Continue and record event.
-   `rate_limit`: Return a suitable 429 response or apply local
    throttling.
-   `challenge`: Return a challenge response for frontend/customer
    integration.
-   `block`: Return a 403 or configured response.

Actions should be scoped to the relevant request, session, account, or
temporary client key. Avoid permanent broad IP bans by default.

------------------------------------------------------------------------

# 13. Dashboard Specification

Build a clean, modern, responsive dashboard. A dark theme is suitable,
but keep readability and accessibility high.

## 13.1 Main navigation

1.  Overview
2.  Websites
3.  Bot Analytics
4.  Attack Monitoring
5.  API Security
6.  Authentication Security
7.  Threat Intelligence
8.  Security Rules
9.  Alerts
10. Reports
11. SDK Integration
12. Settings

## 13.2 Overview page

Display: - Total monitored requests. - Human/legitimate traffic
estimate. - Good bots. - Suspicious automation. - Malicious bot
detections. - Blocked/challenged/rate-limited requests. - Security
events over time. - Top targeted routes. - Recent alerts. - Integration
health.

Label model estimates as estimates. Do not show fabricated live data in
production views. Demo seed data must be clearly identified as demo
data.

## 13.3 Bot analytics

-   Traffic classification distribution.
-   Bot activity time series.
-   Top suspicious sessions.
-   Detection reasons.
-   Confidence/probability distribution.
-   False-positive feedback status.

## 13.4 Attack monitoring

-   Attack/event timeline.
-   Event severity.
-   Source indicators.
-   Targeted routes.
-   Detection engine.
-   Action taken.
-   Investigation status.

## 13.5 Website details

Each website should have: - Domain and category. - Environment
(development/staging/production). - SDK integration status. - Last event
received. - Security mode. - Active rules. - Recent security events.

## 13.6 Security settings

Allow website owner to configure: - Monitor-only or enforcement mode. -
Rate limits. - Sensitive routes. - Login failure thresholds. - Challenge
behaviour. - Block duration. - Fail-open/fail-closed mode. - Event
sampling and retention.

Require confirmation for potentially disruptive changes. Log all
rule/configuration changes.

------------------------------------------------------------------------

# 14. Database Design (MongoDB)

Use MongoDB as the primary database store. Document collections map directly to tenant entities, configuration, telemetry event logs, and decision snapshots. Strict schema validation (via Zod in the API layer) and compound indexes ensure high query performance and data integrity.

Suggested collections:

  ------------------------------------------------------------------------------------------------------------------
  Collection                          Important Fields / Purpose
  ----------------------------------- ------------------------------------------------------------------------------
  `users`                             `_id`, `name`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt`

  `websites`                          `_id`, `userId` (owner), `domain`, `name`, `environment` (`dev`/`prod`),
                                      `category`, `status` (`active`/`paused`), `createdAt`, `updatedAt`

  `api_credentials`                   `_id`, `websiteId`, `userId`, `publicKey` (`sentinel_pub_...`),
                                      `secretKeyHash` (`sentinel_sec_...` hashed with SHA-256/bcrypt),
                                      `status` (`active`/`revoked`), `lastUsedAt`, `createdAt`

  `security_events`                   `_id`, `websiteId`, `source` (`browser`/`backend`), `eventType`
                                      (`page_view`, `login_attempt`, `request`), `timestamp`, `sessionId`,
                                      `ipAddress`, `userAgent`, `metadata` (sanitized headers, timing, path)

  `feature_snapshots`                 `_id`, `websiteId`, `sessionId`, `window` (`10s`/`1m`/`5m`),
                                      `requestCount`, `distinctRoutesCount`, `errorRate`, `computedAt`

  `detections`                        `_id`, `websiteId`, `eventId` / `sessionId`, `classification`
                                      (`human`, `good_bot`, `suspicious`, `malicious`), `confidence`,
                                      `anomalyScore`, `reasonCodes`, `detectedAt`

  `decisions`                         `_id`, `websiteId`, `targetType` (`ip`/`session`/`user`), `targetValue`,
                                      `action` (`allow`, `monitor`, `rate_limit`, `challenge`, `block`),
                                      `riskScore` (0-100), `reasons`, `expiresAt`, `createdAt`

  `security_rules`                    `_id`, `websiteId`, `ruleType` (`rate_limit`, `failed_login_threshold`,
                                      `ip_blacklist`), `parameters`, `action`, `enabled`, `updatedAt`

  `threat_indicators`                 `_id`, `type` (`ip`/`subnet`/`asn`), `value`, `threatLevel`,
                                      `source`, `expiresAt`

  `alerts`                            `_id`, `websiteId`, `severity` (`low`, `medium`, `high`, `critical`),
                                      `title`, `description`, `status` (`open`, `resolved`), `createdAt`

  `audit_logs`                        `_id`, `userId`, `websiteId`, `action`, `ipAddress`, `timestamp`

  `sdk_heartbeats`                    `_id`, `websiteId`, `sdkType` (`browser`/`node`), `sdkVersion`,
                                      `lastSeenAt`, `status`
  ------------------------------------------------------------------------------------------------------------------

## 14.1 Database rules & indexing

- **Tenant Isolation**: Every document in site-scoped collections MUST include `websiteId` (and where applicable, `userId`). Every query must enforce this boundary.
- **Indexes**:
  - `users`: `{ email: 1 }` (unique)
  - `websites`: `{ userId: 1 }`, `{ domain: 1 }`
  - `api_credentials`: `{ publicKey: 1 }` (unique), `{ websiteId: 1 }`
  - `security_events`: `{ websiteId: 1, timestamp: -1 }`, `{ websiteId: 1, sessionId: 1, timestamp: -1 }`, `{ websiteId: 1, ipAddress: 1 }`
  - `decisions`: `{ websiteId: 1, targetValue: 1, expiresAt: 1 }`
  - `security_rules`: `{ websiteId: 1, enabled: 1 }`
- **TTL Indexing / Retention**: Use MongoDB TTL (Time-To-Live) indexes on high-volume collections (`security_events`, expired `decisions`) to automatically purge aged telemetry data.
- **Credential Storage**: Never store secret keys in plaintext. Only store irreversible hashes (`secretKeyHash`). Only show the plaintext secret key once to the customer upon generation.

------------------------------------------------------------------------

# 15. Security, Privacy, and Reliability Requirements

Sentinel is itself a security-sensitive application. Its own security
must be part of the project.

## 15.1 Authentication and secrets

-   Hash user passwords with Argon2id or bcrypt using secure parameters.
-   Use secure session/token handling.
-   Validate authorization on every protected route.
-   Store server keys as hashes where feasible.
-   Support key rotation and revocation.
-   Never expose server keys in browser bundles.
-   Redact credentials from logs.

## 15.2 Tenant isolation

-   Verify ownership for every website-scoped operation.
-   Do not trust a caller-provided `site_id`.
-   Scope SDK credentials to a single website and allowed operations.
-   Test cross-tenant access attempts.
-   Ensure analytics and exports are tenant-scoped.

## 15.3 Input and API security

-   Validate all payloads using typed schemas.
-   Enforce request body size limits.
-   Rate-limit SDK ingestion.
-   Reject unsupported schema versions.
-   Protect against replay where relevant using timestamps, nonces or
    idempotency keys.
-   Use parameterized database queries.
-   Configure CORS narrowly for dashboard and SDK use cases.
-   Use HTTPS in deployed environments.

## 15.4 Privacy

-   Collect the minimum data necessary.
-   Avoid keystroke logging and form-content collection.
-   Avoid sensitive browser fingerprinting.
-   Sanitize URL query parameters.
-   Provide configurable retention and deletion.
-   Use pseudonymous identifiers where possible.
-   Document what the SDK collects.
-   Include a consent/configuration mechanism appropriate to the
    customer's deployment and applicable law.

## 15.5 Reliability

-   Use timeouts for remote decision calls.
-   Provide a configurable fail mode.
-   Keep local emergency rate limits available.
-   Cache short-lived decisions.
-   Avoid unbounded retries.
-   Prevent telemetry failures from breaking the customer's website.
-   Log errors without leaking secrets or personal data.

------------------------------------------------------------------------

# 16. Testing Strategy

Testing must cover the complete flow, not just individual components.

## 16.1 Unit tests

-   Event schema validation.
-   URL sanitization.
-   Feature calculations.
-   Rule evaluation.
-   Risk scoring.
-   Decision policy.
-   SDK batching.
-   Rate limiter.
-   Model inference schema.

## 16.2 Integration tests

-   Browser SDK sends valid telemetry.
-   Backend SDK authenticates successfully.
-   API accepts and stores events.
-   Event processing generates features.
-   ML service returns a valid prediction.
-   Decision API returns the expected action.
-   Backend middleware enforces the action.
-   Dashboard retrieves tenant-scoped analytics.

## 16.3 Security tests

-   Invalid public/secret keys.
-   Revoked credentials.
-   Cross-tenant data access.
-   Oversized payloads.
-   Malformed events.
-   Rate-limit bypass attempts.
-   Replayed events.
-   Unauthorized dashboard access.
-   Secret leakage in logs or frontend bundle.

## 16.4 ML tests

-   Holdout test evaluation.
-   Confusion matrix.
-   False-positive analysis.
-   Class imbalance analysis.
-   Inference latency.
-   Feature schema mismatch.
-   Performance on unseen sessions/sources.

## 16.5 End-to-end demo scenarios

Create a separate local demo website and test:

1.  Normal human browsing.
2.  Legitimate crawler-like traffic.
3.  Rapid automated page navigation.
4.  Repeated requests to one endpoint.
5.  Repeated failed login attempts using dummy accounts.
6.  API enumeration against local test routes.
7.  A traffic burst against the local test app.
8.  Sentinel API unavailable while customer middleware is running.
9.  Monitor-only mode.
10. Enforcement mode.

Only run automated attack simulations against your own local test
application or systems where you have explicit authorization.

------------------------------------------------------------------------

# 17. Development Roadmap and Milestones

Build in phases. Each phase must end with a working, testable
deliverable.

## Phase 0 --- Repository and architecture foundation

Tasks: - Create monorepo workspaces (`client`, `api`, `packages/`, `ml-service/`). - Configure Node.js and Python environments. - Configure linting and formatting. - Set up MongoDB connection pool and collection indexes. - Add environment variable templates (`.env.example`). - Build system verification.

Deliverable: Project builds and runs locally with functional client and API.

## Phase 1 --- Accounts and website management

Tasks: - User registration and login. - Password hashing. - Dashboard
shell. - Website CRUD. - Generate public and secret SDK credentials. -
Credential rotation/revocation. - Tenant authorization.

Deliverable: User can register and manage a website.

## Phase 2 --- Frontend SDK

Tasks: - SDK initialization. - Session identifier. - Page view and
visibility events. - Coarse interaction summaries. - Sanitization and
batching. - Consent/configuration. - API communication. - Unit tests.

Deliverable: Demo website sends browser telemetry to Sentinel.

## Phase 3 --- Backend SDK

Tasks: - Express middleware. - Request metadata extraction. - Sensitive
route/body/header exclusions. - Authentication event reporting API. -
Local rate limiter. - Monitor-only mode. - Decision client with
timeout/cache. - Enforcement response handling.

Deliverable: Demo backend reports requests and can enforce a test
decision.

## Phase 4 --- Event ingestion and processing

Tasks: - Event API. - Credential validation. - Schema validation. -
Normalization. - Event persistence. - Session aggregation. - Time-window
features. - SDK heartbeat.

Deliverable: Valid SDK events are stored and converted into feature
snapshots.

## Phase 5 --- Rule engine and baseline protection

Tasks: - Rule schema. - Rule configuration API. - Request-rate rules. -
Login failure rules. - Repeated route rules. - Endpoint-specific
limits. - Rule evaluation tests.

Deliverable: Deterministic detections work before ML is introduced.

## Phase 6 --- ML bot detection

Tasks: - Select and document dataset. - Generate controlled labelled
test traffic. - Clean and preprocess data. - Build feature pipeline. -
Train baseline models. - Compare Random Forest, Logistic Regression and
XGBoost/LightGBM where feasible. - Evaluate with session/source-aware
splits. - Save model and feature schema. - Implement inference API. -
Record model version and prediction.

Deliverable: Real model predicts on feature records and has a documented
evaluation report.

## Phase 7 --- Anomaly and security modules

Tasks: - Isolation Forest or statistical anomaly detector. - Application
traffic burst detection. - API abuse rules. - Authentication abuse
rules. - Local threat indicator database. - Detection reason codes.

Deliverable: Multiple detection engines produce structured signals.

## Phase 8 --- Risk and enforcement

Tasks: - Combine rule and ML results. - Implement transparent risk
scoring. - Define policy thresholds. - Implement
allow/monitor/rate-limit/challenge/block. - Add decision expiry and
caching. - Implement fail-open/fail-closed. - Add audit events. - Test
middleware enforcement.

Deliverable: End-to-end request can be monitored and safely enforced by
customer backend.

## Phase 9 --- Dashboard analytics

Tasks: - Overview cards. - Traffic charts. - Bot classification
charts. - Security event table. - Attack details. - Rules/settings
pages. - Alerts. - SDK integration status. - Real-time updates.

Deliverable: Customer can see and manage security activity.

## Phase 10 --- Hardening and final demonstration

Tasks: - End-to-end tests. - Tenant isolation tests. - SDK failure
tests. - Performance measurements. - UI polish. - Documentation. - Demo
scenarios. - Architecture diagram. - ML evaluation report. - Project
report and presentation.

Deliverable: Reproducible, demonstrable college major project.

------------------------------------------------------------------------

# 18. Definition of Done / Acceptance Criteria

The project is not complete merely because the dashboard looks finished.
The following must work:

## Platform

-   [ ] User can register and sign in.
-   [ ] User can create and manage a website.
-   [ ] Credentials are generated, scoped and revocable.
-   [ ] Tenant isolation is tested.

## Frontend SDK

-   [ ] SDK can be installed in a separate demo website.
-   [ ] It sends sanitized telemetry.
-   [ ] It batches events.
-   [ ] It does not collect form contents or keystrokes.
-   [ ] It does not break the website if Sentinel is unavailable.

## Backend SDK

-   [ ] Express middleware can be installed in a separate demo backend.
-   [ ] It reports request metadata.
-   [ ] It supports monitor-only mode.
-   [ ] It can apply rate limits and enforce a decision.
-   [ ] It has timeout and fallback behaviour.
-   [ ] It never exposes the server secret to the browser.

## Detection

-   [ ] Rule engine detects configured patterns.
-   [ ] ML model is trained on documented labelled data.
-   [ ] Evaluation includes precision, recall, F1 and confusion matrix.
-   [ ] Anomaly detection produces explainable outputs.
-   [ ] Good bots are not automatically treated as malicious.

## Enforcement

-   [ ] Allow works.
-   [ ] Monitor works.
-   [ ] Rate limit works.
-   [ ] Challenge response contract works.
-   [ ] Block works.
-   [ ] Every action is logged.
-   [ ] Enforcement can be disabled or returned to monitor-only mode.

## Dashboard

-   [ ] Shows real stored data.
-   [ ] Displays events and detections.
-   [ ] Shows action history.
-   [ ] Allows security rule configuration.
-   [ ] Shows SDK integration health.
-   [ ] Does not mix data from different websites.

## Documentation

-   [ ] Setup instructions.
-   [ ] Frontend SDK guide.
-   [ ] Backend SDK guide.
-   [ ] API documentation.
-   [ ] Database schema.
-   [ ] Architecture diagram.
-   [ ] ML training and evaluation report.
-   [ ] Known limitations.

------------------------------------------------------------------------

# 19. Instructions for the AI Development Agent

The following instructions are intended to be followed by any AI coding
agent working on this repository.

## 19.1 General working rules

1.  Read this entire planning document before making changes.
2.  Treat this document as the product and architecture specification.
3.  Do not attempt to implement the entire platform in one response or
    one code-generation step.
4.  Work milestone by milestone in the order defined in Section 17.
5.  Before each milestone, inspect the existing repository and identify
    what is already implemented.
6.  Preserve working code. Do not rewrite unrelated modules
    unnecessarily.
7.  Do not invent completed features, test results, datasets, or model
    accuracy.
8.  Use real database persistence, not in-memory mock data, for core
    functionality.
9.  Mock external integrations only when necessary and clearly label
    them.
10. Use environment variables for secrets and provide `.env.example`
    with placeholders only.
11. Keep public SDK interfaces typed and documented.
12. Add tests for each meaningful feature.
13. Run relevant tests, linting and type checks after changes.
14. Fix errors before moving to the next milestone.
15. Update documentation when APIs, schemas, configuration, or SDK
    behaviour changes.
16. Keep the system runnable using the documented local development
    process.
17. Never put secret credentials in frontend code, commits, logs,
    screenshots or demo data.
18. Never claim that a security control protects traffic that cannot
    reach the customer's application.
19. Do not use random values to simulate ML predictions.
20. Clearly label seeded demonstration data as demo data.

## 19.2 Architecture rules

-   Use a modular monolith initially.
-   Keep frontend dashboard, browser SDK, Node backend SDK, Python API,
    and ML code in separate packages/modules.
-   Use versioned APIs under `/api/v1`.
-   Define and version shared event schemas.
-   Use migrations for database changes.
-   Enforce tenant ownership on all website-scoped operations.
-   Keep the decision engine independent of individual detection
    algorithms.
-   Keep the enforcement engine independent of the dashboard.
-   Make monitor-only mode the initial default.
-   Use short remote decision timeouts and documented fallback
    behaviour.

## 19.3 Code quality rules

-   Use clear names and small, focused modules.
-   Avoid giant files and duplicated logic.
-   Add type hints in Python and strict TypeScript types.
-   Validate all external input.
-   Use structured logging with sensitive-data redaction.
-   Keep configuration centralized.
-   Avoid hard-coded credentials, URLs and thresholds.
-   Write unit and integration tests.
-   Include error handling and useful error messages.
-   Avoid unnecessary dependencies.

## 19.4 AI agent milestone workflow

For each milestone:

1.  State the milestone objective.
2.  Inspect relevant files and current implementation.
3.  List the files to create or modify.
4.  Implement the smallest complete vertical slice.
5.  Add or update tests.
6.  Run tests, linting and type checks.
7.  Summarize files changed and behaviour implemented.
8.  Report test results honestly.
9.  List known limitations and next steps.
10. Wait for the next instruction if the milestone is complete; do not
    silently jump ahead.

## 19.5 First task for the AI agent

**Start with Phase 0 only.**

Create: - The monorepo directory structure. - Python FastAPI application
skeleton. - React + TypeScript + Vite dashboard skeleton. - Browser SDK
package skeleton. - Node.js backend SDK package skeleton. - PostgreSQL
and Redis Docker Compose services. - Environment variable templates. -
Health-check endpoints. - Basic linting, formatting and test
configuration. - Root README with local setup instructions.

Do not implement ML, detection, enforcement, or dashboard analytics in
Phase 0. First ensure that the project starts reliably and all packages
have a clear structure.

After Phase 0 is complete, report the implementation and wait for
approval to proceed to Phase 1.

------------------------------------------------------------------------

# 20. Suggested Repository-Level Documentation

Maintain these documents as development progresses:

  -----------------------------------------------------------------------
  File                                Contents
  ----------------------------------- -----------------------------------
  `README.md`                         Project overview and local setup

  `docs/architecture.md`              Architecture and component
                                      interactions

  `docs/api-specification.md`         API endpoints and payloads

  `docs/event-schema.md`              Versioned event contract

  `docs/frontend-sdk.md`              Browser SDK integration

  `docs/backend-sdk.md`               Node SDK integration and middleware

  `docs/database-schema.md`           Tables, relationships and
                                      migrations

  `docs/ml-pipeline.md`               Dataset, preprocessing, training
                                      and inference

  `docs/security-model.md`            Rules, risk scoring and enforcement

  `docs/privacy.md`                   Collection, minimization, retention
                                      and deletion

  `docs/testing.md`                   Test plan and reproducible
                                      scenarios

  `docs/limitations.md`               Known limitations and future work
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 21. Final Product Summary

Sentinel is an independent, SDK-based website security platform that
works with websites hosted on external infrastructure.

Its architecture consists of:

1.  **Frontend SDK** --- collects privacy-conscious browser behaviour
    telemetry.
2.  **Backend SDK** --- monitors requests, reports trusted application
    events and enforces decisions.
3.  **Core API** --- authenticates SDKs, receives events and coordinates
    processing.
4.  **Event processing and feature engineering** --- converts telemetry
    into structured features.
5.  **Detection layer** --- combines security rules, supervised ML and
    anomaly detection.
6.  **Risk and decision engine** --- determines the appropriate
    response.
7.  **Enforcement layer** --- allows, monitors, rate-limits, challenges
    or blocks through customer-side middleware.
8.  **Dashboard** --- provides website management, analytics, alerts and
    security configuration.
9.  **Database and infrastructure** --- stores tenant-scoped
    configuration, events, detections and audit history.

**The first end-to-end milestone should be deliberately small:**
register a website, install both SDKs in a local demo application, send
a test event to Sentinel, store it, display it in the dashboard, and
enforce one test rule through backend middleware. Once this vertical
slice works, expand into ML detection and the remaining security
modules.
