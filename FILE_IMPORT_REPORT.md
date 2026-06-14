# FILE_IMPORT_REPORT.md

Inventory of project source files and their import dependencies.

_Last updated: 2026-06-15_

---

## Purpose

This report documents:
1. All first-party source files in the project
2. External (third-party) dependencies per layer
3. Internal import relationships between modules

Excludes: `node_modules/`, `venv/`, migration auto-generated boilerplate, and build artifacts.

---

## Third-Party Dependencies

### Backend (`backend/requirements.txt`)

| Package | Version | Used For |
|---------|---------|----------|
| Django | ≥4.2, <5.0 | Web framework, ORM, admin |
| djangorestframework | ≥3.14 | REST API |
| djangorestframework-simplejwt | ≥5.3 | JWT authentication |
| django-cors-headers | ≥4.3 | CORS for React SPA |
| python-dotenv | ≥1.0 | Load `.env` variables |
| gunicorn | ≥21.2 | Production WSGI server |
| dj-database-url | ≥2.1 | Parse `DATABASE_URL` |
| whitenoise | ≥6.7.0 | Static file serving |
| psycopg2-binary | ≥2.9 | PostgreSQL driver (prod) |

### Frontend (`frontend/package.json`)

| Package | Version | Used For |
|---------|---------|----------|
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.22.0 | Client-side routing |
| axios | ^1.6.0 | HTTP client |
| vite | ^5.1.0 | Dev server & build (dev) |
| tailwindcss | ^3.4.1 | Utility CSS (dev) |
| @vitejs/plugin-react | ^4.2.0 | React JSX support (dev) |
| postcss, autoprefixer | — | CSS pipeline (dev) |

---

## Backend File Inventory

### Config (`backend/config/`)

| File | Purpose | Key Imports |
|------|---------|-------------|
| `settings.py` | Django settings, apps, JWT, DB | `os`, `pathlib`, `dj_database_url`, `dotenv` |
| `urls.py` | Root URL routing | `django.urls`, includes app URLconfs |
| `wsgi.py` | WSGI entry (gunicorn) | `django.core.wsgi` |
| `asgi.py` | ASGI entry | `django.core.asgi` |

### Users (`backend/users/`)

| File | Purpose | Key Imports |
|------|---------|-------------|
| `models.py` | Custom User model | `django.contrib.auth`, `django.db.models` |
| `serializers.py` | Register, user serializers | `rest_framework`, `get_user_model` |
| `views.py` | Register, login, profile, search | `rest_framework`, `simplejwt` |
| `urls.py` | Auth routes | `.views` |
| `admin.py` | Admin registration | `django.contrib.admin`, `.models` |
| `apps.py` | App config | `django.apps` |

### Groups (`backend/groups/`)

| File | Purpose | Key Imports |
|------|---------|-------------|
| `models.py` | Group model + M2M members | `django.conf.settings`, `django.db.models` |
| `serializers.py` | Group, add-member serializers | `rest_framework`, `users.serializers` |
| `views.py` | List/create, detail, add member | `rest_framework`, `.models`, `.serializers` |
| `urls.py` | Group routes | `.views` |
| `admin.py` | Admin registration | `.models` |
| `apps.py` | App config | `django.apps` |

### Expenses (`backend/expenses/`)

| File | Purpose | Key Imports |
|------|---------|-------------|
| `models.py` | Expense, ExpenseSplit models | `groups.models.Group`, `django.db.models` |
| `serializers.py` | Expense create + equal split logic | `decimal`, `rest_framework`, `groups.models`, `users.serializers` |
| `views.py` | List/create expenses | `rest_framework`, `groups.models`, `.models`, `.serializers` |
| `urls.py` | Expense routes | `.views` |
| `admin.py` | Admin registration | `.models` |
| `apps.py` | App config | `django.apps` |

### Settlements (`backend/settlements/`)

| File | Purpose | Key Imports |
|------|---------|-------------|
| `models.py` | Settlement model | `groups.models.Group`, `django.db.models` |
| `services.py` | Balance computation, debt simplification | `expenses.models`, `groups.models`, `.models` |
| `serializers.py` | Settlement, balance serializers | `rest_framework`, `.services`, `users.serializers` |
| `views.py` | Dashboard, balances, settlements | `rest_framework`, `.services`, `.serializers` |
| `urls.py` | Settlement routes | `.views` |
| `admin.py` | Admin registration | `.models` |
| `apps.py` | App config | `django.apps` |

