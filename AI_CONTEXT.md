# AI_CONTEXT.md

_Single source of truth for the Splitwise Clone project. Last updated: 2026-06-12._

---

## Product Understanding

A simplified Splitwise-inspired web app for sharing expenses within groups. Users register, create groups, add members, record who paid for what, split costs equally, view balances, and record settlements.

Inspired by Splitwise's group expense workflow, but intentionally scoped down for an internship/portfolio assignment.

## Product Scope

### In scope (implemented)

- Email/username registration and JWT login
- Create groups and add existing users as members
- Add expenses with a single payer and equal split among selected members
- Per-group balance calculation with debt simplification suggestions
- Dashboard showing total owed / owing across all groups
- Record settlements between group members
- Deploy to Render (backend) and Vercel (frontend)

### Out of scope (not implemented)

- Unequal, percentage, or shares-based splits
- Edit/delete groups, expenses, or settlements
- Email invitations or pending members
- Real-time expense chat (WebSockets)
- Notifications
- Multi-currency
- Friend-level (non-group) expenses
- OAuth / forgot password
- Automated tests

## Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1 | User can register with username, email, password | Done |
| FR-2 | User can login and receive JWT access + refresh tokens | Done |
| FR-3 | User can view own profile | Done |
| FR-4 | User can search other users by username | Done |
| FR-5 | User can create a group (becomes member automatically) | Done |
| FR-6 | User can add existing users to a group they belong to | Done |
| FR-7 | User can add an expense with description, amount, payer | Done |
| FR-8 | Expense splits equally among all members (or subset) | Done |
| FR-9 | User can view group balances and suggested settlements | Done |
| FR-10 | User can view dashboard summary across groups | Done |
| FR-11 | User can record a settlement payment | Done |

## Non Functional Requirements

- **Auth:** JWT via `djangorestframework-simplejwt`; tokens stored in `localStorage` on frontend
- **API:** REST JSON over HTTP; all protected routes require `Authorization: Bearer <token>`
- **Database:** SQLite for local dev (`USE_SQLITE=True`); PostgreSQL for production (Render)
- **CORS:** Configured for Vite dev server and production frontend URL
- **Responsive:** TailwindCSS utility classes; mobile-friendly layout

## User Personas

**Primary:** Roommates or friend groups (2–10 people) splitting shared costs like rent, groceries, or trips.

**Secondary:** Anyone needing a simple demo of expense sharing without Splitwise's full feature set.

## User Stories

1. As a new user, I register and log in so I can track shared expenses.
2. As a group member, I create a group and add my roommates.
3. As a payer, I add an expense and the app splits it equally among members.
4. As a member, I see who owes whom in my group.
5. As a debtor, I record a payment to settle part of what I owe.
6. As a user, I open my dashboard to see my overall financial position.

## Workflows

### Registration & login

1. User visits `/register`, submits username, email, password.
2. Backend creates user; user redirected to login.
3. User logs in at `/login`; receives `access` and `refresh` JWT tokens.
4. Tokens stored in `localStorage`; Axios interceptor attaches access token to API calls.

### Create group & add members

1. User navigates to `/groups`, creates group with name + optional description.
2. Creator is automatically added as a member.
3. User searches for another user by username and adds them to the group.

### Add expense

1. On group detail page, user submits description, amount, payer, and optional member subset.
2. Backend validates payer and split members are in the group.
3. Equal split computed; rounding remainder assigned to first member in split list.
4. `Expense` and `ExpenseSplit` rows created.

### View balances & settle

1. Group detail shows balances and simplified debt suggestions.
2. User records settlement: from_user, to_user, amount, optional note.
3. Settlement adjusts net balances on next calculation.

## Business Rules

1. Only group members can view or add expenses in that group.
2. Payer must be a group member.
3. Split participants must all be group members.
4. Default split: all group members if `split_among_ids` omitted.
5. Equal split: `share = amount / count`, rounded half-up to 2 decimals; remainder added to first split member.
6. Balance sign convention: **positive** = user is owed money; **negative** = user owes money.
7. Balance formula per user in group:
   - `+amount` for each expense they paid
   - `-split.amount` for each split they owe
   - `+settlement.amount` when they are `from_user` (they paid someone)
   - `-settlement.amount` when they are `to_user` (they received payment)
