# DECISIONS.md

Architecture and design decisions for the Splitwise Clone project.

_Last updated: 2026-06-15_

---

## How to Read This Document

Each decision records **what** was chosen, **why**, and **what was rejected**. Use this when extending the project so new work stays consistent with existing conventions.

---

## 1. Tech Stack

### Decision: Django + DRF for backend, React + Vite for frontend

**Rationale:**
- Django provides fast CRUD scaffolding, ORM, migrations, and admin out of the box.
- DRF adds structured serializers, permissions, and JWT integration.
- React SPA fits a dashboard-style UI with client-side routing.
- Vite offers fast local dev and simple production builds.

**Alternatives considered:**
- **Node/Express backend** — More manual setup for auth, validation, and ORM.
- **Next.js full-stack** — Heavier framework; separate Django API keeps backend logic clear for portfolio review.

---

## 2. Authentication

### Decision: JWT via `djangorestframework-simplejwt`, tokens in `localStorage`

**Rationale:**
- Stateless auth works well with a decoupled React SPA.
- Simple JWT flow: login → store access token → Axios interceptor attaches `Authorization` header.
- Access token lifetime: 24h; refresh token: 7 days.

**Alternatives considered:**
- **Session cookies (HttpOnly)** — More secure against XSS but adds CSRF complexity for SPA.
- **OAuth (Google/GitHub)** — Out of scope for MVP.

**Known tradeoff:** Tokens in `localStorage` are vulnerable to XSS. Acceptable for MVP; HttpOnly cookies preferred for production hardening.

---

## 3. Database

### Decision: SQLite locally, PostgreSQL in production

**Rationale:**
- SQLite requires zero configuration for local development (`USE_SQLITE=True`).
- PostgreSQL on Render via `DATABASE_URL` and `dj-database-url`.
- Same Django ORM code works in both environments.

**Alternatives considered:**
- **PostgreSQL everywhere** — Adds local setup friction for reviewers.
- **MongoDB** — Relational data (users, groups, splits) fits SQL better.

---

## 4. Expense Splitting

### Decision: Equal split only, with rounding remainder on first member

**Rationale:**
- Covers the most common roommate use case.
- Simple algorithm: `share = amount / count`, rounded half-up; remainder assigned to first split member.
- Implemented in `ExpenseSerializer.create()`.

**Alternatives considered:**
- **Percentage/shares/exact amounts** — Splitwise parity but significantly more UI and validation.
- **Store balances directly** — Risk of sync bugs; balances are computed instead.

---

## 5. Balance Calculation

### Decision: Compute balances on read, not stored in DB

**Rationale:**
- Balances always reflect current expenses and settlements.
- No cache invalidation or drift between stored and computed values.
- Logic centralized in `settlements/services.py`.

**Formula (per user in group):**
- `+expense.amount` when user is payer
- `-split.amount` for each split owed
- `+settlement.amount` when user is `from_user` (payer)
- `-settlement.amount` when user is `to_user` (payee)

**Sign convention:** Positive = owed money; negative = owes money.

---

## 6. Debt Simplification

### Decision: Greedy min-transaction algorithm (not persisted)

**Rationale:**
- Good enough for small groups (2–10 people).
- Suggestions only — users still record settlements manually.
- No extra DB tables for suggested debts.

**Alternatives considered:**
- **Optimal graph algorithm** — Overkill for MVP group sizes.
- **Store simplified debts in DB** — Adds complexity; suggestions can be recomputed.

---

## 7. Settlements

### Decision: Manual settlement recording, partial payments allowed

**Rationale:**
- Users explicitly record when money changes hands.
- No auto-settle or payment gateway integration.
- No validation that settlement amount ≤ outstanding debt (MVP simplification).

**Alternatives considered:**
- **Stripe/PayPal integration** — Out of scope.
- **Strict debt cap validation** — Deferred; users can over-settle in MVP.

---

## 8. API Design

### Decision: REST JSON, resource-oriented URLs, DRF generics

**Rationale:**
- Predictable endpoints: `/api/groups/`, `/api/expenses/group/:id/`, `/api/settlements/group/:id/balances/`.
- DRF `generics.ListCreateAPIView` and custom `APIView` where needed.
- All protected routes require `IsAuthenticated`.

**Alternatives considered:**
- **GraphQL** — More flexible queries but heavier setup for this CRUD app.
- **RPC-style endpoints** — Less conventional for portfolio demos.

---

## 9. Frontend Architecture

### Decision: React Context for auth, Axios client module, page-based routing

**Rationale:**
- `AuthContext` holds user state and login/logout/register helpers.
- `api/client.js` centralizes Axios instance, interceptors, and API helpers.
- React Router v6 with `PrivateRoute` / `PublicRoute` guards.

**Alternatives considered:**
- **Redux/Zustand** — Overkill for auth + page-level state.
- **React Query** — Useful later; not needed for MVP fetch patterns.

---

## 10. Deployment

### Decision: Render (backend) + Vercel (frontend)

**Rationale:**
- Free tiers suitable for portfolio hosting.
- `render.yaml` and `vercel.json` included for one-click deploy.
- Gunicorn + WhiteNoise for Django static files on Render.

**Alternatives considered:**
- **Single monolith deploy** — SPA + API separation matches modern full-stack patterns.
- **Docker Compose** — More setup for reviewers; env-based deploy is simpler.

---

## 11. Testing

### Decision: Manual testing only for MVP

**Rationale:**
- Faster delivery for internship/portfolio deadline.
- Core logic (equal split, balances) verified manually.

**Planned follow-up:** pytest for backend services; component tests for critical UI flows.

---

## 12. Documentation

### Decision: Multiple focused docs instead of one README

**Rationale:**
- `README.md` — Setup and run
- `AI_CONTEXT.md` — Architecture source of truth
- `SCOPE.md` — What's in/out of scope
- `DECISIONS.md` — This file
- `AI_USAGE.md` — AI disclosure
- `FILE_IMPORT_REPORT.md` — File and dependency inventory
- `prompts.md` — Chronological AI prompt log

---

## Decision Log

| Date | Decision | Notes |
|------|----------|-------|
| 2026-06-12 | Greenfield scaffold with Django + React | Phases 1–5 in single pass |
| 2026-06-12 | Equal split only | Documented in AI_CONTEXT tradeoffs |
| 2026-06-12 | Computed balances | No balance column on User or Group |
| 2026-06-12 | Render + Vercel deploy | Config files committed |
| 2026-06-15 | Added SCOPE, DECISIONS, AI_USAGE, FILE_IMPORT_REPORT | Project documentation set completed |
