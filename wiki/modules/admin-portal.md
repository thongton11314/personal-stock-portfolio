---
title: "Admin Portal UX Specification"
type: module
created: 2026-04-14
updated: 2026-04-15
tags: [admin, ux, ui, pages, phase-2]
sources: [raw/prompt.md]
related: [mvp-scope, user-roles, design-system, information-architecture, public-page]
status: active
phase: 2
lead: Agent 2 (UX/UI Designer)
---

# Admin Portal UX Specification

## Layout Structure

All admin pages share a common layout:
- **Sidebar** (240px, left): Navigation menu with logo, nav items, logout
- **Content area** (remaining width): Page-specific content
- **Top bar** (within content area): Page title + context actions

---

## Page 1: Login (`/login`)

### Layout
- Centered card (400px max-width) on a neutral background
- Portfolio title above the form
- Username and password fields
- "Sign In" primary button
- No "forgot password" or "register" for MVP (single admin)

### States
- **Default**: Empty form
- **Loading**: Button shows spinner, inputs disabled
- **Error**: Red border on invalid field, error message below form ("Invalid credentials")
- **Success**: Redirect to dashboard

### Validation
- Username: required, non-empty
- Password: required, non-empty
- Server-side: credential verification

---

## Page 2: Dashboard (`/admin`)

### Layout
```
[Top Bar: "Dashboard" | Refresh Data Button]
--------------------------------------------------
[Metric Card Row]
| Total Value    | Total Gain/Loss | Daily Change | Holdings Count |

[Benchmark Summary Card]
| Portfolio Return | S&P 500 Return | Relative Performance |

[Quick Actions Card]
| Add Holding | View Public Page | Manage Settings |

[Last Refresh Timestamp: "Market data as of Apr 14, 2026 4:00 PM ET"]
```

### Metric Cards
- **Total Value**: formatted as currency ($XX,XXX.XX)
- **Total Gain/Loss**: currency + percentage, color-coded green/red
- **Daily Change**: currency + percentage, color-coded
- **Holdings Count**: integer (active holdings only)

### States
- **Loading**: Skeleton cards
- **Empty**: "No holdings yet. Add your first holding to get started." with Add Holding button
- **Error**: "Unable to load market data. Last known data from [date]." with Retry button
- **Stale data**: Warning banner: "Market data is more than 24 hours old. Refresh to update."

---

## Page 3: Holdings Management (`/admin/holdings`)

### Layout
```
[Top Bar: "Holdings" | Add Holding Button]
--------------------------------------------------
[Filter Bar]
| Search: [text input] | Status: [dropdown] | Sector: [dropdown] | Visibility: [dropdown] |

[Holdings Table]
| Ticker | Company | Sector | Market Value | Gain/Loss | Weight | Visibility | Actions |
| AAPL   | Apple    | Tech   | $12,345     | +$1,234   | 25.3%  | [toggle]   | [edit] [archive] |
...
[Pagination: < 1 2 3 ... >]
```

### Table Features
- Sortable by any column (click header)
- Sort indicator (arrow up/down)
- Default sort: display order
- Pagination: 20 rows per page
- Row hover highlight

### Filter Bar
- Search: filters by ticker or company name (client-side)
- Status: All / Active / Archived
- Sector: All / [dynamic from holdings]
- Visibility: All / Public / Hidden

### Row Actions
- **Edit**: navigates to edit form
- **Archive**: confirmation dialog -> archives holding
- **Delete**: confirmation dialog ("This action cannot be undone.") -> deletes holding
- **Visibility toggle**: inline toggle switch, immediate save

### Bulk Actions (optional MVP enhancement)
- Select multiple rows via checkboxes
- Bulk visibility toggle
- Bulk archive

### States
- **Loading**: Table skeleton (5 placeholder rows)
- **Empty**: "No holdings found. Add your first holding." with Add Holding button
- **Empty (filtered)**: "No holdings match your filters." with Clear Filters link
- **Error**: "Unable to load holdings. Please try again." with Retry button

---

## Page 4: Add Holding Form (`/admin/holdings/new`)

### Layout
```
[Top Bar: "Add Holding" | Cancel Button]
--------------------------------------------------
[Form Card]

Ticker *           [text input with symbol validation]
Company Name *     [text input, auto-filled after ticker validation]
Asset Type *       [dropdown: Stock, ETF, Mutual Fund, Bond, Other]
Quantity *         [number input, min 0.0001]
Average Cost *     [currency input]
Purchase Date *    [date picker]
Sector             [dropdown: Technology, Healthcare, Finance, ...]
Notes              [textarea, 500 char max]
Public Visibility  [toggle switch, default: visible]
Display Order      [number input, default: next available]

[Footer: Cancel (secondary) | Save Holding (primary)]
```

### Validation Rules
- **Ticker**: required, uppercase letters only, validated against Alpha Vantage
- **Company Name**: required, auto-populated from Alpha Vantage; editable
- **Asset Type**: required, select from predefined list
- **Quantity**: required, positive number
- **Average Cost**: required, positive number, 2 decimal places
- **Purchase Date**: required, cannot be future date
- **Sector**: optional
- **Notes**: optional, max 500 characters

### Ticker Validation Flow
1. User types ticker symbol
2. On blur or after 500ms debounce: call Alpha Vantage symbol search
3. If found: auto-fill company name, show green checkmark
4. If not found: show error "Symbol not found. Please verify the ticker."
5. If rate limited: show warning "Unable to validate symbol. You may proceed."

