# AAP — AI Administration Platform

A SaaS platform that lets teams add an intelligent, natural-language administration layer to their applications instead of hand-building admin pages, filters and dashboards for every need.

This repo covers Phase 1 (security-first backend and frontend foundations: auth, RBAC, audit, i18n, reusable UI) and the start of Phase 2 (Docker + Nginx) that later phases (Celery, CI/CD, then AI query engine, RAG, connectors, MCP) build on.

- [`backend/`](backend/README.md) — Django/DRF, PostgreSQL, Redis, JWT/OAuth, RBAC, audit logging.
- [`frontend/`](frontend/README.md) — React, TypeScript, Vite, Tailwind, Redux Toolkit, i18n, ECharts.

## Running with Docker

Requires Docker and the Compose plugin. From the repo root:

```bash
cp .env.docker.example .env
docker compose up --build
```

This starts PostgreSQL, Redis, the Django backend, the Vite dev server, and an nginx reverse proxy in front of both, all on one network:

| Service                  | URL                             |
| ------------------------- | -------------------------------- |
| App (via nginx)           | http://localhost:8090            |
| API (via nginx)           | http://localhost:8090/api        |
| Django admin (via nginx)  | http://localhost:8090/admin      |
| Backend (direct)          | http://localhost:8000            |
| Frontend (direct)         | http://localhost:5173            |

nginx (`nginx/nginx.conf`) is the single entry point: `/api/`, `/admin/` and `/static/` are proxied to the Django backend, everything else (including the Vite HMR websocket) goes to the frontend dev server. The frontend's `VITE_API_URL` always points at nginx, so API calls work the same whether you load the app through nginx or hit the frontend dev server directly.

Both `backend/` and `frontend/` are bind-mounted into their containers, so code changes hot-reload (Django dev server autoreload, Vite HMR) without rebuilding. The backend entrypoint waits for Postgres and Redis to accept connections and runs `migrate` automatically on every start.

To run without Docker, see the per-app READMEs linked above.
