---
title: "Benchmark Methodology"
type: concept
created: 2026-04-14
updated: 2026-04-14
tags: [benchmark, methodology, sp500, spy, phase-4]
sources: [raw/prompt.md]
related: [benchmark-engine, return-calculations, alpha-vantage-service]
status: final
phase: 4
lead: Agent 5 (Data/API Integration Designer)
---

# Benchmark Methodology

## Summary

The portfolio's performance is compared against the S&P 500 index using SPY (SPDR S&P 500 ETF Trust) as a proxy. Both portfolio and benchmark returns are calculated as cumulative percentage returns over the same time period, starting from the earliest holding purchase date.

## Why SPY?

1. **API compatibility**: Alpha Vantage treats SPY like any other ticker — same `TIME_SERIES_DAILY` and `GLOBAL_QUOTE` endpoints. No special index API required.
2. **Accuracy**: SPY has a tracking error of < 0.1% against the S&P 500 index. For a personal portfolio comparison, this is more than sufficient.
3. **Liquidity**: SPY is the most liquid ETF in the world. Price data is always available on trading days.
4. **Simplicity**: Using the same data pipeline for benchmark and holdings reduces complexity.
5. **Industry standard**: Retail brokerage platforms commonly use SPY for S&P 500 comparison.

## Comparison Method

### Step 1: Determine Date Range
```
startDate = MIN(purchaseDate) for all active holdings
endDate = today (or latest available trading day)
```

If the user selects a custom range, those dates override the defaults.

### Step 2: Build Portfolio Time Series
For each trading day from startDate to endDate:
```
portfolioValue[date] = SUM(holding.quantity * holdingClosePrice[date])
  for each holding where holding.purchaseDate <= date
```

### Step 3: Build Benchmark Time Series
For each trading day from startDate to endDate:
```
benchmarkValue[date] = SPY_close[date]
```

### Step 4: Calculate Cumulative Returns
```
portfolioReturn[date] = (portfolioValue[date] / portfolioValue[startDate] - 1) * 100
benchmarkReturn[date] = (SPY_close[date] / SPY_close[startDate] - 1) * 100
```

### Step 5: Calculate Relative Performance
```
relativePerformance = portfolioReturn[endDate] - benchmarkReturn[endDate]
```

## Date Alignment Rules

1. **Only use dates where both series have data** (trading days only)
2. **Skip weekends and holidays** — no interpolation
3. **For the chart**: plot both series on the same x-axis using shared dates
4. **For summary metrics**: use the first and last dates in the aligned series

## Limitations and Disclosures

These must be communicated in the Methodology section of the public page:

1. **SPY is a proxy, not the index itself** — minor tracking differences exist
2. **No dividends**: this MVP uses price returns only (not total returns). Dividends from holdings and SPY distributions are not factored in. This slightly understates both portfolio and benchmark returns.
3. **No transaction costs**: commission, slippage, and fees are not included
4. **No cash drag**: the comparison assumes the portfolio is fully invested at all times
5. **Delayed data**: prices from Alpha Vantage may be delayed up to 24 hours
6. **Historical composition**: the portfolio's holdings changed over time as new positions were added. The benchmark comparison reflects this evolving composition.
7. **Not investment advice**: the performance comparison is for informational purposes only

## Data Freshness

- Market data is refreshed manually by the admin
- Data can be up to 24 hours stale on trading days
- The "Last Updated" timestamp is always visible
- On weekends/holidays, the last trading day's data is shown (this is not stale)
