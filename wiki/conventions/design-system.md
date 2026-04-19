---
title: "Design System"
type: convention
created: 2026-04-14
updated: 2026-04-14
tags: [design, ui, styling, components, phase-2]
sources: [raw/prompt.md]
related: [admin-portal, public-page, information-architecture]
status: final
phase: 2
lead: Agent 2 (UX/UI Designer)
---

# Design System

## Visual Direction

- Clean, minimal, professional
- Financial-dashboard style
- Neutral and serious
- Desktop-first, responsive
- No emoji, no decorative icons
- Trustworthiness and clarity above all

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-bg-secondary` | `#F8F9FA` | Card backgrounds, sidebar |
| `--color-bg-tertiary` | `#F1F3F5` | Table header, hover states |
| `--color-text` | `#212529` | Primary text |
| `--color-text-secondary` | `#6C757D` | Secondary text, labels |
| `--color-text-muted` | `#ADB5BD` | Disabled text, placeholders |
| `--color-border` | `#DEE2E6` | Borders, dividers |
| `--color-primary` | `#2563EB` | Primary actions, links |
| `--color-primary-hover` | `#1D4ED8` | Primary hover |
| `--color-success` | `#16A34A` | Positive gain, success states |
| `--color-danger` | `#DC2626` | Negative loss, errors, destructive actions |
| `--color-warning` | `#D97706` | Warnings, caution states |
| `--color-chart-portfolio` | `#2563EB` | Portfolio line on charts |
| `--color-chart-benchmark` | `#9CA3AF` | Benchmark line on charts |

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Body | Inter, system-ui, sans-serif | 14px | 400 |
| H1 (page title) | Inter | 24px | 600 |
| H2 (section) | Inter | 20px | 600 |
| H3 (subsection) | Inter | 16px | 600 |
| Table header | Inter | 13px | 600 |
| Table cell | Inter | 14px | 400 |
| Label | Inter | 12px | 500 |
| Button | Inter | 14px | 500 |
| Metric value | Inter | 28px | 700 |
| Metric label | Inter | 12px | 400 |

## Spacing Scale

Base unit: 4px. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Tight spacing, icon gaps |
| `--space-sm` | 8px | Compact element spacing |
| `--space-md` | 16px | Standard padding, gaps |
| `--space-lg` | 24px | Section spacing |
| `--space-xl` | 32px | Major section spacing |
| `--space-2xl` | 48px | Page-level spacing |

## Border & Shadow

| Token | Value |
|-------|-------|
| `--radius-sm` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` |

## Component Patterns

### Cards
- Background: `--color-bg`
- Border: 1px solid `--color-border`
- Border-radius: `--radius-md`
- Padding: `--space-lg`
- Shadow: `--shadow-sm`

### Metric Cards (Dashboard)
- Layout: horizontal row of cards
- Each card: metric value (large, bold) + label (small, secondary)
- Gain/loss: color-coded green/red

### Tables
- Header: `--color-bg-tertiary`, uppercase label text, 13px
- Rows: alternating white / `--color-bg-secondary`
- Hover: `--color-bg-tertiary`
- Border: bottom border on each row
- Numeric columns: right-aligned
- Sortable columns: show sort indicator

### Forms
- Label above input
- Input: full-width, 40px height, `--radius-sm` border
- Focus: 2px `--color-primary` outline
- Error: red border + error message below input
- Buttons: right-aligned in form footer

### Buttons
- Primary: `--color-primary` background, white text, `--radius-sm`
- Secondary: white background, `--color-primary` text, border
- Danger: `--color-danger` background, white text
- Disabled: 50% opacity, no pointer events
- Height: 40px, padding: 0 16px

### Navigation (Admin Sidebar)
- Width: 240px
- Background: `--color-bg-secondary`
- Active item: `--color-primary` left border + `--color-primary` text
- Hover: `--color-bg-tertiary`

### Charts
- Line chart for performance comparison
- Portfolio line: `--color-chart-portfolio` (solid)
- Benchmark line: `--color-chart-benchmark` (dashed)
- Grid lines: `--color-border`
- Axis labels: `--color-text-secondary`
- Tooltip on hover with date and values

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Desktop | >= 1024px | Full sidebar + content layout |
| Tablet | 768px - 1023px | Collapsed sidebar (hamburger) |
| Mobile | < 768px | Stacked layout, full-width content |

## States

Every interactive element must define these states:
- **Default**: normal appearance
- **Hover**: subtle visual feedback
- **Focus**: visible focus ring for keyboard navigation
- **Active/Pressed**: pressed visual feedback
- **Disabled**: reduced opacity, no pointer events
- **Loading**: skeleton or spinner placeholder
- **Empty**: meaningful empty-state message with optional action
- **Error**: error message with guidance to resolve
