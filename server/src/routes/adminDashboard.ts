import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as dataService from '../services/dataService';
import * as alphaVantageService from '../services/alphaVantageService';
import * as calculationService from '../services/calculationService';
import { NormalizedQuote } from '@portfolio/shared';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const holdings = await dataService.listHoldings();
    const active = holdings.filter(h => h.status === 'active');

    const quotes = new Map<string, NormalizedQuote>();
    for (const h of active) {
      try {
        const quote = await alphaVantageService.getQuote(h.ticker);
        quotes.set(h.ticker, quote);
      } catch {
        // Fallback: use last close price from daily time series
        try {
          const ts = await alphaVantageService.getDailyTimeSeries(h.ticker, true);
          if (ts.data.length > 0) {
            const lastDay = ts.data[ts.data.length - 1];
            quotes.set(h.ticker, {
              symbol: h.ticker,
              price: lastDay.close,
              change: 0,
              changePercent: 0,
              volume: 0,
              latestTradingDay: lastDay.date,
              fetchedAt: new Date().toISOString(),
            });
          }
        } catch { /* skip */ }
      }
    }

    const summary = calculationService.calculatePortfolioSummary(active, quotes);
    const settings = await dataService.getSettings();

    // Get benchmark data
    let benchmarkReturn = 0;
    try {
      const benchmarkData = await alphaVantageService.getDailyTimeSeries(settings.benchmark.symbol);
      if (benchmarkData.data.length >= 2) {
        const earliest = active.reduce((min, h) => h.purchaseDate < min ? h.purchaseDate : min, active[0]?.purchaseDate || '');
        const filtered = benchmarkData.data.filter(d => d.date >= earliest);
        if (filtered.length >= 2) {
          const startPrice = filtered[0].close;
          const endPrice = filtered[filtered.length - 1].close;
          benchmarkReturn = ((endPrice - startPrice) / startPrice) * 100;
        }
      }
    } catch {
      // Benchmark unavailable
    }

    const lastQuote = Array.from(quotes.values())[0];

    res.json({
      totalValue: summary.totalValue,
      totalGainLoss: summary.totalGainLoss,
      totalGainLossPercent: summary.totalGainLossPercent,
      dailyChange: summary.dailyChange,
      dailyChangePercent: summary.dailyChangePercent,
      holdingsCount: summary.holdingsCount,
      benchmarkReturn,
      portfolioReturn: summary.totalGainLossPercent,
      relativePerformance: summary.totalGainLossPercent - benchmarkReturn,
      lastRefresh: lastQuote?.fetchedAt || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
