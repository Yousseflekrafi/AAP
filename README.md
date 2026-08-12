# AAP — AI Administration Platform

A SaaS platform that lets teams add an intelligent, natural-language administration layer to their applications instead of hand-building admin pages, filters and dashboards for every need.

This repo covers Phase 1 (security-first backend and frontend foundations: auth, RBAC, audit, i18n, reusable UI) and the start of Phase 2 (Docker + Traefik) that later phases (Celery, CI/CD, then AI query engine, RAG, connectors, MCP) build on.

- [`backend/`](backend/README.md) — Django/DRF, PostgreSQL, Redis, JWT/OAuth, RBAC, audit logging.
- [`frontend/`](frontend/README.md) — React, TypeScript, Vite, Tailwind, Redux Toolkit, i18n, ECharts.

## Running with Docker

Requires Docker and the Compose plugin. From the repo root:

```bash
cp .env.docker.example .env
docker compose up --build
```

This starts Traefik, PostgreSQL, Redis, the Django backend and the Vite dev server, all on one network:

| Service            | URL                          |
| ------------------ | ----------------------------- |
| Frontend (via Traefik) | http://app.localhost |
| Backend API (via Traefik) | http://api.localhost/api |
| Traefik dashboard  | http://localhost:8080         |
| Backend (direct)   | http://localhost:8000          |
| Frontend (direct)  | http://localhost:5173          |

`*.localhost` hostnames resolve to `127.0.0.1` on their own (RFC 6761) — no `/etc/hosts` edit needed.

Both `backend/` and `frontend/` are bind-mounted into their containers, so code changes hot-reload (Django dev server autoreload, Vite HMR) without rebuilding. The backend entrypoint waits for Postgres and Redis to accept connections and runs `migrate` automatically on every start.

To run without Docker, see the per-app READMEs linked above.
