---
title: "Risk and Tradeoff Analysis"
type: analysis
created: 2026-04-14
updated: 2026-04-14
tags: [risk, tradeoffs, analysis, phase-6]
sources: [raw/prompt.md]
related: [mvp-scope, implementation-roadmap]
status: final
phase: 6
lead: Agent 1 (Product Strategist)
---

# Risk and Tradeoff Analysis

## Key Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|:-----------:|:------:|-----------|
| R1 | Alpha Vantage free tier too restrictive (25 req/day) | Medium | High | Aggressive caching (24h TTL), batch refresh with delays, consider paid tier if needed |
| R2 | File-based storage performance at scale | Low | Medium | MVP targets < 100 holdings; in-memory caching of file listings; ADR-004 evaluates limits |
| R3 | JWT in localStorage XSS vulnerability | Low | High | CSP headers, React auto-escaping, input sanitization, single-user reduces attack surface |
| R4 | Quantity data leakage in public API | Low | Critical | Server-side field exclusion (not just UI hiding), automated test verification, code review |
| R5 | Return calculation accuracy errors | Medium | High | Manual spreadsheet verification, automated test cases with known values, +/- 0.01% tolerance |
| R6 | Alpha Vantage API changes or deprecation | Low | High | Abstracted service layer; swap provider without changing business logic |
| R7 | Single developer bus factor | High | Medium | Comprehensive wiki documentation, clear conventions, all specs persisted |

## Key Tradeoffs Made

| Tradeoff | Choice | Rationale |
|----------|--------|-----------|
| File-based vs database | File-based | Simplicity, GitHub-native, no infra; sufficient for < 100 holdings |
| JWT vs sessions | JWT | Stateless, no session store; XSS risk mitigated by CSP |
| Custom CSS vs UI framework | Custom CSS | Full aesthetic control for financial-style design; minimal bundle |
| Price returns vs total returns | Price returns only | Dividend reinvestment adds significant complexity; documented as limitation |
| SPY vs S&P 500 index directly | SPY proxy | Same Alpha Vantage API; < 0.1% tracking error; documented in methodology |
| Manual refresh vs auto-refresh | Manual | Preserves API budget; user controls when data is updated |
| Single-page app vs server-rendered | SPA | Simpler deployment (one server); admin portal benefits from SPA UX |
