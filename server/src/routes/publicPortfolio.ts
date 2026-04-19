import { Router, Request, Response } from 'express';
import * as dataService from '../services/dataService';
import * as alphaVantageService from '../services/alphaVantageService';
import * as calculationService from '../services/calculationService';
import { NormalizedQuote } from '@portfolio/shared';

const router = Router();

// Check if published - middleware for all public routes
async function requirePublished(_req: Request, res: Response, next: Function) {
  try {
    const settings = await dataService.getSettings();
    if (!settings.publicPage.isPublished) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    next();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
}

router.use(requirePublished);

// Get public portfolio data
router.get('/portfolio', async (_req: Request, res: Response) => {
  try {
    const settings = await dataService.getSettings();
    const holdings = await dataService.listHoldings();

    // Only active, public holdings
    const publicHoldings = holdings.filter(h => h.status === 'active' && h.isPublic);

    // Load daily historical data first — used for returns AND as price fallback
    const historicalData = new Map<string, Array<{ date: string; close: number }>>();
    for (const h of publicHoldings) {
      try {
        const ts = await alphaVantageService.getDailyTimeSeries(h.ticker, true);
        historicalData.set(h.ticker, ts.data.map(d => ({ date: d.date, close: d.close })));
      } catch { /* skip */ }
    }

    const quotes = new Map<string, NormalizedQuote>();
    for (const h of publicHoldings) {
      try {
        const quote = await alphaVantageService.getQuote(h.ticker);
        quotes.set(h.ticker, quote);
      } catch {
        // Fallback: use last close price from daily time series for consistent pricing
        const daily = historicalData.get(h.ticker);
        if (daily && daily.length > 0) {
          const lastDay = daily[daily.length - 1];
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
      }
    }

    const summary = calculationService.calculatePortfolioSummary(publicHoldings, quotes);

    // Build public response — NEVER include quantity, costBasis, or exact dollar gain/loss
    // Fetch transaction dates for each holding
    const holdingTransactions = new Map<string, { firstBuyDate: string; lastBuyDate: string }>();
    for (const h of publicHoldings) {
      const txs = await dataService.getTransactionsForTicker(h.ticker);
      const buyTxs = txs.filter(t => t.type === 'buy').sort((a, b) => a.date.localeCompare(b.date));
      holdingTransactions.set(h.ticker, {
        firstBuyDate: buyTxs.length > 0 ? buyTxs[0].date : h.purchaseDate,
        lastBuyDate: buyTxs.length > 0 ? buyTxs[buyTxs.length - 1].date : h.purchaseDate,
      });
    }

    // historicalData already loaded above (used for quote fallback + return calculations)

    const today = new Date().toISOString().slice(0, 10);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    function findClosestPrice(data: Array<{ date: string; close: number }>, targetDate: string): number | null {
      // Find the closest date on or before the target
      const candidates = data.filter(d => d.date <= targetDate);
      if (candidates.length === 0) return null;
      return candidates[candidates.length - 1].close;
    }

    const publicHoldingsList = summary.holdings
      .filter(h => h.isPublic)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(h => {
        const holding = publicHoldings.find(ph => ph.ticker === h.ticker);
        const dates = holdingTransactions.get(h.ticker);
        const avgCost = holding?.averageCost || 0;
        const quote = quotes.get(h.ticker);
        const currentPrice = quote?.price || 0;
        const cumulativeReturn = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

        const daily = historicalData.get(h.ticker) || [];
        const price1YrAgo = findClosestPrice(daily, oneYearAgo);
        const price3YrAgo = findClosestPrice(daily, threeYearsAgo);
        const return1yr = price1YrAgo ? ((currentPrice - price1YrAgo) / price1YrAgo) * 100 : null;
        const return3yr = price3YrAgo ? ((currentPrice - price3YrAgo) / price3YrAgo) * 100 : null;

        // Peak price after first buy date
        const firstBuy = dates?.firstBuyDate || holding?.purchaseDate || '';
        const pricesAfterFirstBuy = daily.filter(d => d.date >= firstBuy);
        const peakPrice = pricesAfterFirstBuy.length > 0
          ? Math.round(Math.max(...pricesAfterFirstBuy.map(d => d.close)) * 100) / 100
          : null;

        return {
          ticker: h.ticker,
          companyName: h.companyName,
          sector: h.sector,
          weight: Math.round(h.weight * 10) / 10,
          marketValue: h.marketValue,
          averagePrice: Math.round(avgCost * 100) / 100,
          peakPrice,
          currentPrice: Math.round(currentPrice * 100) / 100,
          cumulativeReturn: Math.round(cumulativeReturn * 100) / 100,
          _return1yr: return1yr,
          _return3yr: return3yr,
          firstBuyDate: dates?.firstBuyDate || '',
          lastBuyDate: dates?.lastBuyDate || '',
          notes: h.notes,
        };
      });

    // ── Time-Weighted Return (TWR) ──
    // Industry-standard method that neutralizes the effect of cash flows (deposits/withdrawals).
    // Splits the measurement period into sub-periods at each transaction date, computes
    // the return for each sub-period, then chains them: TWR = ∏(1 + r_i) − 1
    // This measures pure investment performance regardless of when money was added.
    const allTransactions = new Map<string, Array<{ date: string; type: string; quantity: number; price: number }>>();
    for (const h of publicHoldings) {
      const txs = await dataService.getTransactionsForTicker(h.ticker);
      allTransactions.set(h.ticker, txs.map(t => ({ date: t.date, type: t.type, quantity: t.quantity, price: t.price })));
    }

    function getQuantityAtDate(ticker: string, targetDate: string): number {
      const txs = allTransactions.get(ticker) || [];
      let qty = 0;
      for (const tx of [...txs].sort((a, b) => a.date.localeCompare(b.date))) {
        if (tx.date > targetDate) break;
        if (tx.type === 'buy') qty += tx.quantity;
        else if (tx.type === 'sell') qty -= tx.quantity;
      }
      return qty;
    }

    function portfolioValueWithQty(targetDate: string, quantities: Map<string, number>): number {
      let total = 0;
      for (const [ticker, qty] of quantities) {
        if (qty <= 0) continue;
        const daily = historicalData.get(ticker) || [];
        const candidates = daily.filter(d => d.date <= targetDate);
        if (candidates.length === 0) continue;
        total += qty * candidates[candidates.length - 1].close;
      }
      return total;
    }

    function calculateTWR(startDate: string): number | null {
      // 1. Initialize quantities at start date
      const currentQty = new Map<string, number>();
      for (const h of publicHoldings) {
        const qty = getQuantityAtDate(h.ticker, startDate);
        if (qty > 0) currentQty.set(h.ticker, qty);
      }

      let subStartValue = portfolioValueWithQty(startDate, currentQty);

      // If no portfolio existed at the start date, begin from the first transaction
      // This handles 3Y return when portfolio is younger than 3 years
      let effectiveStartDate = startDate;
      if (subStartValue <= 0) {
        const allTxDates: string[] = [];
        for (const h of publicHoldings) {
          for (const tx of allTransactions.get(h.ticker) || []) {
            if (tx.date >= startDate) allTxDates.push(tx.date);
          }
        }
        if (allTxDates.length === 0) return null;
        effectiveStartDate = allTxDates.sort()[0];
      }

      // 2. Collect transactions AFTER effectiveStartDate, sorted by date
      const txsInPeriod: Array<{ date: string; ticker: string; type: string; quantity: number; price: number }> = [];
      for (const h of publicHoldings) {
        for (const tx of allTransactions.get(h.ticker) || []) {
          if (tx.date > effectiveStartDate) txsInPeriod.push({ ...tx, ticker: h.ticker });
        }
      }
      txsInPeriod.sort((a, b) => a.date.localeCompare(b.date));

      // 3. Group by date
      const txDates = [...new Set(txsInPeriod.map(t => t.date))].sort();

      let twrProduct = 1;

      for (const txDate of txDates) {
        // Value at this date using OLD quantities (before today's transactions)
        const vBefore = portfolioValueWithQty(txDate, currentQty);

        // Sub-period return: how the existing portfolio grew
        if (subStartValue > 0) {
          twrProduct *= vBefore / subStartValue;
        }

        // Apply transactions on this date
        let cashFlow = 0;
        const dayTxs = txsInPeriod.filter(t => t.date === txDate);
        for (const tx of dayTxs) {
          const existing = currentQty.get(tx.ticker) || 0;
          if (tx.type === 'buy') {
            currentQty.set(tx.ticker, existing + tx.quantity);
            cashFlow += tx.quantity * tx.price;
          } else {
            currentQty.set(tx.ticker, existing - tx.quantity);
            cashFlow -= tx.quantity * tx.price;
          }
        }

        // New sub-period starts with adjusted base (existing value + new cash)
        subStartValue = vBefore + cashFlow;
      }

      // 4. Final sub-period: use historical close price for consistency (not live quotes)
      const today = new Date().toISOString().slice(0, 10);
      const currentPortfolioVal = portfolioValueWithQty(today, currentQty);
      if (subStartValue > 0 && currentPortfolioVal > 0) {
        twrProduct *= currentPortfolioVal / subStartValue;
      }

      return Math.round((twrProduct - 1) * 10000) / 100;
    }

    const currentPortfolioValue = publicHoldingsList.reduce((s, h) => s + h.marketValue, 0);
    const ytdStartDate = `${new Date().getFullYear()}-01-01`;
    const portfolioReturnYtd = calculateTWR(ytdStartDate);
    const oneYearAgoDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const portfolioReturn1yr = calculateTWR(oneYearAgoDate);
    const threeYearsAgoDate = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const portfolioReturn3yr = calculateTWR(threeYearsAgoDate);

    // Sector allocation
    const sectorMap = new Map<string, number>();
    for (const h of publicHoldingsList) {
      const sector = h.sector || 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + h.weight);
    }
    const bySector = Array.from(sectorMap.entries())
      .map(([sector, weight]) => ({ sector, weight: Math.round(weight * 10) / 10 }))
      .sort((a, b) => b.weight - a.weight);

    res.json({
      portfolio: {
        title: settings.portfolio.title,
        subtitle: settings.portfolio.subtitle,
        description: settings.portfolio.description,
        disclaimer: settings.portfolio.disclaimer,
        lastUpdated: settings.updatedAt,
      },
      summary: {
        totalValue: Math.round(summary.totalValue * 100) / 100,
        totalReturn: Math.round(summary.totalGainLossPercent * 100) / 100,
        holdingsCount: publicHoldingsList.length,
        returnYtd: portfolioReturnYtd,
        return1yr: portfolioReturn1yr,
        return3yr: portfolioReturn3yr,
      },
      holdings: publicHoldingsList.map(({ _return1yr, _return3yr, marketValue, ...rest }) => rest),
      allocation: { bySector },
      // 12-month chart data for each holding
      ytdChart: await (async () => {
        const ytdStart = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const chartSeries: Array<{ ticker: string; data: Array<{ date: string; return: number }> }> = [];
        for (const h of publicHoldingsList) {
          const daily = historicalData.get(h.ticker) || [];
          const ytdData = daily.filter(d => d.date >= ytdStart);
          if (ytdData.length > 0) {
            const startPrice = ytdData[0].close;
            chartSeries.push({
              ticker: h.ticker,
              data: ytdData.map(d => ({
                date: d.date,
                return: Math.round(((d.close - startPrice) / startPrice) * 10000) / 100,
              })),
            });
          }
        }
        return chartSeries;
      })(),
      // Portfolio vs S&P 500 12-month comparison
      ytdComparison: await (async () => {
        const ytdStart = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        // Compute portfolio YTD: daily portfolio value = sum(quantity * close) for each holding
        // Collect all YTD dates across holdings
        const allDatesSet = new Set<string>();
        for (const h of publicHoldings) {
          const daily = historicalData.get(h.ticker) || [];
          for (const d of daily) {
            if (d.date >= ytdStart) allDatesSet.add(d.date);
          }
        }
        const allDates = Array.from(allDatesSet).sort();

        const portfolioSeries: Array<{ date: string; return: number }> = [];
        let startValue = 0;

        for (let i = 0; i < allDates.length; i++) {
          const date = allDates[i];
          let dayValue = 0;
          for (const h of publicHoldings) {
            const daily = historicalData.get(h.ticker) || [];
            // Find closest price on or before this date
            const candidates = daily.filter(d => d.date <= date);
            const price = candidates.length > 0 ? candidates[candidates.length - 1].close : 0;
            dayValue += h.quantity * price;
          }
          if (i === 0) startValue = dayValue;
          const ret = startValue > 0 ? ((dayValue - startValue) / startValue) * 100 : 0;
          portfolioSeries.push({ date, return: Math.round(ret * 100) / 100 });
        }

        // S&P 500 YTD
        let spySeries: Array<{ date: string; return: number }> = [];
        try {
          const spyData = await alphaVantageService.getDailyTimeSeries(settings.benchmark.symbol, true);
          const spyYtd = spyData.data.filter(d => d.date >= ytdStart);
          if (spyYtd.length > 0) {
            const spyStart = spyYtd[0].close;
            spySeries = spyYtd.map(d => ({
              date: d.date,
              return: Math.round(((d.close - spyStart) / spyStart) * 10000) / 100,
            }));
          }
        } catch { /* skip */ }

        return { portfolio: portfolioSeries, spy: spySeries };
      })(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load portfolio' });
  }
});

// Get public performance data
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const settings = await dataService.getSettings();
    const holdings = await dataService.listHoldings();
    const publicHoldings = holdings.filter(h => h.status === 'active' && h.isPublic);

    if (publicHoldings.length === 0) {
      res.json({
        portfolio: { timeSeries: [], totalReturn: 0 },
        benchmark: { timeSeries: [], totalReturn: 0 },
        relativePerformance: 0,
      });
      return;
    }

    // Get benchmark
    const earliestDate = publicHoldings.reduce((min, h) =>
      h.purchaseDate < min ? h.purchaseDate : min, publicHoldings[0].purchaseDate);

    let benchmarkTimeSeries: Array<{ date: string; value: number; return: number }> = [];
    let benchmarkReturn = 0;

    try {
      const benchmarkData = await alphaVantageService.getDailyTimeSeries(settings.benchmark.symbol, true);
      const filtered = benchmarkData.data.filter(d => d.date >= earliestDate);
      const values = filtered.map(d => ({ date: d.date, value: d.close }));
      benchmarkTimeSeries = calculationService.calculateCumulativeReturn(values);
      if (benchmarkTimeSeries.length > 0) {
        benchmarkReturn = benchmarkTimeSeries[benchmarkTimeSeries.length - 1].return;
      }
    } catch { /* benchmark unavailable */ }

    const quotes = new Map<string, NormalizedQuote>();
    for (const h of publicHoldings) {
      try {
        const quote = await alphaVantageService.getQuote(h.ticker);
        quotes.set(h.ticker, quote);
      } catch { /* skip */ }
    }

    const summary = calculationService.calculatePortfolioSummary(publicHoldings, quotes);

    res.json({
      portfolio: {
        timeSeries: [],
        totalReturn: Math.round(summary.totalGainLossPercent * 100) / 100,
      },
      benchmark: {
        timeSeries: benchmarkTimeSeries.map(p => ({
          date: p.date,
          return: Math.round(p.return * 100) / 100,
        })),
        totalReturn: Math.round(benchmarkReturn * 100) / 100,
      },
      relativePerformance: Math.round((summary.totalGainLossPercent - benchmarkReturn) * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load performance' });
  }
});

export default router;