### States
- **Default**: Empty form
- **Validating ticker**: Spinner next to ticker field
- **Validation success**: Green checkmark, company name auto-filled
- **Validation error**: Red border, error message
- **Saving**: Button shows spinner, form disabled
- **Save success**: Redirect to holdings list with success toast
- **Save error**: Error message at top of form

---

## Page 5: Edit Holding Form (`/admin/holdings/:id/edit`)

Same layout as Add Holding with these differences:
- Title: "Edit Holding"
- Fields pre-populated with existing data
- Additional "Archive" and "Delete" buttons in footer
- Delete requires confirmation dialog

---

## Page 6: Performance Page (`/admin/performance`)

### Layout
```
[Top Bar: "Performance"]
--------------------------------------------------
[Date Range Controls]
| Preset: [1M] [3M] [6M] [YTD] [1Y] [All] | Custom: [start date] - [end date] |

[Summary Metrics Row]
| Portfolio Return | S&P 500 Return | Relative Performance | Best Performing | Worst Performing |

[Chart Area]
| Line chart: Portfolio (blue solid) vs S&P 500 (gray dashed)            |
| X-axis: dates, Y-axis: cumulative return (%)                           |
| Tooltip on hover: date, portfolio value, benchmark value, difference   |

[Chart Accessibility Fallback]
| "Portfolio returned X% over the selected period vs S&P 500 at Y%."    |
```

### Date Range
- Default: "All" (from earliest purchase date)
- Presets: 1 Month, 3 Months, 6 Months, Year-to-Date, 1 Year, All
- Custom: date pickers for start and end

### Chart
- Line chart with two series
- Portfolio: solid blue line
- Benchmark: dashed gray line
- Hover tooltip with exact values
- Responsive: chart resizes with container
- Accessibility: alt text / sr-only summary with key metrics

### States
- **Loading**: Chart skeleton placeholder
- **Empty**: "Add holdings with purchase dates to see performance." 
- **Insufficient data**: "Performance requires at least 2 data points."
- **Error**: "Unable to load performance data." with Retry

---

## Page 7: Settings (`/admin/settings`)

### Layout
```
[Top Bar: "Settings" | Save Changes Button]
--------------------------------------------------
[Portfolio Information Card]
Title *              [text input]
Subtitle             [text input]
Description          [textarea]
Disclaimer           [textarea]

[Benchmark Card]
Benchmark Index      [dropdown: S&P 500 (SPY)]

[Public Page Card]
Public Visibility    [toggle: Published / Unpublished]
Public Slug          [text input with URL preview]
SEO Title            [text input]
SEO Description      [textarea, 160 char max]

[Data Refresh Card]
Auto-refresh         [toggle, MVP: manual only]
Last Refresh         [timestamp display]
```

### States
- **Loading**: Form skeleton
- **Default**: Fields populated from saved settings
- **Unsaved changes**: "Save Changes" button becomes primary (highlighted)
- **Saving**: Button spinner
- **Save success**: Success toast "Settings saved."
- **Save error**: Error message

---

## Page 8: Preview & Publish (`/admin/preview`)

### Layout
```
[Top Bar: "Preview" | Publish/Unpublish Button | Desktop/Mobile Toggle]
--------------------------------------------------
[Preview Frame]
| Full-width iframe or embedded render of the public page     |
| Matches the exact output that public visitors would see     |
| Desktop (default) or Mobile (375px centered) preview mode   |
```

### Preview Mechanism
- Rendered as a dedicated route `/admin/preview` with an iframe embedding the public page layout
- The iframe loads the public page component with all current data (including unpublished changes)
- Desktop/Mobile toggle: switches iframe width between 100% and 375px (centered)

### Publish/Unpublish
- **Published state**: Green badge "Published", button reads "Unpublish"
- **Unpublished state**: Gray badge "Unpublished", button reads "Publish"
- **Unpublish action**: Confirmation dialog "Unpublish portfolio? Visitors will see a 404 page."
- **Publish action**: Confirmation dialog "Publish portfolio? It will be visible at [URL]."

### States
- **Loading**: Preview area shows skeleton
- **Preview loaded**: Full public page render
- **Error**: "Unable to load preview." with Retry

---

## Page 9: Transaction History (`/admin/transactions`)

> [!note] Added during Phase 7 implementation. Not in the original Phase 2 UX spec.

### Layout
```
[Top Bar: "Transaction History"]
--------------------------------------------------
[Filter Bar]
| Search: [text input — filters by ticker] |

[Summary Cards Row]
| Total Transactions | Total Invested | Total Sold (if > 0) |

[Transactions Table]
| Date | Ticker | Type | Quantity | Price | Total | Actions |
| 2026-01-15 | AAPL | buy  | 50      | $150  | $7500 | [delete] |
...

[Empty State if no transactions match search]
```

### Features
- Aggregates transactions across all holdings (via `GET /api/admin/holdings/transactions/all`)
- Text search filters by ticker symbol (case-insensitive, client-side)
- Summary cards calculate totals from filtered set
- Transaction type color-coded: green for buy, red for sell
- Delete button with confirmation dialog
- Ticker column links to the holding's edit page

### API Calls
- `getAllTransactions()` on mount → `GET /api/admin/holdings/transactions/all`
- `deleteTransaction(ticker, id)` on delete → `DELETE /api/admin/holdings/:ticker/transactions/:transactionId`

### States
- **Loading**: Table skeleton
- **Empty**: "No transactions recorded yet."
- **Empty (filtered)**: "No transactions match your search."
- **Error**: "Unable to load transactions." with Retry
