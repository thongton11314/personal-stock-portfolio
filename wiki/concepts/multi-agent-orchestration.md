---
title: "Multi-Agent Orchestration"
type: concept
created: 2026-04-14
updated: 2026-04-14
tags: [agents, orchestration, collaboration, pipeline]
sources: [framework-template.md]
related: [phased-development-pipeline, framework-template]
status: active
---

# Multi-Agent Orchestration

A software development pattern where multiple specialized AI agents collaborate through defined contracts, handoffs, and review loops to design and build applications.

## Core Principles

- **Separation of concerns** — each agent has a specific role (design, architecture, implementation, testing) and only operates within its scope.
- **Explicit contracts** — every agent has defined inputs, outputs, tools, and quality gates.
- **Wiki as single source of truth** — all deliverables are wiki artifacts, not ephemeral chat.
- **Phase gates** — work proceeds sequentially; no phase starts until the prior phase passes its quality gate.
- **Cross-validation** — an inter-agent review matrix ensures each agent's output is validated by other agents with relevant expertise.

## Agent Roles

The orchestration system defines eight agents:

- **Agent 0 (Orchestrator)** — coordinates all agents, routes work, enforces phase gates, resolves conflicts.
- **Agent 1 (Product Strategist)** — defines scope, priorities, tradeoffs, roadmap, and risk.
- **Agent 2 (UX/UI Designer)** — designs layouts, flows, states, accessibility, and visual direction.
- **Agent 3 (Solution Architect)** — defines system design, APIs, security, deployment architecture.
- **Agent 4 (Full-Stack Engineer)** — implements code based on specs from other agents.
- **Agent 5 (Data/API Integration Designer)** — designs external API integrations and domain calculations.
- **Agent 6 (QA/Test Engineer)** — defines test strategy, validates quality, assesses release readiness.
- **Agent 7 (Visual Test Agent)** — browser-based visual testing, interaction validation, accessibility audits.

## Conflict Resolution

When two agents disagree:
1. Both agents state their position with rationale (POSITION, RATIONALE, TRADEOFFS, RECOMMENDATION).
2. Orchestrator evaluates against project principles and MVP scope.
3. If clear from principles → Orchestrator decides and records an ADR.
4. If ambiguous → Orchestrator escalates to the user with both positions.

## Continuous Documentation

Wiki updates are mandatory at every state transition — not just phase boundaries. Ten event types trigger updates (deliverable produced, review submitted, revision made, phase completed, feature implemented, bug found/fixed, feature verified, spec amended, conflict resolved).

(Source: [[framework-template]])
