import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as alphaVantageService from '../services/alphaVantageService';
import * as dataService from '../services/dataService';
import * as cacheService from '../services/cacheService';

const router = Router();

// Refresh all holdings market data
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const holdings = await dataService.listHoldings();
    const active = holdings.filter(h => h.status === 'active');

    let refreshed = 0;
    let failed = 0;
    let rateLimited = false;

    for (const holding of active) {
      try {
        const status = alphaVantageService.getRateLimitStatus();
        if (!status.canCall) {
          rateLimited = true;
          break;
        }
        await alphaVantageService.getQuote(holding.ticker);
        refreshed++;
      } catch {
        failed++;
      }
    }

    res.json({
      refreshed,
      failed,
      rateLimited,
      lastRefresh: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh market data' });
  }
});

// Refresh single holding
router.post('/refresh/:ticker', async (req: AuthRequest, res: Response) => {
  try {
    const quote = await alphaVantageService.getQuote(req.params.ticker);
    res.json({ quote });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get market data status
router.get('/status', async (_req: AuthRequest, res: Response) => {
  const status = alphaVantageService.getRateLimitStatus();
  res.json(status);
});

// Search symbols
router.get('/search/:query', async (req: AuthRequest, res: Response) => {
  try {
    const results = await alphaVantageService.searchSymbol(req.params.query);
    res.json({ results });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Lookup ticker — get company name, asset type, sector from Alpha Vantage
router.get('/lookup/:ticker', async (req: AuthRequest, res: Response) => {
  try {
    const overview = await alphaVantageService.getCompanyOverview(req.params.ticker.toUpperCase());
    res.json(overview);
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Get historical closing price for a ticker on a specific date
router.get('/price/:ticker/:date', async (req: AuthRequest, res: Response) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const targetDate = req.params.date; // YYYY-MM-DD

    // Determine if we need full history (>100 trading days ago)
    const daysSince = Math.floor((Date.now() - new Date(targetDate).getTime()) / (1000 * 60 * 60 * 24));
    const needFull = daysSince > 90;

    const timeSeries = await alphaVantageService.getDailyTimeSeries(ticker, needFull);

    // Find exact date or closest prior trading day
    let match = timeSeries.data.find(d => d.date === targetDate);
    if (!match) {
      const prior = timeSeries.data
        .filter(d => d.date <= targetDate)
        .sort((a, b) => b.date.localeCompare(a.date));
      match = prior[0];
    }

    if (!match) {
      res.status(404).json({ error: `No price data for ${ticker} on or before ${targetDate}` });
      return;
    }

    res.json({ ticker, date: match.date, price: match.close });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;
