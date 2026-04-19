---
title: "MVP Scope Definition"
type: analysis
created: 2026-04-14
updated: 2026-04-14
tags: [mvp, scope, product, phase-1]
sources: [raw/prompt.md]
related: [user-roles, implementation-roadmap, risk-tradeoff-analysis]
status: final
phase: 1
lead: Agent 1 (Product Strategist)
---

# MVP Scope Definition

## Executive Summary

This project delivers a **portfolio management platform** with two experiences:

1. **Admin Portal** — a private, authenticated interface for managing stock holdings, refreshing market data, comparing performance against the S&P 500, and controlling what is publicly visible.
2. **Public Portfolio Page** — a read-only page for external visitors showing portfolio composition (by weight, never quantity), performance vs. benchmark, and methodology disclosures.

The MVP prioritizes **accuracy, security, and professional presentation** over feature breadth. The system uses **file-based data storage** (markdown/JSON in a `data/` directory), **Alpha Vantage** for market data, and is designed for **GitHub-native deployment**.

## Product Vision

Build a trustworthy, professional portfolio management tool that:
- Gives the portfolio owner full control over holdings data and public visibility
- Presents portfolio performance against the S&P 500 benchmark with mathematical accuracy
- Protects sensitive data (quantities, cost basis) from public exposure
- Remains simple to maintain, deploy, and extend as a single-developer MVP

## MVP Features (Must-Have)

### Admin Portal

| # | Feature | Description |
|---|---------|-------------|
| A1 | Secure Login | Authentication gate for all admin routes |
| A2 | Dashboard Summary | Total value, gain/loss, daily change, benchmark summary, holdings count, last refresh timestamp |
| A3 | Holdings CRUD | Add, edit, archive, delete holdings with all required fields |
| A4 | Visibility Toggle | Per-holding control of public visibility |
| A5 | Display Order | Reorder holdings for public page display |
| A6 | Market Data Refresh | Trigger Alpha Vantage data fetch with rate-limit awareness |
| A7 | Performance Page | Portfolio return chart, benchmark chart, relative performance, date range filters |
| A8 | Settings Page | Portfolio title, subtitle, description, disclaimer, benchmark, public visibility, SEO metadata |
| A9 | Public Preview | Preview exactly what visitors will see (desktop and mobile) |
| A10 | Publish/Unpublish | Control whether the public page is accessible |
| A11 | Holdings Table | Searchable, sortable, filterable table with pagination (20+ rows) |
| A12 | Add/Edit Form | Professional form with validation, error handling, save/cancel |

### Public Portfolio Page

| # | Feature | Description |
|---|---------|-------------|
| P1 | Header/Hero | Portfolio title, description, return summary, last updated, disclaimer |
| P2 | Portfolio Overview | Total value, total return, holdings count, top holdings, allocation summary |
| P3 | Holdings Table | Ticker, company, weight (%), market value, gain/loss, notes; pagination for 20+ rows |
| P4 | Performance Section | Portfolio vs S&P 500 chart, date range selector, performance summary |
| P5 | Methodology/Disclosure | Data source, return calculation summary, update logic, disclaimer |

### Data & Integration

| # | Feature | Description |
|---|---------|-------------|
| D1 | Alpha Vantage Integration | Symbol validation, current price, historical prices, rate-limit handling |
| D2 | File-Based Storage | Holdings, settings, cache, benchmark, audit data in `data/` directory |
| D3 | Caching Layer | Cache Alpha Vantage responses; serve cached data when possible |
| D4 | Benchmark Comparison | S&P 500 (via SPY proxy) comparison over aligned time ranges |
| D5 | Return Calculations | Market value, gain/loss, allocation %, cumulative returns, relative performance |

### Cross-Cutting

| # | Feature | Description |
|---|---------|-------------|
| X1 | Security | Auth on admin routes, read-only public routes, API key protection, hidden holdings enforcement |
| X2 | Accessibility | Keyboard navigation, focus states, contrast, semantic markup, chart fallback text |
| X3 | Responsive Layout | Desktop-first with mobile support |

## Non-MVP Features (Future)

| Feature | Rationale for Deferral |
|---------|----------------------|
| Multi-user support | MVP is single-owner; auth covers one admin user |
| Real-time price streaming | Alpha Vantage free tier does not support WebSocket; manual refresh is sufficient |
| Transaction history / trade log | Holdings track current state; trade history adds complexity without core value |
| Multiple portfolios | Single portfolio is sufficient for MVP |
| Export to CSV/PDF | Nice-to-have; not core to portfolio management |
| Email/push notifications | No alerting needed for MVP |
| Advanced charting (candlestick, technical indicators) | Simple line charts suffice for performance comparison |
| Custom benchmarks beyond S&P 500 | SPY proxy covers the primary use case |
| Dark mode | Single theme is sufficient for MVP |
| Internationalization | English-only for MVP |
| Social sharing | Not aligned with privacy-first approach |
| Mobile native app | Responsive web is sufficient |
| Dividend tracking | Adds significant complexity; defer to v2 |
| Tax lot tracking | Requires transaction history; defer to v2 |

## Assumptions

1. **Single admin user** — only one person manages the portfolio
2. **Alpha Vantage free tier** — 25 requests/day limit drives caching strategy
3. **Private GitHub repository** — portfolio data stored in repo is acceptable
4. **GitHub-based deployment** — CI/CD via GitHub Actions
5. **File-based persistence is sufficient** — holdings count will remain under ~100 for MVP
6. **SPY is an acceptable S&P 500 proxy** — ETF tracks the index closely enough for comparison
7. **No real-time requirements** — data can be up to 24 hours stale on trading days
8. **Desktop-first usage** — admin primarily uses desktop; public page should be responsive
9. **English only** — no internationalization needed
10. **Simple authentication** — no OAuth/SSO; a straightforward auth mechanism is acceptable

## Scope Boundaries

- **In scope**: Everything listed in MVP Features above
- **Out of scope**: Everything listed in Non-MVP Features above
- **Boundary condition**: If holdings exceed ~100, Agent 3 should evaluate whether file-based storage remains viable and document findings in ADR-004
- **Boundary condition**: If Alpha Vantage free tier is too restrictive, Agent 5 should document alternatives in the integration spec
