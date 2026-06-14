# SCOPE.md

Project scope for the Splitwise Clone — a simplified expense-sharing web application.

_Last updated: 2026-06-15_

---

## Project Goal

Build a portfolio-ready MVP that lets small groups (roommates, friends) track shared expenses, see who owes whom, and record settlements — inspired by Splitwise, but intentionally limited in scope.

## Target Users

- **Primary:** Roommates or friend groups (2–10 people) splitting rent, groceries, trips, or household costs.
- **Secondary:** Reviewers evaluating a full-stack CRUD + auth + business-logic demo.

## In Scope (Implemented)

| Area | Features |
|------|----------|
| **Authentication** | Register, login, JWT access/refresh tokens, profile, user search |
| **Groups** | Create groups, view list/detail, add existing users as members |
| **Expenses** | Add expenses with description, amount, payer; equal split among all or selected members |
| **Balances** | Per-group balance calculation, debt simplification suggestions |
| **Dashboard** | Overall owed/owing summary across all groups |
| **Settlements** | Record manual payments between group members |
| **Deployment** | Backend on Render, frontend on Vercel |

## Out of Scope (Explicitly Excluded)

| Area | Reason |
|------|--------|
| Unequal, percentage, or shares-based splits | MVP focuses on equal split only |
| Edit/delete groups, expenses, or settlements | Reduces complexity; balances derived from current data |
| Email invitations or pending members | Requires email infra; users must already be registered |
| Real-time chat (WebSockets) | Not core to expense tracking |
| Push/email notifications | Out of MVP scope |
| Multi-currency | Single currency assumed |
| Friend-level (non-group) expenses | Group-centric model only |
| OAuth / forgot password | Standard username/password auth only |
| Automated test suite | Manual testing for MVP |
| Mobile native apps | Web SPA only |

## Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| FR-1 | User can register with username, email, password | Done |
| FR-2 | User can login and receive JWT tokens | Done |
| FR-3 | User can view own profile | Done |
| FR-4 | User can search other users by username | Done |
| FR-5 | User can create a group (auto-added as member) | Done |
| FR-6 | User can add existing users to a group | Done |
| FR-7 | User can add an expense with description, amount, payer | Done |
| FR-8 | Expense splits equally among members (or subset) | Done |
| FR-9 | User can view group balances and suggested settlements | Done |
| FR-10 | User can view dashboard summary across groups | Done |
| FR-11 | User can record a settlement payment | Done |

## Non-Functional Requirements

- **Security:** JWT on all protected API routes; passwords hashed by Django
- **API:** REST JSON over HTTP
- **Database:** SQLite locally; PostgreSQL in production
- **UI:** Responsive layout via TailwindCSS
- **CORS:** Configured for local Vite dev server and production frontend URL

## Success Criteria

1. Two users can register, create a group, and add each other.
2. Expenses split equally with correct rounding.
3. Balances reflect expenses and settlements accurately.
4. Dashboard shows correct totals across groups.
5. Application is deployable to Render + Vercel.

## Future Enhancements (Post-MVP)

These are **not** part of current scope but are natural next steps:

- Unequal split types (exact amounts, percentages, shares)
- Edit/delete for expenses and groups
- Refresh token rotation on frontend
- Automated tests (pytest + React Testing Library)
- Email invitations for non-registered users

## Related Documentation

- [AI_CONTEXT.md](./AI_CONTEXT.md) — Full architecture, schema, and business rules
- [DECISIONS.md](./DECISIONS.md) — Why key technical choices were made
- [BUILD_PLAN.md](./BUILD_PLAN.md) — Phased implementation plan