8. Debt simplification uses greedy min-transaction algorithm (not stored in DB).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.10+, Django 4.2, Django REST Framework |
| Auth | djangorestframework-simplejwt (JWT) |
| Frontend | React 18, Vite, TailwindCSS 3 |
| Routing | React Router v6 |
| HTTP client | Axios |
| Database (local) | SQLite |
| Database (prod) | PostgreSQL via `DATABASE_URL` |
| Backend deploy | Render (gunicorn) |
| Frontend deploy | Vercel |

## Architecture

```
React SPA (Vercel)
       │
       │  REST / JSON
       ▼
Django REST API (Render)
       │
       ▼
SQLite (local) / PostgreSQL (prod)
```

**Backend apps:**

- `users` — authentication, profile, user search
- `groups` — group CRUD (create/list/detail), add members
- `expenses` — expense list/create with equal split
- `settlements` — balances, dashboard, settlement list/create

## Database Schema

### users_user (custom User model)

| Column | Type | Notes |
|--------|------|-------|
| id | BigInt PK | Django default |
| username | VARCHAR | unique |
| email | VARCHAR | unique |
| password | VARCHAR | hashed |
| first_name, last_name | VARCHAR | optional |

### groups_group

| Column | Type | Notes |
|--------|------|-------|
| id | BigInt PK | |
| name | VARCHAR(100) | |
| description | TEXT | optional |
| created_by_id | FK → users | CASCADE |
| created_at | DateTime | auto |

### groups_group_members (M2M)

| Column | Type |
|--------|------|
| group_id | FK → groups |
| user_id | FK → users |

### expenses_expense

| Column | Type | Notes |
|--------|------|-------|
| id | BigInt PK | |
| group_id | FK → groups | CASCADE |
| paid_by_id | FK → users | CASCADE |
| description | VARCHAR(255) | |
| amount | Decimal(10,2) | |
| created_at | DateTime | auto |

### expenses_expensesplit

| Column | Type | Notes |
|--------|------|-------|
| id | BigInt PK | |
| expense_id | FK → expenses | CASCADE |
| user_id | FK → users | CASCADE |
| amount | Decimal(10,2) | unique (expense, user) |

### settlements_settlement

| Column | Type | Notes |
|--------|------|-------|
| id | BigInt PK | |
| group_id | FK → groups | CASCADE |
| from_user_id | FK → users | payer |
| to_user_id | FK → users | payee |
| amount | Decimal(10,2) | |
| note | VARCHAR(255) | optional |
| created_at | DateTime | auto |

## API Design

Base URL: `/api`

### Auth (`/api/auth/`)

| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| POST | `register/` | No | username, email, password, password_confirm | 201 + user |
| POST | `login/` | No | username, password | access + refresh JWT |
| GET | `profile/` | Yes | — | current user |
| GET | `search/?q=` | Yes | q (username substring) | user list (max 10) |

### Groups (`/api/groups/`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/` | Yes | — | user's groups |
| POST | `/` | Yes | name, description | created group |
| GET | `/:id/` | Yes | — | group detail |
| POST | `/:id/members/` | Yes | user_id | updated group |

### Expenses (`/api/expenses/`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `group/:group_id/` | Yes | — | expense list |
| POST | `group/:group_id/` | Yes | description, amount, paid_by_id, split_among_ids? | created expense + splits |

### Settlements (`/api/settlements/`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `dashboard/` | Yes | — | totals + per-group summary |
| GET | `group/:group_id/balances/` | Yes | — | balances + suggested debts |
| GET | `group/:group_id/` | Yes | — | settlement history |
| POST | `group/:group_id/` | Yes | from_user_id, to_user_id, amount, note? | created settlement |

## Frontend Structure

```
frontend/src/
├── App.jsx              # Routes, PrivateRoute, PublicRoute
├── main.jsx
├── index.css            # Tailwind imports
├── api/client.js        # Axios instance + API helpers
├── context/AuthContext.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   └── Input.jsx
└── pages/
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    ├── Groups.jsx
    └── GroupDetail.jsx  # expenses, balances, settlements
```

**Routes:**

| Path | Page | Auth |
|------|------|------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | Private |
| `/groups` | Groups list + create | Private |
| `/groups/:id` | Group detail | Private |

## Backend Structure

```
backend/
├── config/          # settings, urls, wsgi
├── users/           # auth app
├── groups/          # group app
├── expenses/        # expense + equal split
├── settlements/     # balances, dashboard, settlements
│   └── services.py  # balance engine
├── manage.py
├── requirements.txt
├── requirements-prod.txt
└── render.yaml
```

