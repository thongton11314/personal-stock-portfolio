---
title: "API Routes"
type: architecture
created: 2026-04-14
updated: 2026-04-15
tags: [api, routes, rest, phase-3]
sources: [raw/prompt.md]
related: [system-architecture, data-storage-schema, admin-portal, public-page]
status: active
phase: 3
lead: Agent 3 (Solution Architect)
---

# API Routes

## Base URL

- Development: `http://localhost:3001/api`
- Production: `{DOMAIN}/api`

## Authentication

All `/api/admin/*` routes require a valid JWT token in the `Authorization: Bearer {token}` header. Public routes require no authentication.

---

## Auth Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Authenticate admin, returns JWT |
| POST | `/api/auth/verify` | Yes | Verify token validity |

### POST `/api/auth/login`
```
Request:  { "username": "admin", "password": "..." }
Response: { "token": "jwt...", "expiresIn": 86400 }
Error:    401 { "error": "Invalid credentials" }
```

### POST `/api/auth/verify`
```
Response: { "valid": true, "username": "admin" }
Error:    401 { "error": "Invalid token" }
```

---

## Admin Holdings Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/holdings` | Yes | List all holdings (with filters) |
| GET | `/api/admin/holdings/:ticker` | Yes | Get single holding |
| POST | `/api/admin/holdings` | Yes | Create new holding |
| PUT | `/api/admin/holdings/:ticker` | Yes | Update holding |
| DELETE | `/api/admin/holdings/:ticker` | Yes | Delete holding |
| PATCH | `/api/admin/holdings/:ticker/visibility` | Yes | Toggle visibility |
| PATCH | `/api/admin/holdings/:ticker/status` | Yes | Archive/activate |
| PUT | `/api/admin/holdings/reorder` | Yes | Update display order |
| GET | `/api/admin/holdings/transactions/all` | Yes | List all transactions across all holdings |
| GET | `/api/admin/holdings/:ticker/transactions` | Yes | List transactions for a ticker |
| DELETE | `/api/admin/holdings/:ticker/transactions/:transactionId` | Yes | Delete a transaction |

### GET `/api/admin/holdings`
```
Query:    ?status=active&sector=Technology&visibility=public&page=1&limit=20&sort=displayOrder&order=asc
Response: {
  "holdings": [...],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

### POST `/api/admin/holdings`
```
Request:  { "ticker": "AAPL", "companyName": "Apple Inc", "assetType": "Stock",
            "quantity": 50, "averageCost": 150.25, "purchaseDate": "2024-01-15",
            "sector": "Technology", "notes": "", "isPublic": true, "displayOrder": 1 }
Response: 201 { "holding": {...} }
Error:    400 { "error": "Validation failed", "details": [...] }
          409 { "error": "Holding for AAPL already exists" }
```

---

## Admin Market Data Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/market/refresh` | Yes | Refresh all holdings market data |
| GET | `/api/admin/market/status` | Yes | Get cache status and rate limits |
| GET | `/api/admin/market/search/:query` | Yes | Search Alpha Vantage for symbols |
| GET | `/api/admin/market/lookup/:ticker` | Yes | Lookup ticker details |
| GET | `/api/admin/market/price/:ticker/:date` | Yes | Fetch historical price |

### POST `/api/admin/market/refresh`
```
Response: {
  "refreshed": 15,
  "failed": 0,
  "rateLimited": false,
  "lastRefresh": "2026-04-14T20:05:00Z"
}
Error:    429 { "error": "Rate limit exceeded. Try again later." }
```

---

## Admin Settings Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/settings` | Yes | Get all settings |
| PUT | `/api/admin/settings` | Yes | Update settings |

---

## Admin Performance Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/performance` | Yes | Get performance data |

### GET `/api/admin/performance`
```
Query:    ?range=1Y&startDate=2025-04-14&endDate=2026-04-14
Response: {
  "portfolio": {
    "totalValue": 125000,
    "totalCost": 100000,
    "totalReturn": 25.0,
    "dailyChange": 1.5,
    "timeSeries": [{ "date": "2025-04-14", "value": 100000, "return": 0 }, ...]
  },
  "benchmark": {
    "timeSeries": [{ "date": "2025-04-14", "value": 500, "return": 0 }, ...]
  },
  "comparison": {
    "portfolioReturn": 25.0,
    "benchmarkReturn": 18.5,
    "relativePerformance": 6.5
  }
}
```

---

## Admin Dashboard Route

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/dashboard` | Yes | Get dashboard summary data |

### GET `/api/admin/dashboard`
```
Response: {
  "totalValue": 125000,
  "totalGainLoss": 25000,
  "totalGainLossPercent": 25.0,
  "dailyChange": 1875,
  "dailyChangePercent": 1.5,
  "holdingsCount": 15,
  "benchmarkReturn": 18.5,
  "portfolioReturn": 25.0,
  "relativePerformance": 6.5,
  "lastRefresh": "2026-04-14T20:05:00Z"
}
```

---

## Admin Publish Route

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/admin/publish` | Yes | Publish the public page |
| POST | `/api/admin/unpublish` | Yes | Unpublish the public page |

---

## Public Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public/portfolio` | No | Get public portfolio data |

> [!note] Phase 3 spec included `GET /api/public/performance` as a separate route. In implementation, performance data is included in the `/api/public/portfolio` response.

### GET `/api/public/portfolio`
```
Response: {
  "portfolio": {
    "title": "My Portfolio",
    "subtitle": "...",
    "description": "...",
    "disclaimer": "...",
    "lastUpdated": "2026-04-14T20:05:00Z"
  },
  "summary": {
    "totalValue": 125000,
    "totalReturn": 25.0,
    "holdingsCount": 12
  },
  "holdings": [
    {
      "ticker": "AAPL", "companyName": "Apple Inc", "sector": "Technology",
      "weight": 25.3, "marketValue": 31625, "gainLoss": 6625, "gainLossPercent": 26.5,
      "notes": "Core position"
    }
  ],
  "allocation": {
    "bySector": [{ "sector": "Technology", "weight": 45.3 }, ...]
  }
}
```

> [!note] Quantity is NEVER included in public API responses. Weight (allocation percentage) is calculated server-side.

### GET `/api/public/performance`
```
Query:    ?range=1Y
Response: {
  "portfolio": {
    "timeSeries": [{ "date": "2025-04-14", "return": 0 }, ...],
    "totalReturn": 25.0
  },
  "benchmark": {
    "timeSeries": [{ "date": "2025-04-14", "return": 0 }, ...],
    "totalReturn": 18.5
  },
  "relativePerformance": 6.5
}
```

Error if page is unpublished:
```
404 { "error": "Not found" }
```

---

## Error Response Format

All errors follow a consistent format:
```json
{
  "error": "Human-readable error message",
  "details": ["Optional array of specific issues"]
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful read or update |
| 201 | Successful creation |
| 400 | Validation failure |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Resource not found or page unpublished |
| 409 | Conflict (duplicate holding) |
| 429 | Rate limited (Alpha Vantage) |
| 500 | Internal server error |
