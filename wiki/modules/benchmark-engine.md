---
title: "Benchmark Engine"
type: module
created: 2026-04-14
updated: 2026-04-14
tags: [benchmark, sp500, spy, comparison, phase-4]
sources: [raw/prompt.md]
related: [alpha-vantage-service, return-calculations, benchmark-methodology, performance]
status: final
phase: 4
lead: Agent 5 (Data/API Integration Designer)
---

# Benchmark Engine

## Overview

The benchmark engine fetches S&P 500 performance data (via SPY ETF proxy), aligns it with portfolio time ranges, and calculates comparative returns.

## SPY as S&P 500 Proxy

SPY (SPDR S&P 500 ETF) is used as the S&P 500 benchmark because:
- Alpha Vantage provides SPY data through the same `TIME_SERIES_DAILY` endpoint
- SPY tracks the S&P 500 with < 0.1% tracking error
- No special API or data source needed — same integration as individual holdings
- Industry-standard practice for retail portfolio comparison

See [[adr-006-benchmark-proxy]] for the full decision record.

## Data Flow

1. **Determine date range**: earliest active holding purchase date to today
2. **Fetch SPY daily prices**: via Alpha Vantage `TIME_SERIES_DAILY` (full output)
3. **Cache**: store in `data/benchmark/SPY-daily.json`, 24h TTL
4. **Filter**: extract only dates within the portfolio range
5. **Align**: match benchmark dates to portfolio trading dates
6. **Calculate**: cumulative return from the start date

## Date Range Alignment

### Default Range
- **Start**: earliest `purchaseDate` among all active (non-archived) holdings
- **End**: today (or latest available trading day)

### Custom Range (admin performance page)
- User selects start and end dates via presets (1M, 3M, 6M, YTD, 1Y, All) or custom pickers
- Benchmark is filtered to the same range

### Non-Trading Days
- Weekends and US market holidays have no data points
- When a portfolio event (purchase) falls on a non-trading day, use the next available trading day's close price
- Both portfolio and benchmark series skip non-trading days — they share the same date axis

### Missing Data
- If a date exists in portfolio but not in benchmark (or vice versa): skip that date in both series
- The chart shows only dates where both series have data
- This ensures 1:1 alignment for accurate comparison

## Benchmark Return Calculation

```
benchmarkReturn(startDate, endDate) =
  (SPY_close[endDate] - SPY_close[startDate]) / SPY_close[startDate] * 100

cumulativeReturn(date) =
  (SPY_close[date] - SPY_close[startDate]) / SPY_close[startDate] * 100
```

The benchmark time series for charting is an array of `{ date, return }` pairs where return is the cumulative return from the start date.
