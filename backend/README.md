# AAP Backend

Django/DRF backend for the AI Administration Platform — Phase 1 Core: identity/RBAC, organizations, applications, customer PostgreSQL connections, and schema discovery. (AI query engine, RAG, permission *enforcement*, and billing are later phases — see the consolidated spec.)

## Stack

Django 5.2, Django REST Framework, SimpleJWT, PostgreSQL (SQLite fallback for local dev), Redis, Argon2 password hashing, django-cors-headers, django-filter, psycopg (customer DB connections).

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit as needed
python manage.py migrate
python manage.py seed_users     # superadmin/admin/customer dev accounts, see below
python manage.py runserver
```

Redis must be running locally (`redis-server`) — it backs the cache, rate limiting, OTP codes and password-reset tokens. Without `DATABASE_URL` set, the app falls back to SQLite for local development; set `DATABASE_URL` to a PostgreSQL DSN for anything beyond that (needed for the organizations/applications/connections/schemas tables — SQLite works fine for these too, they're just AAP's own metadata).

## Seeded users

`python manage.py seed_users` creates three pre-verified accounts (idempotent — safe to re-run, e.g. after a password change):

| Email | Password | Role |
|---|---|---|
| `superadmin@aap.local` | `SuperAdmin123!` | `super_admin` |
| `admin@aap.local` | `Admin123!` | `admin` |
| `customer@aap.local` | `Customer123!` | none (regular user) |

`super_admin` implies every `admin` capability (see `Role.IMPLIES` in `apps/accounts/models.py`) plus platform-level actions like granting/revoking the `super_admin` role itself. Development credentials only — never run this against production.

## Structure

```
backend/
  config/settings/{base,development,production}.py
  apps/
    accounts/       # custom User, JWT auth, email verification, Google OAuth, RBAC, seed_users command
    organizations/  # Organization, OrganizationMember — who can act on an org
    applications/   # Application, scoped to an organization
    connections/    # DatabaseConnection (Fernet-encrypted creds, read-only), test-connection
    schemas/        # DatabaseSchema/Table/Column/Relationship + read-only introspection service
    permissions/    # TablePermission/ColumnPermission/DataPermission — structural, enforcement is a later phase
    notifications/  # in-app notification center (personal — no cross-user listing)
    admin_messages/ # internal Admin <-> Super Admin conversations, not a customer-facing chat
    audit/          # audit logs + security events, request logging middleware
    ai/ knowledge/ queries/ billing/   # placeholders for later phases
```

## Auth API (`/api/auth/`)

`register/`, `verify-email/`, `verify-email/resend/`, `login/`, `login/google/`, `refresh/`, `logout/`, `password/forgot/`, `password/reset/`, `password/change/`, `me/`, `users/` (admin), `users/<id>/` (admin), `users/<id>/status/` (admin, PATCH `is_active`), `users/<id>/roles/` (admin, PATCH `roles` — granting/revoking `super_admin` itself requires `super_admin`).

Access tokens are returned in the response body and kept in memory on the frontend; refresh tokens live in an HttpOnly, SameSite cookie scoped to `/api/auth/` and rotate on every refresh.

## Organizations / Applications API

Organizations are self-serve — no approval queue. Any verified user creates one and is immediately its `owner`; there's no `PENDING_APPROVAL` state to wait out (email verification is the only account gate, by design). A `super_admin` can moderate one after the fact:

- `organizations/` — list (scoped to your memberships, or all for admins) / create (creator becomes `owner`).
- `organizations/<id>/` — retrieve/update/delete; any member can read, only `owner`/`admin` members can write.
- `organizations/<id>/suspend/` (super_admin, POST, body `{"reason": "..."}`) / `organizations/<id>/reactivate/` (super_admin, POST) — a suspended org is locked out for everyone except `super_admin` (even a plain platform `admin` who's also a member loses access), and every member gets notified.
- `organizations/<id>/members/`, `organizations/<id>/members/<member_id>/` — manage membership.
- `organizations/<org_id>/applications/` — list/create applications in an org.
- `applications/<id>/` — retrieve/update/delete.

## Connections & schema discovery API

- `applications/<app_id>/connections/` — list/create a customer PostgreSQL connection. The password is write-only and encrypted at rest (Fernet, `FIELD_ENCRYPTION_KEY`) — it's never returned by the API.
- `connections/<id>/` — retrieve/update/delete (password omitted unless changing it).
- `connections/<id>/test/` — attempts a short, read-only connect + `SELECT 1`. Stores only success/failure, never customer data.
- `connections/<id>/discover-schema/` — introspects `information_schema` (tables/columns/primary keys/foreign keys) read-only and syncs AAP's own schema metadata. Idempotent.
- `connections/<id>/schema/` — returns the last-discovered schema (no live query).

## Notifications API (`/api/notifications/`)

Always scoped to the requester — there's no cross-user or admin-wide listing, notifications are personal.

`notifications/`, `notifications/unread-count/`, `notifications/read-all/` (POST), `notifications/<id>/read/` (POST).

## Admin messaging API (`/api/admin-messages/`)

Internal support channel between org admins and platform `super_admin`s — not a customer-facing chat. `super_admin` sees every conversation; a plain `admin` sees only the ones they started.

- `conversations/` — list/create. Creating one notifies every `super_admin`.
- `conversations/<id>/` — retrieve.
- `conversations/<id>/close/` (POST, body `{"status": "closed"|"open"}`) — either party can close/reopen their own conversation.
- `conversations/<id>/manage/` (PATCH, `super_admin` only) — priority/assignment.
- `conversations/<id>/messages/` — list/reply. Replying flips the conversation to `waiting_for_admin`/`waiting_for_super_admin` and notifies the other side.

## Audit API (`/api/audit/`)

`logs/`, `security-events/` — admin-only.
