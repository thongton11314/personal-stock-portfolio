# Personal Stock Portfolio

A portfolio management platform with an admin portal and a public-facing portfolio page. Built with React + Express + TypeScript.

**Live site:** https://thongton11314.github.io/personal-stock-portfolio/

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Recharts, react-router-dom |
| Backend | Express 4, TypeScript, tsx (dev) |
| Shared | TypeScript types package (`@portfolio/shared`) |
| Auth | JWT + bcrypt |
| Market Data | Alpha Vantage API |
| Testing | Vitest + supertest |
| CI/CD | GitHub Actions → GitHub Pages |
| Data Storage | File-based JSON (`data/` directory) |

## Project Structure

```
client/          # React frontend (Vite)
server/          # Express API backend
shared/          # Shared TypeScript types
data/            # JSON data files (holdings, transactions, benchmark, settings)
scripts/         # Build and setup scripts
.github/workflows/
  ci.yml         # CI: build + typecheck + test
  deploy.yml     # Deploy: build static data → build client → GitHub Pages
```

## Prerequisites

- **Node.js 20+**
- **Alpha Vantage API key** — free at https://www.alphavantage.co/support/#api-key
- **JWT secret** — any random string (e.g., `openssl rand -hex 32`)

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/thongton11314/personal-stock-portfolio.git
cd personal-stock-portfolio

# 2. Install all dependencies
npm run install:all

# 3. Create .env from example
cp .env.example .env
# Edit .env and set ALPHA_VANTAGE_API_KEY and JWT_SECRET

# 4. Initialize data directory (if first time)
npm run setup:data
```

## Running Locally

```bash
# Start both frontend (port 5173) and backend (port 3001)
npm run dev
```

- **Public portfolio:** http://localhost:5173/
- **Admin login:** http://localhost:5173/login
- **API:** http://localhost:3001/api/

The Vite dev server proxies `/api` requests to the Express backend automatically.

## Testing

```bash
npm test
```

Runs 62 server-side tests (Vitest + supertest) covering calculation services, date utilities, auth middleware, and route integration.

## Building

```bash
# Build everything (shared → server → client)
npm run build

# Type-check all packages
npm run typecheck
```

## Deployment (GitHub Pages)

The public portfolio page is deployed as a static site to GitHub Pages. **Admin features only work locally** (they require the backend).

### How it works

1. `scripts/build-static.mjs` reads `data/` files (holdings, transactions, benchmark prices) and generates static JSON files (`portfolio.json`, `performance.json`)
2. The client detects `VITE_STATIC_MODE=true` and fetches from static JSON instead of the API
3. Vite builds with `base: /personal-stock-portfolio/` for the GitHub Pages subpath
4. GitHub Actions deploys the built files to GitHub Pages

### Automatic deployment

Every push to `main` triggers the deploy workflow (`.github/workflows/deploy.yml`). No manual steps needed.

### Updating market data

Market data is stored in `data/benchmark/` (committed to repo). To update prices:

1. Run the app locally (`npm run dev`)
2. Log in to admin and refresh market data
3. Commit and push the updated benchmark files:
   ```bash
   git add data/benchmark/
   git commit -m "chore: update market data"
   git push origin main
   ```
4. The deploy workflow will rebuild the static site with fresh prices.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key for market data | Yes (local dev) |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes (local dev) |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | `development` or `test` | No |

These are only needed for local development. The GitHub Pages deployment uses pre-built static data and doesn't need API keys.

## GitHub Secrets

Set these in **Settings → Secrets and variables → Actions** for CI:

| Secret | Purpose |
|--------|---------|
| `ALPHA_VANTAGE_API_KEY` | Used by CI for tests |
| `JWT_SECRET` | Used by CI for tests |

## Key Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend locally |
| `npm test` | Run server tests |
| `npm run build` | Build all packages |
| `npm run typecheck` | Type-check all packages |
| `npm run install:all` | Install deps for all packages |
| `npm run setup:data` | Initialize data directory |
| `node scripts/build-static.mjs` | Generate static portfolio JSON |
