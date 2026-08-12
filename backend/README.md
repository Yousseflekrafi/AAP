# AAP Backend

Django/DRF backend for the AI Administration Platform — Phase 1 (security foundations, before any customer-data CRUD).

## Stack

Django 5.2, Django REST Framework, SimpleJWT, PostgreSQL (SQLite fallback for local dev), Redis, Argon2 password hashing, django-cors-headers, django-filter.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit as needed
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Redis must be running locally (`redis-server`) — it backs the cache, rate limiting, OTP codes and password-reset tokens. Without `DATABASE_URL` set, the app falls back to SQLite for local development; set `DATABASE_URL` to a PostgreSQL DSN for anything beyond that.

## Structure

```
backend/
  config/settings/{base,development,production}.py
  apps/
    accounts/     # custom User, JWT auth, email verification, Google OAuth, RBAC
    audit/        # audit logs + security events, request logging middleware
    organizations/ applications/ connections/ schemas/ permissions/
    ai/ knowledge/ queries/ billing/   # placeholders for later phases
```

## Auth API (`/api/auth/`)

`register/`, `verify-email/`, `verify-email/resend/`, `login/`, `login/google/`, `refresh/`, `logout/`, `password/forgot/`, `password/reset/`, `password/change/`, `me/`, `users/` (admin), `users/<id>/` (admin).

Access tokens are returned in the response body and kept in memory on the frontend; refresh tokens live in an HttpOnly, SameSite cookie scoped to `/api/auth/` and rotate on every refresh.

## Audit API (`/api/audit/`)

`logs/`, `security-events/` — admin-only.
