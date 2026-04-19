---
title: "Implementation Roadmap"
type: analysis
created: 2026-04-14
updated: 2026-04-14
tags: [roadmap, implementation, planning, phase-6]
sources: [raw/prompt.md]
related: [mvp-scope, risk-tradeoff-analysis, system-architecture]
status: final
phase: 6
lead: Agent 1 (Product Strategist)
---

# Implementation Roadmap

## Phase 7 Feature Batches

Implementation follows 8 batches in dependency order. Each batch produces testable, verifiable output before proceeding.

### Batch 1: Project Setup and Data Layer

**Goal**: Working project scaffolding with data read/write operations.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 1.1 | [[system-architecture]] | Initialize monorepo: `client/` (Vite + React), `server/` (Express), `shared/` types |
| 1.2 | [[coding-conventions]] | Configure TypeScript, ESLint, Prettier, Vitest |
| 1.3 | [[data-storage-schema]] | Create `data/` directory with initial templates (settings.json, sample holding) |
| 1.4 | [[backend]] | Implement DataService: readJSON, writeJSON, listFiles |
| 1.5 | [[backend]] | Implement CacheService: get, set, isStale, evictExpired |
| 1.6 | [[backend]] | Implement AuditService: appendEntry, readRecent |
| 1.7 | - | Unit tests for all data services |

**Exit**: data services pass all unit tests; project builds cleanly.

### Batch 2: Auth and Admin Dashboard

**Goal**: Login works, dashboard shows data.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 2.1 | [[adr-005-auth]] | Implement auth middleware (JWT validation) |
| 2.2 | [[api-routes]] | Implement POST /api/auth/login, /api/auth/verify |
| 2.3 | [[admin-portal]] | Implement LoginPage component |
| 2.4 | [[frontend]] | Implement AuthContext, ProtectedRoute, AdminLayout |
| 2.5 | [[api-routes]] | Implement GET /api/admin/dashboard |
| 2.6 | [[admin-portal]] | Implement DashboardPage with MetricCards |
| 2.7 | [[design-system]] | Implement design tokens (CSS variables), global styles |
| 2.8 | - | Integration tests for auth flow |

**Exit**: admin can log in, see dashboard with mock data. Agent 7 verifies login flow.

### Batch 3: Holdings CRUD

**Goal**: Full create, read, update, delete for holdings.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 3.1 | [[api-routes]] | Implement all admin holdings routes (CRUD, visibility, status, reorder) |
| 3.2 | [[admin-portal]] | Implement HoldingsPage (table, filters, pagination, sort) |
| 3.3 | [[admin-portal]] | Implement AddHoldingPage (form with validation) |
| 3.4 | [[admin-portal]] | Implement EditHoldingPage |
| 3.5 | - | Implement delete/archive confirmation modals |
| 3.6 | - | Unit + integration tests for holdings CRUD |

**Exit**: holdings CRUD works end-to-end. Agent 7 verifies add/edit/delete flows.

### Batch 4: Alpha Vantage Integration

**Goal**: Market data fetch, cache, and display.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 4.1 | [[alpha-vantage-service]] | Implement AlphaVantageService (getQuote, searchSymbol, getDailyTimeSeries) |
| 4.2 | [[alpha-vantage-service]] | Implement rate-limit tracking and backoff |
| 4.3 | [[api-routes]] | Implement market refresh routes |
| 4.4 | [[admin-portal]] | Implement ticker validation in holding form |
| 4.5 | [[admin-portal]] | Implement refresh button on dashboard |
| 4.6 | - | Integration tests with mock Alpha Vantage responses |

**Exit**: market data refreshes, caches, and displays. Rate limiting works.

### Batch 5: Performance and Benchmark

**Goal**: Performance charts with S&P 500 comparison.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 5.1 | [[return-calculations]] | Implement CalculationService (all return formulas) |
| 5.2 | [[benchmark-engine]] | Implement BenchmarkService (SPY data fetch, alignment) |
| 5.3 | [[api-routes]] | Implement GET /api/admin/performance |
| 5.4 | [[admin-portal]] | Implement PerformancePage with Recharts |
| 5.5 | - | Unit tests for all calculations (manual verification) |
| 5.6 | - | Verify allocation weights sum to 100% |

**Exit**: performance chart renders correctly. Calculations match manual spreadsheet.

### Batch 6: Settings and Publish

**Goal**: Settings management, publish/unpublish, preview.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 6.1 | [[api-routes]] | Implement settings routes (GET, PUT) |
| 6.2 | [[api-routes]] | Implement publish/unpublish routes |
| 6.3 | [[admin-portal]] | Implement SettingsPage |
| 6.4 | [[admin-portal]] | Implement PreviewPage with iframe |
| 6.5 | [[security-model]] | Implement publish check on public routes |
| 6.6 | - | Test: unpublished page returns 404 |

**Exit**: settings save, preview works, publish/unpublish toggles public access.

### Batch 7: Public Portfolio Page

**Goal**: Complete public page with all 5 sections.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 7.1 | [[api-routes]] | Implement GET /api/public/portfolio |
| 7.2 | [[api-routes]] | Implement GET /api/public/performance |
| 7.3 | [[public-page]] | Implement PublicPortfolioPage (all 5 sections) |
| 7.4 | [[security-model]] | Verify quantity NEVER in public response |
| 7.5 | [[security-model]] | Verify hidden/archived holdings excluded |
| 7.6 | - | Security test suite for public data exposure |

**Exit**: public page renders all sections. Agent 7 confirms no quantity leakage.

### Batch 8: Polish, Responsive, Accessibility

**Goal**: Production-quality UX.

| Task | Wiki Reference | Description |
|------|---------------|-------------|
| 8.1 | [[design-system]] | Responsive layout for mobile (375px) |
| 8.2 | [[accessibility-standards]] | Keyboard navigation on all interactive elements |
| 8.3 | [[accessibility-standards]] | Focus states, aria labels, chart alt text |
| 8.4 | [[accessibility-standards]] | Semantic HTML audit |
| 8.5 | - | Empty states, loading states, error states for all pages |
| 8.6 | - | Lighthouse audit: accessibility >= 90 |
| 8.7 | - | Final regression test suite |

**Exit**: all success metrics met. Agent 6 signs off on release readiness.

## Implementation Recommendation

Start with Batch 1 immediately. Each batch depends on the prior batch's exit criteria. The total implementation scope is manageable for a single developer following the wiki specs. All design decisions are documented in ADRs. All API contracts are defined. All UX specs include layout, states, and validation rules.

The wiki serves as the living specification — every code change should reference the relevant wiki page and update it if the implementation deviates from the spec.
