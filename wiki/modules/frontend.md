---
title: "Frontend Architecture"
type: module
created: 2026-04-14
updated: 2026-04-15
tags: [frontend, react, architecture, phase-3]
sources: [raw/prompt.md]
related: [system-architecture, adr-003-tech-stack, design-system, admin-portal, public-page]
status: active
phase: 3
lead: Agent 3 (Solution Architect)
---

# Frontend Architecture

## Technology

- **Framework**: React 18 with TypeScript
- **Build**: Vite 5
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios (shared instance with interceptors)
- **Styling**: CSS Modules with CSS custom properties (design tokens)

## Directory Structure

```
client/
  src/
    main.tsx                    Entry point
    App.tsx                     Root component with router + ProtectedRoute
    api/
      client.ts                 Axios instance with auth + error interceptors
      auth.ts                   login(), verifyToken()
      holdings.ts               Holdings CRUD + transactions + market lookup
      portfolio.ts              Dashboard, performance, settings, publish APIs
    components/
      admin/
        AdminLayout.tsx         Sidebar navigation + Outlet
        AdminLayout.css
      common/                   (empty — components inlined in pages)
      public/                   (empty — sections inlined in PublicPortfolioPage)
    pages/
      admin/
        DashboardPage.tsx
        HoldingsPage.tsx
        AddHoldingPage.tsx
        EditHoldingPage.tsx
        PerformancePage.tsx
        TransactionsPage.tsx    All transactions across holdings
        SettingsPage.tsx
        PreviewPage.tsx
      LoginPage.tsx
      LoginPage.css
      PublicPortfolioPage.tsx
      PublicPortfolioPage.css
      NotFoundPage.tsx
    context/
      AuthContext.tsx           Auth state + useAuth() hook (no separate hooks/)
    hooks/                      (empty — hooks inlined in context/pages)
    types/                      (empty — types imported from shared/)
    styles/
      tokens.css                Design system variables
      global.css                Global resets and typography
    utils/
      format.ts                 formatCurrency(), formatPercent(), formatNumber(), formatDate()
  index.html
  vite.config.ts
  tsconfig.json
```

> [!note] Phase 7 implementation inlined reusable components and hooks directly into page files rather than extracting them into `components/common/`, `components/public/`, and `hooks/` directories. If the codebase grows, these can be extracted as a refactor.

## Routing

```typescript
// App.tsx routes
<Routes>
  {/* Public */}
  <Route path="/" element={<PublicPortfolioPage />} />
  <Route path="/login" element={<LoginPage />} />

  {/* Admin (protected) */}
  <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
    <Route index element={<DashboardPage />} />
    <Route path="holdings" element={<HoldingsPage />} />
    <Route path="holdings/new" element={<AddHoldingPage />} />
    <Route path="holdings/:ticker/edit" element={<EditHoldingPage />} />
    <Route path="performance" element={<PerformancePage />} />
    <Route path="transactions" element={<TransactionsPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="preview" element={<PreviewPage />} />
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

## State Management

- **Auth state**: React Context (`AuthContext`) with JWT token, login/logout actions
- **Data fetching**: Inline fetch-on-mount in page components (no separate custom hooks)
- **No global state library** — React state + context is sufficient for MVP
- **Cache**: React Query could be added later; MVP uses simple fetch-on-mount pattern
- **Types**: Imported from `shared/` package — no local type files in `client/src/types/`

## API Client

```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Auth interceptor: attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error interceptor: redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```
