---
title: "ADR-002: Design System and Component Library"
type: decision
created: 2026-04-14
updated: 2026-04-14
tags: [adr, design, ui, components, phase-2]
sources: [raw/prompt.md]
related: [design-system, admin-portal, public-page]
status: active
phase: 2
lead: Agent 2 (UX/UI Designer)
---

# ADR-002: Design System and Component Library Choice

## Context

The portfolio platform needs a consistent visual language across admin and public pages. The choice of component library affects development speed, visual consistency, and bundle size.

## Options Considered

### Option A: Custom CSS with CSS Variables (Selected)
- Build a lightweight design system using CSS custom properties.
- **Pro**: Full control, minimal bundle, no dependency risk, matches the professional/minimal aesthetic.
- **Con**: More upfront styling work, no pre-built complex components.

### Option B: Tailwind CSS
- Utility-first CSS framework.
- **Pro**: Rapid prototyping, consistent spacing/sizing.
- **Con**: Verbose class names, learning curve, can lead to inconsistent patterns without discipline.

### Option C: Material UI / Ant Design / Chakra
- Full component libraries.
- **Pro**: Pre-built components, fast development.
- **Con**: Opinionated design may conflict with the desired minimal/financial aesthetic. Large bundle size. Over-engineering for MVP scope.

## Decision

**Option A** — Custom CSS with CSS variables, supplemented by a small design token system.

The design system defines tokens for colors, typography, spacing, and shadows. Components (cards, tables, forms, buttons, navigation) are implemented as semantic HTML with scoped CSS. This keeps the bundle minimal, gives full aesthetic control, and avoids framework lock-in.

The charting library (evaluated in ADR-003) provides chart components. All other UI elements are custom-built.

## Consequences

- **Positive**: Full aesthetic control for a financial-style professional look.
- **Positive**: Minimal bundle size, fast load times.
- **Positive**: No external UI library dependency.
- **Risk**: Slightly more CSS writing work. Mitigated by a small, well-defined token set.
- **Follow-up**: Agent 3 selects the charting library as part of tech stack (ADR-003).
