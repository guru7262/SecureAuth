# Sentinel — Project Progress Tracker

**Project:** Sentinel — AI-Powered Website Security Platform  
**Specification Reference:** [`Project_Planning.md`](file:///c:/Users/ASUS/Desktop/PROGRAMS/SecureAuth/Project_Planning.md)  
**Architecture:** **Option B (Hybrid Stack)** — Node.js / Express + MongoDB for Core Platform, Auth, & Telemetry Ingestion; Python FastAPI for ML / Anomaly Microservice; React 18 + Vite for Customer Dashboard.  
**Last Updated:** 2026-11-21  
**Execution Strategy:** Step-by-step sequential delivery. Build one component, verify it functions perfectly, then proceed to the next.

---

## 1. Current Project Status Overview

| Category | Status | Details |
|---|---|---|
| **Ideation & Requirements** | ✅ Completed | Comprehensive product vision, architecture limitations, and requirements established |
| **Academic Documentation** | ✅ Completed | Project reports, exhibition documentation, and seminar presentations prepared |
| **Technical Architecture** | ✅ Completed | Option B Hybrid Architecture (Node/MongoDB + Python ML Service + Browser/Node SDKs) specified in `Project_Planning.md` |
| **Code Implementation** | 🔄 In Progress | Monorepo foundation, full user authentication (JWT/bcrypt/MongoDB), and React dashboard UI shell completed. Ready for Website CRUD & SDK Key Management. |

---

## 2. Deliverables Completed Till Now

- [x] **Architecture Diagram** (`Architecture Diagram.png`)
- [x] **Project Seminar Presentations** (`Mini Project-Seminar PPT.pptx`, `RRC PPT.pptx`)
- [x] **Project Reports** (`Mini Project report.docx`, `Project Report for Exhibition.docx`)
- [x] **Master Specification Document** ([`Project_Planning.md`](file:///c:/Users/ASUS/Desktop/PROGRAMS/SecureAuth/Project_Planning.md))
  - Core product principles & client integration architecture
  - Hybrid stack specification (Node.js/Express + MongoDB + Python ML Microservice)
  - Frontend SDK (`@sentinel-security/browser`) specification
  - Backend SDK (`@sentinel-security/node`) specification
  - Event schemas & data pipeline design (MongoDB collections & indexes)
  - Machine learning roadmap (tabular multi-class + Isolation Forest anomaly detection)
  - Deterministic rule engine specification
  - 11-phase development roadmap and acceptance criteria
- [x] **Phase 0 Monorepo & Base Architecture**
  - Root `package.json` with npm workspaces (`client`, `api`)
  - Build scripts passing cleanly across workspaces (`npm run build`)
  - MongoDB database connection pool with automatic reconnect (`api/lib/mongodb.js`)
  - Standardized JSON response handler & global error wrapper (`api/lib/response.js`)
  - Environment variables configuration (`.env.example`, `.env`)
- [x] **Phase 1 (Part 1): User Authentication System**
  - Secure password hashing with `bcryptjs`
  - Stateless JWT generation and verification (`api/lib/auth.js`)
  - Secure HttpOnly, SameSite=Lax cookie management for auth sessions
  - Zod request schema validation (`api/lib/validation.js`)
  - Serverless auth endpoints:
    - `POST /api/auth/signup` — User registration with email uniqueness checks
    - `POST /api/auth/login` — Sign in and issuance of auth cookie
    - `POST /api/auth/logout` — Cookie invalidation
    - `GET /api/auth/me` — Protected session verification
    - `POST /api/auth/forgot-password` & `POST /api/auth/reset-password`
  - React client auth pages with error handling and toast notifications:
    - `client/src/pages/Login.jsx`
    - `client/src/pages/Signup.jsx`
    - `client/src/pages/ForgotPassword.jsx`
- [x] **Phase 9 (Part 1): Dashboard Visual Shell & Design System**
  - React 18 + Vite dashboard with responsive dark theme design system
  - KPI cards with live sparklines (Total Requests, Threats Blocked, Bot Traffic, System Health)
  - Real-time traffic analytics chart using Recharts (AreaChart: normal, bot, suspicious, blocked)
  - Circular Risk Gauge (0–100 scale) with threat status indicator
  - Threat detection incident table with severity badges, IP, endpoint, score, and action tags
  - Side navigation covering Monitor, Protect, Analyze, and Manage sections

---

## 3. Step-by-Step Implementation Roadmap

### ✅ Phase 0: Repository & Architecture Foundation
- [x] Monorepo structure setup (`client/`, `api/`, `packages/`, `ml-service/`)
- [x] Base serverless Node.js API setup with Express routing helpers (`api/`)
- [x] React + Vite dashboard skeleton with custom CSS design system (`client/`)
- [x] MongoDB connection pooling with environment configurations (`.env.example`)
- [x] Build scripts verified cleanly (`npm run build`)

---

### 🔄 Phase 1: Accounts and Website Management (Current Focus)
- [x] User registration, login, JWT token auth, and password hashing (`bcryptjs`)
- [x] Protected session verification (`/api/auth/me`) and password reset endpoints
- [x] Dashboard authentication pages (Login, Signup, ForgotPassword)
- [ ] Website registration CRUD (`/api/websites`: domain, environment, category)
- [ ] Public site key (`sentinel_pub_...`) and secret server key (`sentinel_sec_...`) generation & SHA-256 hashing
- [ ] Key rotation and revocation endpoints
- [ ] Tenant ownership authorization middleware (`requireWebsiteOwner`)
- [ ] Dashboard website management & onboarding UI (site switcher, key display wizard)
- [ ] Verification: User can register a website, generate scoped keys, and view integration snippets

---

### ⏸️ Phase 2: Frontend SDK (`@sentinel-security/browser`)
- [ ] Client SDK package setup (`packages/browser-sdk/`)
- [ ] SDK initialization with public key and site ID
- [ ] Session tracking & pseudonymous visitor ID generation
- [ ] Lightweight event collection (page views, visibility, coarse clicks, scroll depth)
- [ ] URL parameter and sensitive form field sanitization
- [ ] Event batching and transport (`navigator.sendBeacon` with `fetch` fallback)
- [ ] Fail-safe error handling (never block host site execution)
- [ ] Verification: Demo web page sends valid telemetry batches to Sentinel collector

---

### ⏸️ Phase 3: Backend SDK (`@sentinel-security/node`)
- [ ] Express middleware package setup (`packages/node-sdk/`)
- [ ] Request metadata extractor (method, path, status, timing, IP, user-agent)
- [ ] Sensitive route and header exclusion filters
- [ ] Authentication event reporting API (`login_attempt`, `login_success`, `login_failure`)
- [ ] In-memory emergency rate limiter (circuit breaker)
- [ ] Decision query client with timeout and cache
- [ ] Configurable fail modes (`failMode: "open"` / `"closed"`)
- [ ] Verification: Demo Express server intercepts requests, reports metrics, and applies test decisions

---

### ⏸️ Phase 4: Event Ingestion & Processing Pipeline
- [ ] Central API SDK event ingestion endpoint (`/api/v1/sdk/events` in `api/events/`)
- [ ] Public/secret credential validation and tenant scoping
- [ ] Strict schema validation via Zod
- [ ] Event normalization and MongoDB persistence with TTL index support
- [ ] Sliding time-window feature computation (10s, 1m, 5m request aggregates)
- [ ] SDK heartbeat tracking endpoint (`/api/v1/sdk/heartbeat`)
- [ ] Verification: SDK events create normalized records and accurate feature snapshots

---

### ⏸️ Phase 5: Deterministic Rule Engine
- [ ] Rule storage collection schema and configuration API (`api/rules/`)
- [ ] Threshold rate-limit rules (e.g., max requests per window per IP)
- [ ] Brute-force failure rules (e.g., 5 failed logins within 60s)
- [ ] Repeated route and endpoint abuse rules
- [ ] Unit tests for safe deterministic rule evaluation
- [ ] Verification: Triggering test thresholds returns predictable decision actions without ML

---

### ⏸️ Phase 6: Machine Learning Bot Detection (`ml-service/`)
- [ ] Python microservice setup (`ml-service/` with FastAPI)
- [ ] Dataset curation & controlled labelled traffic generation (human, scraper, brute-force, automation)
- [ ] Train/validation/test split by session (leakage prevention)
- [ ] Baseline models: Logistic Regression & Random Forest
- [ ] Advanced tabular classifier: XGBoost / LightGBM
- [ ] Evaluation report (Precision, Recall, F1, ROC-AUC, Confusion Matrix)
- [ ] Inference endpoint (`POST /predict`) packaging with reason codes
- [ ] Verification: Real ML model produces calibrated probability scores and feature reason codes

---

### ⏸️ Phase 7: Anomaly Detection & Advanced Security Modules
- [ ] Unsupervised anomaly model (Isolation Forest in `ml-service/`)
- [ ] Application-layer burst detection
- [ ] API security patterns (unusual methods, schema violations, endpoint scanning)
- [ ] Threat intelligence indicators collection (reputation & temporary bans)
- [ ] Inference endpoint (`POST /anomaly`) returning structured anomaly scores
- [ ] Verification: Unseen traffic patterns trigger anomaly warnings with interpretable reasons

---

### ⏸️ Phase 8: Risk Scoring & Decision Engine
- [ ] Multi-signal risk aggregation in Node.js (Rules + ML + Anomaly + Threat Intel)
- [ ] Transparent scoring scale (0-100) mapped to actions: Allow, Monitor, Rate Limit, Challenge, Block
- [ ] Decision response endpoint (`POST /api/v1/sdk/decisions`) with TTL cache
- [ ] Customer feedback ingestion endpoint (`POST /api/v1/sdk/decision-feedback`)
- [ ] Verification: End-to-end enforcement tested against demo app with all 5 action types

---

### ⏸️ Phase 9: Dashboard Analytics & Management UI (Live Data Integration)
- [ ] Wire existing React dashboard components to real MongoDB API endpoints:
  - Overview metrics (Total Traffic, Threats Blocked, Bot Traffic, System Health)
  - Live Recharts traffic series from aggregated time windows
  - Real-time threat detection feed and event inspection drawer
- [ ] Security rules management view (CRUD for site rules)
- [ ] SDK integration setup wizard with copyable code snippets
- [ ] Verification: Dashboard displays real database records with strict tenant isolation

---

### ⏸️ Phase 10: Hardening, End-to-End Demo & Final Documentation
- [ ] Full end-to-end integration tests (Vitest + Pytest)
- [ ] Tenant boundary and security bypass penetration tests
- [ ] Standalone runnable demo application instrumented with both SDKs
- [ ] Demo attack scenarios (scraping, brute force, burst)
- [ ] Final technical documentation (Architecture, API specs, ML evaluation report)
- [ ] Verification: Complete hybrid system runs seamlessly for project defense/exhibition

---

## 4. Next Step to Execute

👉 **Phase 1 (Part 2): Website Registration CRUD & SDK Credential Management**  
Build the website registration endpoints in `api/websites/`, implement public/secret API key generation (`sentinel_pub_...` and `sentinel_sec_...`) with SHA-256 hashing, and connect the website onboarding view to the React dashboard.
