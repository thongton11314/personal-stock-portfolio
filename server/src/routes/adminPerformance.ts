import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as dataService from '../services/dataService';
import * as alphaVantageService from '../services/alphaVantageService';
import * as calculationService from '../services/calculationService';
import { NormalizedQuote } from '@portfolio/shared';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const holdings = await dataService.listHoldings();
    const active = holdings.filter(h => h.status === 'active');
    const settings = await dataService.getSettings();

    if (active.length === 0) {
      res.json({
        portfolio: { totalValue: 0, totalCost: 0, totalReturn: 0, dailyChange: 0, timeSeries: [] },
        benchmark: { timeSeries: [], totalReturn: 0 },
        comparison: { portfolioReturn: 0, benchmarkReturn: 0, relativePerformance: 0 },
      });
      return;
    }

    // Get quotes for current values
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

    // Build portfolio time series from per-holding daily prices
    const earliestDate = active.reduce((min, h) =>
      h.purchaseDate < min ? h.purchaseDate : min, active[0].purchaseDate);

    const holdingTimeSeries = new Map<string, Array<{ date: string; close: number }>>();
    for (const h of active) {
      try {
        const ts = await alphaVantageService.getDailyTimeSeries(h.ticker, true);
        const filtered = ts.data.filter(d => d.date >= earliestDate);
        holdingTimeSeries.set(h.ticker, filtered.map(d => ({ date: d.date, close: d.close })));
      } catch { /* skip */ }
    }

    // Calculate portfolio value time series (cost-weighted)
    const portfolioTimeSeries = calculationService.calculatePortfolioTimeSeries(active, holdingTimeSeries);

    // Get benchmark time series

    let benchmarkTimeSeries: Array<{ date: string; value: number; return: number }> = [];
    let benchmarkReturn = 0;

    try {
      const benchmarkData = await alphaVantageService.getDailyTimeSeries(settings.benchmark.symbol, true);
      const filtered = benchmarkData.data.filter(d => d.date >= earliestDate);
      const benchmarkValues = filtered.map(d => ({ date: d.date, value: d.close }));
      benchmarkTimeSeries = calculationService.calculateCumulativeReturn(benchmarkValues);
      if (benchmarkTimeSeries.length > 0) {
        benchmarkReturn = benchmarkTimeSeries[benchmarkTimeSeries.length - 1].return;
      }
    } catch { /* benchmark unavailable */ }

    res.json({
      portfolio: {
        totalValue: summary.totalValue,
        totalCost: summary.totalCost,
        totalReturn: summary.totalGainLossPercent,
        dailyChange: summary.dailyChange,
        timeSeries: portfolioTimeSeries,
      },
      benchmark: {
        timeSeries: benchmarkTimeSeries,
        totalReturn: benchmarkReturn,
      },
      comparison: {
        portfolioReturn: summary.totalGainLossPercent,
        benchmarkReturn,
        relativePerformance: summary.totalGainLossPercent - benchmarkReturn,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load performance data' });
  }
});

export default router;
