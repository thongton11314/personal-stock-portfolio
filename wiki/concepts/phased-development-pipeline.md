---
title: "Phased Development Pipeline"
type: concept
created: 2026-04-14
updated: 2026-04-14
tags: [pipeline, phases, quality-gates, development-process]
sources: [framework-template.md]
related: [multi-agent-orchestration, framework-template]
status: active
---

# Phased Development Pipeline

An 8-phase sequential development process where each phase has a lead agent, contributing agents, reviewers, explicit deliverables, wiki outputs, and a quality gate.

## Phases

### Phase 1 — Product and Scope
- **Lead**: Product Strategist
- **Deliverables**: Executive summary, product vision, user roles, MVP scope
- **Gate**: Every feature classified MVP/future, assumptions explicit, scope confirmed designable and testable

### Phase 2 — UX and Design
- **Lead**: UX/UI Designer
- **Deliverables**: Information architecture, user flows, page UX specs, design system
- **Gate**: Every page has layout + empty/loading/error states, flows have happy + error paths

### Phase 3 — Technical Architecture
- **Lead**: Solution Architect
- **Deliverables**: System architecture, tech stack, frontend/backend architecture, data schema, API routes
- **Gate**: Architecture supports all UX flows, security boundaries defined, tech stack scored on 10 criteria

### Phase 4 — Data and Integration
- **Lead**: Data/API Integration Designer
- **Deliverables**: External API integration design, domain calculation methodology
- **Gate**: Handles rate limits/missing data/edge cases, calculations defined with examples

### Phase 5 — Security, Quality, and Operations
- **Lead**: QA/Test Engineer
- **Deliverables**: Security model, test strategy, test scenarios, accessibility guidance, deployment plan
- **Gate**: Security covers all requirements, test plan covers critical paths

### Phase 6 — Roadmap and Implementation Planning
- **Lead**: Product Strategist
- **Deliverables**: Delivery roadmap, risk register, final implementation recommendation
- **Gate**: Roadmap references concrete wiki artifacts, all agents sign off

### Phase 7 — Implementation and Visual Validation
- **Lead**: Full-Stack Engineer
- **Model**: Iterative Build-Test-Fix cycles (not single pass)
- **Gate**: All features implemented, unit tests pass, visual verification complete, no console errors

### Phase 8 — Documentation and README
- **Lead**: Full-Stack Engineer
- **Deliverables**: README.md with 19 required sections, 7+ Mermaid diagrams
- **Gate**: All sections present, diagrams match implementation, instructions testable

## Review Matrix

Each phase has designated cross-validators:
- Phase 1 → Agents 2, 6
- Phase 2 → Agents 1, 3
- Phase 3 → Agents 2, 5, 6
- Phase 4 → Agents 3, 6
- Phase 5 → Agents 3, 1
- Phase 6 → All agents
- Phase 7 → Agents 7, 6, 3, 2
- Phase 8 → Agents 1, 3

## Review Verdicts

- **PASS** — deliverable accepted
- **PASS WITH NOTES** — accepted with advisory items
- **REVISE** — must address feedback (max 3 revision cycles, then escalate to user)

(Source: [[framework-template]])
