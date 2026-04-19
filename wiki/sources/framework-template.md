---
title: "Agentic Orchestration Framework Template"
type: source
created: 2026-04-14
updated: 2026-04-14
tags: [agents, orchestration, template, multi-agent, phased-pipeline]
sources: [framework-template.md]
related: [multi-agent-orchestration, phased-development-pipeline]
status: active
---

# Agentic Orchestration Framework Template

**Source file**: `framework-template.md`

## Summary

A reusable specification template that defines a multi-agent orchestration system for designing, specifying, and building applications. Eight agents collaborate through an 8-phase pipeline with explicit contracts, handoffs, review loops, and quality gates.

Built as an extension of the AI Development Framework (`AGENTS.md`), this template provides the project-specific layer that turns the generic wiki system into a full agentic development pipeline.

## Key Claims

- Eight specialized agents (Orchestrator, Product Strategist, UX/UI Designer, Solution Architect, Full-Stack Engineer, Data/API Integration Designer, QA/Test Engineer, Visual Test Agent) collaborate through defined contracts.
- Work proceeds through 8 sequential phases, each with a quality gate that must pass before the next phase starts.
- Every phase produces wiki artifacts — the wiki is the single source of truth, not chat.
- Inter-agent review matrix ensures cross-validation (e.g., architect reviews UX feasibility, QA reviews testability).
- Conflict resolution protocol: agents state positions with rationale, Orchestrator resolves via project principles or escalates to user.
- Continuous documentation protocol requires wiki updates at every state transition, not just phase boundaries.
- Tech stack selection requires a scored evaluation matrix across 10 criteria.
- Phase 7 operates in iterative Build-Test-Fix cycles with visual verification via browser automation.
- Template uses `{PLACEHOLDER}` tokens — users replace them with project-specific values.

## The Eight Agents

| # | Agent | Role |
|---|-------|------|
| 0 | Orchestrator | Coordinates all agents, routes work, enforces phase gates |
| 1 | Product Strategist | Scope, priorities, tradeoffs, roadmap, risk |
| 2 | UX/UI Designer | Layouts, flows, states, accessibility, visual direction |
| 3 | Solution Architect | System design, APIs, security, deployment architecture |
| 4 | Full-Stack Engineer | Code implementation based on specs |
| 5 | Data/API Integration Designer | External API integrations, domain calculations |
| 6 | QA/Test Engineer | Test strategy, quality validation, release readiness |
| 7 | Visual Test Agent | Browser-based visual testing and interaction validation |

## The Eight Phases

| Phase | Name | Lead Agent |
|-------|------|-----------|
| 1 | Product and Scope | Agent 1 |
| 2 | UX and Design | Agent 2 |
| 3 | Technical Architecture | Agent 3 |
| 4 | Data and Integration | Agent 5 |
| 5 | Security, Quality, and Operations | Agent 6 |
| 6 | Roadmap and Implementation Planning | Agent 1 |
| 7 | Implementation and Visual Validation | Agent 4 |
| 8 | Documentation and README | Agent 4 |

## Template Structure

The template has 11 sections plus an appendix:
- **[FRAMEWORK]** sections are reusable as-is for any project.
- **[CUSTOMIZE]** sections require domain-specific content.

## Relevance

Extends the base [[multi-agent-orchestration]] pattern into a concrete, actionable template. Depends on the AI Development Framework for persistent context via the wiki system.

(Source: [[framework-template]])
