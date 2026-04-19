---
title: "Data Storage Schema"
type: architecture
created: 2026-04-14
updated: 2026-04-14
tags: [data, storage, schema, phase-3]
sources: [raw/prompt.md]
related: [system-architecture, api-routes, adr-004-data-storage]
status: final
phase: 3
lead: Agent 3 (Solution Architect)
---

# Data Storage Schema

## Directory Layout

```
data/
  holdings/           One JSON file per holding
    AAPL.json
    MSFT.json
    ...
  settings.json       Portfolio settings and configuration
  cache/              Cached Alpha Vantage responses (gitignored)
    quotes/
      AAPL.json
      MSFT.json
    search/
      AAPL.json
  benchmark/          Cached benchmark data (gitignored)
    SPY-daily.json
  audit/              Append-only change log
    2026-04.md
```

## File Formats

### Holding File (`data/holdings/{TICKER}.json`)

```json
{
  "id": "aapl-1713100800000",
  "ticker": "AAPL",
  "companyName": "Apple Inc",
  "assetType": "Stock",
  "quantity": 50,
  "averageCost": 150.25,
  "purchaseDate": "2024-01-15",
  "sector": "Technology",
  "notes": "Core position",
  "isPublic": true,
  "displayOrder": 1,
  "status": "active",
  "createdAt": "2024-01-15T12:00:00Z",
  "updatedAt": "2026-04-14T12:00:00Z"
}
```

### Settings File (`data/settings.json`)

```json
{
  "portfolio": {
    "title": "My Portfolio",
    "subtitle": "Personal Investment Portfolio",
    "description": "A long-term growth portfolio...",
    "disclaimer": "For informational purposes only..."
  },
  "benchmark": {
    "symbol": "SPY",
    "name": "S&P 500 (SPY)"
  },
  "publicPage": {
    "isPublished": false,
    "slug": "portfolio",
    "seoTitle": "Portfolio | My Portfolio",
    "seoDescription": "View my investment portfolio performance."
  },
  "auth": {
    "username": "admin",
    "passwordHash": "$2b$10$..."
  },
  "updatedAt": "2026-04-14T12:00:00Z"
}
```

### Cache File (`data/cache/quotes/{TICKER}.json`)

```json
{
  "symbol": "AAPL",
  "price": 178.50,
  "change": 2.30,
  "changePercent": 1.31,
  "volume": 52000000,
  "latestTradingDay": "2026-04-14",
  "fetchedAt": "2026-04-14T20:05:00Z"
}
```

### Benchmark Cache (`data/benchmark/SPY-daily.json`)

```json
{
  "symbol": "SPY",
  "fetchedAt": "2026-04-14T20:05:00Z",
  "timeSeries": {
    "2026-04-14": { "close": 520.50 },
    "2026-04-11": { "close": 518.20 },
    "...": "..."
  }
}
```

### Audit Log (`data/audit/2026-04.md`)

```markdown
## 2026-04-14T15:30:00Z | ADD_HOLDING
- **User**: admin
- **Holding**: AAPL
- **Details**: Added Apple Inc, 50 shares at $150.25

## 2026-04-14T16:00:00Z | UPDATE_HOLDING
- **User**: admin
- **Holding**: AAPL
- **Details**: Changed quantity from 50 to 75
- **Fields**: quantity
```

## Read/Write Patterns

### List Holdings
```
Read: fs.readdir("data/holdings/")
For each file: fs.readFile("data/holdings/{file}")
Parse JSON, filter by status/visibility as needed
Sort by displayOrder
```

### Get Single Holding
```
Read: fs.readFile("data/holdings/{TICKER}.json")
Parse JSON, return
404 if file not found
```

### Create Holding
```
Validate: no existing file for this ticker
Write: fs.writeFile("data/holdings/{TICKER}.json", JSON.stringify(data))
Append: audit log entry to data/audit/{YYYY-MM}.md
```

### Update Holding
```
Read: existing file
Merge: updated fields
Write: fs.writeFile("data/holdings/{TICKER}.json", JSON.stringify(data))
Append: audit log entry
```

### Delete Holding
```
Delete: fs.unlink("data/holdings/{TICKER}.json")
Append: audit log entry
```

### Archive Holding
```
Read: existing file
Set: status = "archived"
Write: fs.writeFile (same file, updated)
Append: audit log entry
```

### Read Settings
```
Read: fs.readFile("data/settings.json")
Parse JSON, return
```

### Update Settings
```
Read: existing settings
Merge: updated fields
Write: fs.writeFile("data/settings.json", JSON.stringify(data))
Append: audit log entry
```

## Cache Management

- Cache files stored in `data/cache/` and `data/benchmark/` (gitignored)
- Cache eviction: max age 24 hours for quotes, 24 hours for benchmark daily data
- On cache miss: fetch from Alpha Vantage, write to cache file
- On cache hit: return cached data, check age
- Max cache files: no hard limit (bounded by number of holdings, typically < 100)
- Cache is ephemeral: safe to delete entirely; regenerated on next refresh
