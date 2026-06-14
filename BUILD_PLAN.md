# BUILD_PLAN.md

## Documentation

| File | Purpose |
|------|---------|
| [AI_CONTEXT.md](./AI_CONTEXT.md) | Single source of truth — schema, APIs, business rules |
| [prompts.md](./prompts.md) | AI prompts used during development |
| [README.md](./README.md) | Setup, run, and deployment guide |

## Project Goal

Build a simplified Splitwise clone that allows users to create groups, add expenses, split expenses equally, track balances and settle debts.

## Features

### Phase 1 — Done

* User Authentication
* User Registration
* Login

### Phase 2 — Done

* Create Group
* Add Members

### Phase 3 — Done

* Create Expense
* Equal Split Logic

### Phase 4 — Done

* Balance Calculation
* Dashboard Summary

### Phase 5 — Done

* Debt Settlement

### Phase 6 — Ready

* Deployment (Render + Vercel configs included)

## Tech Stack

Backend:

* Python
* Django
* Django REST Framework

Frontend:

* React
* TailwindCSS

Database:

* PostgreSQL (production)
* SQLite (local dev default)

Deployment:

* Render
* Vercel

## Architecture

```
React Frontend
      ↓
  REST APIs
      ↓
Django Backend
      ↓
PostgreSQL Database
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login (JWT) |
| GET | `/api/auth/profile/` | Current user |
| GET | `/api/auth/search/?q=` | Search users |
| GET/POST | `/api/groups/` | List/create groups |
| GET | `/api/groups/:id/` | Group detail |
| POST | `/api/groups/:id/members/` | Add member |
| GET/POST | `/api/expenses/group/:id/` | List/create expenses |
| GET | `/api/settlements/dashboard/` | Dashboard summary |
| GET | `/api/settlements/group/:id/balances/` | Group balances |
| GET/POST | `/api/settlements/group/:id/` | List/create settlements |

## Success Criteria

* Users can create groups.
* Users can add expenses.
* Balances update correctly.
* Users can settle debts.
* Application is deployed publicly.
