# Splitwise Clone

A simplified Splitwise-inspired expense sharing application. Users can create groups, add shared expenses, split costs equally, track balances, and settle debts.

## Features

- User registration and login (JWT authentication)
- Create groups and add members
- Add expenses with automatic equal splitting
- View per-group balances and suggested settlements
- Dashboard with overall owed/owing summary
- Record debt settlements

## Tech Stack

| Layer    | Technologies                          |
|----------|---------------------------------------|
| Backend  | Python, Django, Django REST Framework |
| Frontend | React, TailwindCSS, Vite              |
| Database | SQLite (local) / PostgreSQL (prod)    |
| Auth     | JWT (Simple JWT)                      |
| Deploy   | Render (backend), Vercel (frontend)   |

## Project Structure

```
splitwise-clone/
├── backend/
│   ├── config/          # Django settings & URLs
│   ├── users/           # Authentication
│   ├── groups/          # Group management
│   ├── expenses/        # Expenses & equal splits
│   ├── settlements/     # Balances & debt settlement
│   └── manage.py
├── frontend/
│   └── src/
│       ├── pages/       # Login, Dashboard, Groups, etc.
│       ├── components/  # Reusable UI components
│       ├── api/         # API client
│       └── context/     # Auth state
├── AI_CONTEXT.md      # Architecture & business rules (source of truth)
├── BUILD_PLAN.md      # Phased build plan
├── prompts.md         # AI prompts used during development
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Setup & Run

### 1. Backend

```bash
cd backend
python -m venv venv
```

**Activate the virtual environment:**

```bash
# MSYS2 / Git Bash (Windows)
source venv/bin/activate

# Standard Windows Python (PowerShell)
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

**Install dependencies and start the server:**

```bash
python -m pip install -r requirements.txt
copy .env.example .env          # Windows
# cp .env.example .env          # macOS/Linux
python manage.py migrate
python manage.py runserver
```

Backend runs at **http://127.0.0.1:8000**

> If `pip` is not recognized, always use `python -m pip` instead.
>
> On MSYS2 Python, the venv uses `venv/bin/` (not `venv\Scripts\`). You can run commands directly:
> ```powershell
> .\venv\bin\python.exe -m pip install -r requirements.txt
> .\venv\bin\python.exe manage.py runserver
> ```

### 2. Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
copy .env.example .env          # Windows
# cp .env.example .env          # macOS/Linux
npm run dev
```

Frontend runs at **http://localhost:5173**

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Default                          | Description                    |
|-----------------------|----------------------------------|--------------------------------|
| `SECRET_KEY`          | dev key                          | Django secret key              |
| `DEBUG`               | `True`                           | Debug mode                     |
| `USE_SQLITE`          | `True`                           | Use SQLite for local dev       |
| `CORS_ALLOWED_ORIGINS`| `http://localhost:5173`          | Allowed frontend origins       |

Set `USE_SQLITE=False` and configure `DB_*` variables to use PostgreSQL locally.

### Frontend (`frontend/.env`)

| Variable       | Default                      | Description        |
|----------------|------------------------------|--------------------|
| `VITE_API_URL` | `http://localhost:8000/api`  | Backend API base   |

## API Endpoints

| Method   | Endpoint                              | Description           |
|----------|---------------------------------------|-----------------------|
| `POST`   | `/api/auth/register/`                 | Register user         |
| `POST`   | `/api/auth/login/`                    | Login (returns JWT)   |
| `GET`    | `/api/auth/profile/`                  | Current user profile  |
| `GET`    | `/api/auth/search/?q=`                | Search users          |
| `GET/POST` | `/api/groups/`                      | List / create groups  |
| `GET`    | `/api/groups/:id/`                    | Group details         |
| `POST`   | `/api/groups/:id/members/`            | Add member            |
| `GET/POST` | `/api/expenses/group/:id/`          | List / create expenses|
| `GET`    | `/api/settlements/dashboard/`         | Dashboard summary     |
| `GET`    | `/api/settlements/group/:id/balances/`| Group balances      |
| `GET/POST` | `/api/settlements/group/:id/`       | List / record settlements |

## Deployment

**Backend (Render):** Deploy the `backend/` folder. Uses `requirements-prod.txt` (includes PostgreSQL driver). Configure `CORS_ALLOWED_ORIGINS` with your Vercel URL.

**Frontend (Vercel):** Deploy the `frontend/` folder. Set `VITE_API_URL` to your Render backend URL (e.g. `https://your-app.onrender.com/api`).

## Author

**Md Sahil**