## Authentication Design

- **Registration:** `RegisterSerializer` validates password match, calls `create_user`.
- **Login:** `TokenObtainPairView` returns JWT pair.
- **Protected routes:** DRF `IsAuthenticated` default; JWT in `Authorization` header.
- **Frontend:** `AuthContext` loads profile on mount; 401 interceptor clears tokens and redirects to login.
- **Token lifetime:** Access 24h, refresh 7 days.

## Expense Engine

Implemented in `expenses/serializers.py` → `ExpenseSerializer.create()`:

1. Validate group membership and payer.
2. Determine `split_among_ids` (explicit list or all members).
3. `share = (amount / count).quantize(0.01, ROUND_HALF_UP)`
4. `remainder = amount - share * count`
5. First member gets `share + remainder`; others get `share`.
6. Bulk create `ExpenseSplit` rows.

## Balance Calculation Logic

Implemented in `settlements/services.py`:

**`compute_group_balances(group)`**

```python
for expense in group.expenses:
    balances[paid_by] += expense.amount
    for split in expense.splits:
        balances[split.user] -= split.amount
for settlement in group.settlements:
    balances[from_user] += settlement.amount
    balances[to_user] -= settlement.amount
```

**`simplify_debts(balances)`** — greedy algorithm pairing largest debtors with largest creditors.

**`get_user_dashboard(user)`** — aggregates across all groups the user belongs to.

## Settlement Logic

- Manual recording only (no auto-settle).
- User specifies `from_user`, `to_user`, `amount`.
- Both users must be group members.
- Partial payments allowed (any positive amount).
- No validation that settlement amount ≤ outstanding debt (MVP simplification).

## Chat System

Not implemented. Out of scope for this MVP.

## Deployment Plan

### Backend (Render)

- Deploy `backend/` directory
- Build: `pip install -r requirements-prod.txt`
- Start: `gunicorn config.wsgi:application`
- Env: `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `ALLOWED_HOSTS`
- `render.yaml` included for Blueprint deploy

### Frontend (Vercel)

- Deploy `frontend/` directory
- Build: `npm run build`
- Env: `VITE_API_URL=https://<render-app>.onrender.com/api`
- `vercel.json` included for SPA routing

## Testing Plan

Manual testing only for MVP:

1. Register two users, login as each
2. Create group, add second user
3. Add expense, verify equal splits
4. Check balances match expected math
5. Record settlement, verify balances update
6. Check dashboard totals

## Tradeoffs

| Decision | Rationale |
|----------|-----------|
| Equal split only | Faster MVP; covers most roommate use cases |
| No edit/delete | Reduces complexity; balances always derived from current data |
| SQLite locally | Zero-config dev setup |
| JWT in localStorage | Simple SPA auth; HttpOnly cookies deferred |
| Computed balances | Always correct; no sync issues with cached balances |
| Greedy debt simplification | Good enough for small groups; not mathematically optimal for all cases |
| Django over Node | Faster CRUD scaffolding; team familiarity |

## Known Limitations

1. No expense or group edit/delete
2. Only equal splits (rounding edge cases on indivisible amounts)
3. No invitation flow — must search and add registered users
4. No logout API call (client-side token removal only)
5. No refresh token rotation on frontend
6. No automated test suite
7. No real-time updates (page refresh required)

## Change Log

| Date | Change |
|------|--------|
| 2026-06-12 | Initial project scaffolded (Django + React) |
| 2026-06-12 | Phases 1–5 implemented (auth, groups, expenses, balances, settlements) |
| 2026-06-12 | Deployment configs added (Render + Vercel) |
| 2026-06-12 | README enhanced with setup instructions |
| 2026-06-12 | AI_CONTEXT.md and prompts.md created |

## Prompts Used

See [prompts.md](./prompts.md) for the full chronological record of AI prompts used during development.

## AI Responses Summary

- **Scaffold prompt:** Generated full Django backend (4 apps), React frontend (5 pages), equal-split logic, balance engine, and deployment configs from BUILD_PLAN.
- **README prompt:** Expanded setup docs with venv activation notes for Windows/MSYS2, env variable tables, and API endpoint reference.
- **Documentation prompt:** Created AI_CONTEXT.md and prompts.md to complete project documentation set.
