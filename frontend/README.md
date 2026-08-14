# AAP Frontend

React + TypeScript + Vite frontend for the AI Administration Platform — Phase 1.

## Stack

React 19, Vite, TypeScript, Tailwind CSS v4, Redux Toolkit, React Router, TanStack Query, i18next, Apache ECharts, Axios.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to the backend
npm run dev
```

The dev server proxies nothing by default — it talks to `VITE_API_URL` (defaults to `http://localhost:8000/api`) directly with credentials, so the backend's `CORS_ALLOWED_ORIGINS` must include the frontend origin.

## Structure

```
src/
  reusedComponents/   # Sidebar, Navbar, Modal, DataTable, Charts, Loader, etc.
  layouts/            # PublicLayout, UserLayout, AdminLayout
  pages/               # public/, user/, admin/, shared/ (e.g. Notifications)
  routes/              # AppRoutes, ProtectedRoute, AdminRoute
  services/            # apiClient (axios + refresh interceptor), authService, adminService,
                       # notificationsService, adminMessagesService, dashboardService
  store/               # Redux Toolkit: auth, theme, language, sidebar slices
  i18n/                # fr/ en/ translation.json
  hooks/               # useAuth
  types/               # shared TS types
```

The frontend holds no business data of its own — the app name, roles, permissions, and all admin content come from the API. The access token lives in memory only; the refresh token lives in an HttpOnly cookie the frontend never touches.