### Root

| File | Purpose | Key Imports |
|------|---------|-------------|
| `manage.py` | Django CLI | `os`, `sys` |

---

## Frontend File Inventory

| File | Purpose | Key Imports |
|------|---------|-------------|
| `main.jsx` | App entry, providers | `react`, `react-dom`, `react-router-dom`, `App`, `AuthProvider`, `./index.css` |
| `App.jsx` | Routes, auth guards | `react-router-dom`, pages, `Navbar`, `AuthContext` |
| `index.css` | Tailwind directives | (CSS only) |
| `api/client.js` | Axios instance + API helpers | `axios` |
| `context/AuthContext.jsx` | Auth state & actions | `react`, `../api/client` |
| `components/Navbar.jsx` | Top navigation | `react-router-dom`, `AuthContext` |
| `components/Button.jsx` | Reusable button | (React only) |
| `components/Card.jsx` | Reusable card | (React only) |
| `components/Input.jsx` | Reusable input | (React only) |
| `pages/Login.jsx` | Login form | `react`, `react-router-dom`, components, `AuthContext` |
| `pages/Register.jsx` | Registration form | `react`, `react-router-dom`, components, `AuthContext` |
| `pages/Dashboard.jsx` | Overall balance summary | `react`, `react-router-dom`, `settlementsApi`, `Card` |
| `pages/Groups.jsx` | Group list + create | `react`, `react-router-dom`, `groupsApi`, components |
| `pages/GroupDetail.jsx` | Expenses, balances, settlements | `react`, `react-router-dom`, all API modules, components |

---

## Internal Dependency Graph

### Backend (app-level)

```
config
  └── users, groups, expenses, settlements (via urls + INSTALLED_APPS)

users
  └── (no internal app deps)

groups
  └── users.serializers (UserSerializer)

expenses
  └── groups.models (Group)
  └── users.serializers (UserSerializer)

settlements
  └── groups.models (Group)
  └── expenses.models (Expense)
  └── users.serializers (UserSerializer)
```

### Frontend (module-level)

```
main.jsx
  └── App.jsx
  └── AuthContext.jsx
        └── api/client.js
              └── axios (external)

App.jsx
  └── pages/* (Login, Register, Dashboard, Groups, GroupDetail)
  └── components/Navbar
  └── AuthContext

pages/*
  └── api/client.js (authApi, groupsApi, expensesApi, settlementsApi)
  └── components/* (Button, Card, Input)
  └── AuthContext (Login, Register, Navbar)
```

---

## API Client Exports (`frontend/src/api/client.js`)

| Export | Backend Endpoint |
|--------|------------------|
| `authApi.register` | `POST /api/auth/register/` |
| `authApi.login` | `POST /api/auth/login/` |
| `authApi.profile` | `GET /api/auth/profile/` |
| `authApi.search` | `GET /api/auth/search/?q=` |
| `groupsApi.list` | `GET /api/groups/` |
| `groupsApi.create` | `POST /api/groups/` |
| `groupsApi.detail` | `GET /api/groups/:id/` |
| `groupsApi.addMember` | `POST /api/groups/:id/members/` |
| `expensesApi.list` | `GET /api/expenses/group/:id/` |
| `expensesApi.create` | `POST /api/expenses/group/:id/` |
| `settlementsApi.dashboard` | `GET /api/settlements/dashboard/` |
| `settlementsApi.balances` | `GET /api/settlements/group/:id/balances/` |
| `settlementsApi.list` | `GET /api/settlements/group/:id/` |
| `settlementsApi.create` | `POST /api/settlements/group/:id/` |

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Setup, run, deployment |
| `BUILD_PLAN.md` | Phased build plan |
| `AI_CONTEXT.md` | Architecture source of truth |
| `SCOPE.md` | In/out of scope |
| `DECISIONS.md` | Design decisions |
| `AI_USAGE.md` | AI disclosure |
| `prompts.md` | AI prompt history |
| `FILE_IMPORT_REPORT.md` | This file |

---

## File Count Summary

| Layer | Source Files (excl. migrations) |
|-------|----------------------------------|
| Backend Python | ~35 application files |
| Frontend JSX/JS | 14 source files |
| Documentation | 8 markdown files |
| Config | `requirements.txt`, `package.json`, `render.yaml`, `vercel.json`, env examples |
