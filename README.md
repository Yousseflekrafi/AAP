# AAP — AI Administration Platform

A SaaS platform that lets teams add an intelligent, natural-language administration layer to their applications instead of hand-building admin pages, filters and dashboards for every need.

This repo is Phase 1: the security-first backend and frontend foundations (auth, RBAC, audit, i18n, reusable UI) that later phases (AI query engine, RAG, connectors, MCP) build on.

## Stack

| Service | Tech | Runs on |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind, Redux Toolkit, i18n, ECharts | http://localhost:5173 |
| Backend | Django, Django REST Framework, SimpleJWT | http://localhost:8000 |
| DB | PostgreSQL (SQLite fallback for local dev) | localhost:5432 |
| Redis | Cache, rate limiting, OTP codes, password-reset tokens | localhost:6379 |

No Docker, no reverse proxy — each service runs directly on your machine. Details, folder structure and API routes are in each app's own README: [`backend/README.md`](backend/README.md), [`frontend/README.md`](frontend/README.md).

## Running it

You need Python 3.11+, Node 20+, and Redis installed locally. PostgreSQL is optional for local dev (the backend falls back to SQLite if `DATABASE_URL` isn't set).

**1. Redis** — start it first, the backend needs it up before it will serve requests:
```bash
redis-server
```

**2. Backend** (in `backend/`), served at **http://localhost:8000**:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env           # edit if you want Postgres instead of SQLite
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
- API: http://localhost:8000/api
- Django admin: http://localhost:8000/admin

**3. Frontend** (in `frontend/`), served at **http://localhost:5173**:
```bash
cd frontend
npm install
cp .env.example .env           # VITE_API_URL defaults to http://localhost:8000/api
npm run dev
```
- App: http://localhost:5173
- Login page: http://localhost:5173/login

**4. PostgreSQL** (optional — only if you don't want the SQLite fallback): create a database and user, then set `DATABASE_URL` in `backend/.env`, e.g.
```
DATABASE_URL=postgres://aap:aap@localhost:5432/aap
```

Since backend and frontend run on different ports, the backend's `CORS_ALLOWED_ORIGINS` (in `backend/.env`) must include the frontend's origin — the default (`http://localhost:5173`) already matches the setup above.

## Creating users

```bash
# admin (superuser) — works with the Django admin and every admin-only API endpoint
python manage.py createsuperuser

# a pre-verified regular/customer user, from a Django shell
python manage.py shell
>>> from apps.accounts.models import User
>>> u = User.objects.create_user(email="customer@example.com", password="CustomerPass123!")
>>> u.is_email_verified = True
>>> u.save()
```
Regular signups go through http://localhost:5173/register and a 6-digit email verification code — with the default console email backend, that code shows up in the backend's terminal output instead of an inbox.
