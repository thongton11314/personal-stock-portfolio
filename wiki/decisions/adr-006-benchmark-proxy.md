---
title: "ADR-006: Benchmark Proxy Selection"
type: decision
created: 2026-04-14
updated: 2026-04-14
tags: [adr, benchmark, spy, sp500, phase-4]
sources: [raw/prompt.md]
related: [benchmark-engine, benchmark-methodology]
status: active
phase: 4
lead: Agent 5 (Data/API Integration Designer)
---

# ADR-006: Benchmark Proxy Selection

## Context

The portfolio must be compared against the S&P 500 index. Alpha Vantage does not provide a direct S&P 500 index data feed. A proxy is needed.

## Options Considered

### Option A: SPY (SPDR S&P 500 ETF Trust) — Selected
- **Pro**: Available via standard Alpha Vantage endpoints. < 0.1% tracking error. Most liquid ETF. Industry standard.
- **Con**: Not the actual index. Includes ETF expense ratio (0.09%). Minor tracking differences.

### Option B: VOO (Vanguard S&P 500 ETF)
- **Pro**: Lower expense ratio (0.03%). Also available via Alpha Vantage.
- **Con**: Less liquid than SPY. Less commonly used as a benchmark proxy.

### Option C: ^GSPC (S&P 500 Index directly)
- **Pro**: The actual index.
- **Con**: Not reliably available via Alpha Vantage free tier. Index data access may be restricted or inconsistent.

## Decision

**Option A** — SPY.

SPY is the most reliable, widely available, and commonly recognized S&P 500 proxy. Its tracking error is negligible for a personal portfolio comparison. It uses the same Alpha Vantage endpoints as individual stock holdings, keeping the integration simple.

## Consequences

- **Positive**: Zero additional API complexity — SPY uses the same data pipeline as holdings.
- **Positive**: Reliable data availability. SPY always has data on trading days.
- **Positive**: Recognized by users — "SPY" as a benchmark label is intuitive.
- **Limitation**: Price-only returns (no dividend reinvestment). Documented in methodology disclosures.
- **Limitation**: Minor expense ratio drag (0.09% annually). Negligible for portfolio comparison.
