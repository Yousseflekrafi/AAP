# AAP — AI Administration Platform

A SaaS platform that lets teams add an intelligent, natural-language administration layer to their applications instead of hand-building admin pages, filters and dashboards for every need.

This repo is Phase 1: the security-first backend and frontend foundations (auth, RBAC, audit, i18n, reusable UI) that later phases (AI query engine, RAG, connectors, MCP) build on.

- [`backend/`](backend/README.md) — Django/DRF, PostgreSQL, Redis, JWT/OAuth, RBAC, audit logging.
- [`frontend/`](frontend/README.md) — React, TypeScript, Vite, Tailwind, Redux Toolkit, i18n, ECharts.
