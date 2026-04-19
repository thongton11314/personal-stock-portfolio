---
title: "Wiki Index"
type: overview
created: 2026-04-13
updated: 2026-04-15
tags: [index, navigation]
sources: []
status: active
---

# Wiki Index

Master catalog of all pages in this wiki. Updated on every operation.

---

## Sources

| Page | Summary | Tags | Updated |
|------|---------|------|---------|
| [[rest-api-design-best-practices]] | REST API conventions: URLs, methods, errors, pagination, versioning | api, rest, design | 2026-04-13 |
| [[framework-template]] | Multi-agent orchestration template — 8 agents, 8 phases, quality gates | agents, orchestration, template | 2026-04-14 |

## Entities

| Page | Summary | Sources | Updated |
|------|---------|---------|---------|
| [[sarah-chen]] | Author of REST API Design Best Practices | 1 | 2026-04-13 |

## Concepts

| Page | Summary | Sources | Updated |
|------|---------|---------|---------|
| [[rest]] | Architectural style for web APIs — stateless, resource-oriented | 1 | 2026-04-13 |
| [[api-design-patterns]] | Error handling, pagination, versioning, auth, rate limiting | 1 | 2026-04-13 |
| [[http-status-codes]] | Standard HTTP status codes and when to use them | 1 | 2026-04-13 |
| [[multi-agent-orchestration]] | Pattern for specialized AI agents collaborating through contracts and review loops | 1 | 2026-04-14 |
| [[user-roles]] | Portfolio Admin and Public Visitor — roles, access, data visibility matrix | 1 | 2026-04-14 |
| [[phased-development-pipeline]] | 8-phase sequential process with quality gates and cross-agent reviews | 1 | 2026-04-14 |
| [[return-calculations]] | Holding-level and portfolio-level return formulas with examples | 1 | 2026-04-14 |
| [[benchmark-methodology]] | SPY proxy methodology, limitations, and disclosures | 1 | 2026-04-14 |

## Analyses

| Page | Summary | Sources | Updated |
|------|---------|---------|---------|
| [[mvp-scope]] | MVP scope definition — features in/out, assumptions, boundaries | 1 | 2026-04-14 |
| [[implementation-roadmap]] | 8-batch implementation plan in dependency order | 1 | 2026-04-14 |
| [[risk-tradeoff-analysis]] | 7 risks with mitigations, 7 key tradeoffs | 1 | 2026-04-14 |

## Architecture

| Page | Summary | Related | Updated |
|------|---------|---------|---------|
| [[information-architecture]] | Sitemap, navigation structure, admin and public user flow diagrams | 4 | 2026-04-15 |
| [[system-architecture]] | React + Express + file-based JSON, architecture diagram, request flow | 5 | 2026-04-14 |
| [[data-storage-schema]] | JSON file layout, schemas, read/write patterns, cache management | 3 | 2026-04-14 |
| [[api-routes]] | All REST API routes with request/response contracts | 4 | 2026-04-15 |
| [[security-model]] | Auth matrix, data protection, threat model, security headers | 3 | 2026-04-14 |
| [[deployment]] | CI/CD pipeline, env vars, hosting options | 2 | 2026-04-14 |

## Modules

| Page | Summary | Dependencies | Updated |
|------|---------|-------------|---------|
| [[admin-portal]] | UX spec for all 9 admin pages — layout, states, validation, flows | 3 | 2026-04-15 |
| [[public-page]] | UX spec for 5 public sections — hero, overview, holdings, performance, methodology | 3 | 2026-04-14 |
| [[frontend]] | React 18 + Vite + TypeScript frontend architecture, routing, directory structure | 4 | 2026-04-15 |
| [[backend]] | Express 4 + TypeScript backend architecture, middleware stack, services | 4 | 2026-04-15 |
| [[alpha-vantage-service]] | Alpha Vantage integration design with rate-limit strategy and caching | 3 | 2026-04-14 |
| [[benchmark-engine]] | Benchmark engine using SPY proxy with date alignment logic | 2 | 2026-04-14 |

## Decisions

| Page | Summary | Status | Updated |
|------|---------|--------|---------|
| [[adr-001-mvp-scope-boundaries]] | MVP scope — core portfolio + public page, defer advanced features | active | 2026-04-14 |
| [[adr-002-design-system]] | Custom CSS with design tokens, no UI framework | active | 2026-04-14 |
| [[adr-003-tech-stack]] | React + Express + TypeScript, scored evaluation matrix | active | 2026-04-14 |
| [[adr-004-data-storage]] | JSON files for holdings/settings, markdown for audit logs | active | 2026-04-14 |
| [[adr-005-auth]] | JWT + bcrypt, single admin user, stateless | active | 2026-04-14 |
| [[adr-006-benchmark-proxy]] | SPY as S&P 500 benchmark proxy | active | 2026-04-14 |

## Conventions

| Page | Summary | Scope | Updated |
|------|---------|-------|---------|
| [[design-system]] | Colors, typography, spacing, components, responsive breakpoints | UI | 2026-04-14 |
| [[coding-conventions]] | TypeScript naming, project structure, imports, testing, git | Code | 2026-04-14 |
| [[testing-conventions]] | Test strategy, critical scenarios, regression priorities, release checklist | QA | 2026-04-14 |
| [[accessibility-standards]] | WCAG 2.1 AA compliance, audit checklist | Accessibility | 2026-04-14 |
