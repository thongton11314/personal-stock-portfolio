---
title: "Public Page UX Specification"
type: module
created: 2026-04-14
updated: 2026-04-14
tags: [public, ux, ui, pages, phase-2]
sources: [raw/prompt.md]
related: [mvp-scope, user-roles, design-system, information-architecture, admin-portal]
status: final
phase: 2
lead: Agent 2 (UX/UI Designer)
---

# Public Page UX Specification

## Layout Structure

Single-page layout with vertical scrolling sections. No sidebar. Fixed header with portfolio title and section navigation. Clean, read-only, professional.

Max content width: 1200px, centered. Generous vertical spacing between sections.

---

## Section 1: Header / Hero

### Layout
```
[Full-width section, --color-bg-secondary background]

[Portfolio Title]           (H1, 28px, bold)
[Subtitle]                  (18px, --color-text-secondary)

[Return Summary]
| Total Return: +XX.X%  |  YTD: +X.X%  |  vs S&P 500: +X.X%  |

[Last Updated: Apr 14, 2026]
[Disclaimer text if configured]
```

### Content
- Portfolio title and subtitle from settings
- Return summary: 3 key metrics inline
- Last updated timestamp
- Optional disclaimer (from settings)
- All metrics color-coded: green for positive, red for negative

### States
- **Loading**: Skeleton text blocks
- **Error**: "Portfolio data is temporarily unavailable."

---

## Section 2: Portfolio Overview

### Layout
```
[Section Title: "Portfolio Overview"]

[Metric Cards Row]
| Total Value     | Total Return  | Holdings Count |
| $XXX,XXX.XX    | +XX.X%        | XX             |

[Top Holdings]
| Top 5 holdings by weight, horizontal bar chart or list |

[Allocation Summary]
| Sector allocation pie/donut chart or breakdown list    |
```

### Content
- **Total Value**: sum of all visible holdings market values
- **Total Return**: overall portfolio percentage return
- **Holdings Count**: number of publicly visible holdings
- **Top Holdings**: top 5 by allocation weight
- **Allocation**: by sector, shown as proportional bars or list

### States
- **Loading**: Skeleton cards and chart placeholders
- **Empty**: Should not occur if page is published (settings enforce at least one visible holding)

---

## Section 3: Holdings Table

### Layout
```
[Section Title: "Holdings"]

[Holdings Table]
| Ticker | Company Name | Sector | Weight  | Market Value | Gain/Loss  |
| AAPL   | Apple Inc    | Tech   | 25.3%   | $12,345      | +$1,234    |
| MSFT   | Microsoft    | Tech   | 20.1%   | $9,876       | +$876      |
...

[Show All / Pagination for 20+ holdings]
```

### Table Features
- Sorted by display order (as set by admin)
- Columns: Ticker, Company Name, Sector, Weight (%), Market Value ($), Gain/Loss ($, colored)
- **Quantity is NEVER shown** — this is a hard security requirement
- Only holdings marked as public and active are displayed
- If notes are enabled for a holding, show as expandable row detail

### Pagination (20+ holdings)
- Default: show first 20 rows
- "Show all holdings" toggle below table
- Alternatively, paginated: 20 per page with page controls

### States
- **Loading**: Table skeleton (5 placeholder rows)
- **No visible holdings**: "No holdings to display."

---

## Section 4: Performance

### Layout
```
[Section Title: "Performance"]

[Date Range Selector]
| [1M] [3M] [6M] [YTD] [1Y] [All] |

[Performance Chart]
| Line chart: Portfolio (blue solid) vs S&P 500 (gray dashed)     |
| X-axis: dates                                                     |
| Y-axis: cumulative return (%)                                     |
| Legend: Portfolio Return, S&P 500 Return                          |

[Performance Summary]
| Portfolio Return: +XX.X% | S&P 500 Return: +XX.X% | Relative: +X.X% |

[Accessibility Fallback]
| Text summary: "Over the selected period, the portfolio returned   |
|  XX.X% compared to the S&P 500 at XX.X%."                        |
```

### Date Range
- Default: "All" (from earliest visible holding purchase date)
- Presets: 1M, 3M, 6M, YTD, 1Y, All
- No custom date picker on public page (simplicity)

### Chart
- Two-line chart with shared x-axis
- Portfolio: solid blue (`--color-chart-portfolio`)
- S&P 500: dashed gray (`--color-chart-benchmark`)
- Tooltip on hover: date + both values
- Responsive chart sizing
- `aria-label` with text summary for screen readers

### States
- **Loading**: Chart skeleton
- **Insufficient data**: "Performance data requires trading history."
- **Error**: "Performance data is temporarily unavailable."

---

## Section 5: Methodology & Disclosure

### Layout
```
[Section Title: "Methodology"]

[Content Card]
Data Source:
  Market data provided by Alpha Vantage. Prices are delayed...

Return Calculation:
  Returns are calculated using time-weighted methodology...

Update Schedule:
  Portfolio data is refreshed manually by the portfolio manager...

Disclaimer:
  This portfolio page is for informational purposes only...
```

### Content
- Data source attribution (Alpha Vantage)
- Return calculation summary (plain language)
- Update schedule and data freshness explanation
- Financial disclaimer (from settings)
- All text is static content configured by admin in settings

### States
- **Default**: Always shown when published
- **Loading**: Text skeleton

---

## Unpublished State

When the portfolio is unpublished, the public URL returns:
- HTTP 404 status code
- Simple "Page not found" message
- No indication that a portfolio exists
- No link to admin login

---

## Responsive Behavior

### Desktop (>= 1024px)
- Full-width sections with 1200px max content
- Metric cards in horizontal row (3-4 per row)
- Charts at full width
- Holdings table with all columns

### Tablet (768px - 1023px)
- Metric cards: 2 per row
- Charts: full width
- Holdings table: horizontal scroll if needed

### Mobile (< 768px)
- Metric cards: stacked (1 per row)
- Charts: full width, simplified tooltips
- Holdings table: card view (stacked key/value pairs per holding)
- Performance presets: horizontal scroll
- Section nav: hamburger or scroll-based

---

## Accessibility Requirements

- Semantic HTML: `<main>`, `<nav>`, `<section>`, `<table>`, `<thead>`, `<th scope>`
- Heading hierarchy: H1 (title), H2 (sections), H3 (subsections)
- All charts have `aria-label` with text equivalent
- Color is not the only indicator (gain/loss uses + / - prefix in addition to color)
- Focus styles visible on all interactive elements (date range buttons)
- Skip-to-content link at top
- Sufficient color contrast (WCAG AA: 4.5:1 text, 3:1 large text)
- Tables use `<caption>` element
