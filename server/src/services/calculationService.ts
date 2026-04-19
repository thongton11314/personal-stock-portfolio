import { Holding, NormalizedQuote } from '@portfolio/shared';

export function calculateMarketValue(quantity: number, price: number): number {
  return quantity * price;
}

export function calculateTotalCost(quantity: number, averageCost: number): number {
  return quantity * averageCost;
}

export function calculateGainLoss(marketValue: number, totalCost: number): { gainLoss: number; gainLossPercent: number } {
  const gainLoss = marketValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  return { gainLoss, gainLossPercent };
}

export function calculateAllocationWeights(
  holdings: Array<{ ticker: string; marketValue: number }>
): Array<{ ticker: string; weight: number }> {
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  if (totalValue === 0) return holdings.map(h => ({ ticker: h.ticker, weight: 0 }));

  return holdings.map(h => ({
    ticker: h.ticker,
    weight: (h.marketValue / totalValue) * 100,
  }));
}

export function calculatePortfolioSummary(
  holdings: Holding[],
  quotes: Map<string, NormalizedQuote>
) {
  let totalValue = 0;
  let totalCost = 0;
  let dailyChange = 0;

  const holdingDetails = holdings
    .filter(h => h.status === 'active')
    .map(h => {
      const quote = quotes.get(h.ticker);
      const price = quote?.price || 0;
      const marketValue = calculateMarketValue(h.quantity, price);
      const costBasis = calculateTotalCost(h.quantity, h.averageCost);
      const { gainLoss, gainLossPercent } = calculateGainLoss(marketValue, costBasis);
      const holdingDailyChange = h.quantity * (quote?.change || 0);

      totalValue += marketValue;
      totalCost += costBasis;
      dailyChange += holdingDailyChange;

      return {
        ticker: h.ticker,
        companyName: h.companyName,
        sector: h.sector,
        marketValue,
        costBasis,
        gainLoss,
        gainLossPercent,
        isPublic: h.isPublic,
        displayOrder: h.displayOrder,
        notes: h.notes,
      };
    });

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const previousValue = totalValue - dailyChange;
  const dailyChangePercent = previousValue > 0 ? (dailyChange / previousValue) * 100 : 0;

  const weights = calculateAllocationWeights(
    holdingDetails.map(h => ({ ticker: h.ticker, marketValue: h.marketValue }))
  );

  const detailsWithWeights = holdingDetails.map(h => {
    const w = weights.find(w => w.ticker === h.ticker);
    return { ...h, weight: w?.weight || 0 };
  });

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    dailyChange,
    dailyChangePercent,
    holdingsCount: holdingDetails.length,
    holdings: detailsWithWeights,
  };
}

export function calculateCumulativeReturn(
  values: Array<{ date: string; value: number }>
): Array<{ date: string; value: number; return: number }> {
  if (values.length === 0) return [];
  const startValue = values[0].value;
  if (startValue === 0) return values.map(v => ({ ...v, return: 0 }));

  return values.map(v => ({
    date: v.date,
    value: v.value,
    return: ((v.value - startValue) / startValue) * 100,
  }));
}

export function calculatePortfolioTimeSeries(
  holdings: Holding[],
  holdingTimeSeries: Map<string, Array<{ date: string; close: number }>>
): Array<{ date: string; value: number; return: number }> {
  // Collect all dates across all holdings
  const dateSet = new Set<string>();
  for (const [, series] of holdingTimeSeries) {
    for (const point of series) {
      dateSet.add(point.date);
    }
  }

  const dates = Array.from(dateSet).sort();
  if (dates.length === 0) return [];

  // Build price lookup per holding
  const priceMaps = new Map<string, Map<string, number>>();
  for (const [ticker, series] of holdingTimeSeries) {
    const m = new Map<string, number>();
    for (const point of series) {
      m.set(point.date, point.close);
    }
    priceMaps.set(ticker, m);
  }

  // Calculate portfolio return at each date as gain/loss over total cost basis
  // This handles staggered purchases correctly — new holdings don't spike the return
  const totalCostBasis = holdings.reduce((sum, h) => sum + h.quantity * h.averageCost, 0);
  if (totalCostBasis === 0) return [];

  const lastKnownPrice = new Map<string, number>();
  const result: Array<{ date: string; value: number; return: number }> = [];

  for (const date of dates) {
    let totalValue = 0;

    for (const h of holdings) {
      const priceMap = priceMaps.get(h.ticker);
      const price = priceMap?.get(date) ?? lastKnownPrice.get(h.ticker);
      if (price !== undefined) {
        lastKnownPrice.set(h.ticker, price);
        totalValue += h.quantity * price;
      } else {
        // Use cost basis as fallback for holdings without price data yet
        totalValue += h.quantity * h.averageCost;
      }
    }

    result.push({
      date,
      value: totalValue,
      return: ((totalValue - totalCostBasis) / totalCostBasis) * 100,
    });
  }

  return result;
}
