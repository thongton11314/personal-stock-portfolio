---
title: "Backend Architecture"
type: module
created: 2026-04-14
updated: 2026-04-15
tags: [backend, express, node, architecture, phase-3]
sources: [raw/prompt.md]
related: [system-architecture, adr-003-tech-stack, api-routes, data-storage-schema]
status: active
phase: 3
lead: Agent 3 (Solution Architect)
---

# Backend Architecture

## Technology

- **Runtime**: Node.js 20 LTS
- **Framework**: Express 4.x
- **Language**: TypeScript 5.x
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **HTTP Client**: Axios (for Alpha Vantage)
- **Validation**: Inline validation in route handlers (Zod not adopted)
- **Types**: Imported from `shared/` package
- **Testing**: Vitest

## Directory Structure

```
server/
  src/
    index.ts                    Express app entry point (starts HTTP server)
    app.ts                      Express app configuration + route registration
    middleware/
      auth.ts                   JWT authentication middleware
      errorHandler.ts           Global error handler
    routes/
      auth.ts                   POST /api/auth/login, /api/auth/verify
      adminHoldings.ts          CRUD /api/admin/holdings + transactions
      adminMarket.ts            /api/admin/market/* (refresh, search, lookup, price)
      adminSettings.ts          /api/admin/settings
      adminPerformance.ts       /api/admin/performance
      adminPublish.ts           /api/admin/publish, /api/admin/unpublish
      adminDashboard.ts         /api/admin/dashboard
      publicPortfolio.ts        /api/public/portfolio
    services/
      dataService.ts            File system read/write operations
      alphaVantageService.ts    Alpha Vantage API client + rate limiting
      cacheService.ts           Cache management (quotes 24h, search 7d, benchmark 24h)
      calculationService.ts     Return calculations, allocation, benchmark comparison
      auditService.ts           Audit log operations
    schemas/                    (empty — validation is inline in route handlers)
    types/                      (empty — types imported from shared/)
    utils/
      fileSystem.ts             File system helpers (readJSON, writeJSON, path helpers)
      dateUtils.ts              Trading day calculations, date formatting
  tsconfig.json
```

> [!note] Phase 7 implementation consolidated benchmark logic into `calculationService.ts` rather than a separate `benchmarkService.ts`. Validation is done inline in route handlers rather than via Zod schemas. Types are shared from the `shared/` package.

## Middleware Stack

```
Express App
  ├── CORS (development only)
  ├── JSON body parser
  ├── Static file serving (production: client/dist)
  ├── Health check: GET /api/health
  ├── Routes:
  │   ├── /api/auth/*           (no auth middleware)
  │   ├── /api/admin/*          (auth middleware required)
  │   └── /api/public/*         (no auth middleware, publish check)
  └── Global error handler
```

> [!note] Rate limiting and request validation were planned as separate middleware but are currently handled inline in route handlers and the AlphaVantageService respectively.

## Key Services

### DataService
- Reads and writes JSON files from `data/` directory
- Provides typed CRUD operations for holdings and settings
- Handles file locking (simple: write-after-read with atomic rename)
- Caches file listings in memory (invalidated on write)

### AlphaVantageService
- Wraps Alpha Vantage REST API
- Functions: `getQuote(ticker)`, `searchSymbol(query)`, `getDailyTimeSeries(ticker)`
- Rate-limit aware: tracks call count, returns 429 when limit approached
- API key from `process.env.ALPHA_VANTAGE_API_KEY`

### CacheService
- Manages `data/cache/` and `data/benchmark/` directories
- Cache key: ticker symbol
- TTL: 24 hours for quotes, 7 days for search results, 24 hours for benchmark data
- Methods: `getCachedQuote()`, `setCachedQuote()`, `getCachedBenchmark()`, `setCachedBenchmark()`

### CalculationService
- Pure functions for financial calculations
- `calculateMarketValue(quantity, price)`
- `calculateTotalCost()`
- `calculateGainLoss(marketValue, totalCost)`
- `calculateAllocationWeights(holdings[])`
- `calculatePortfolioSummary()`
- `calculatePerformance()` (includes benchmark comparison via SPY)

> [!note] Benchmark comparison logic is integrated into CalculationService rather than a separate BenchmarkService. See [[adr-006-benchmark-proxy]].

### AuditService
- Appends entries to `data/audit/{YYYY-MM}.md`
- Structured log format with timestamp, user, action, details
- Read-only query for recent entries (admin dashboard)

## Error Handling

```typescript
// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
});
```

All route handlers use try/catch and pass errors to next(). Known error types (validation, not found, auth) have specific status codes. Unknown errors return 500.
