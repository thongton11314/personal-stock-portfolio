import { describe, it, expect } from 'vitest';
import {
  calculateMarketValue,
  calculateTotalCost,
  calculateGainLoss,
  calculateAllocationWeights,
  calculatePortfolioSummary,
  calculateCumulativeReturn,
  calculatePortfolioTimeSeries,
} from '../calculationService';
import { Holding, NormalizedQuote } from '@portfolio/shared';

function makeHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    id: 'test-1',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    assetType: 'Stock',
    quantity: 10,
    averageCost: 150,
    purchaseDate: '2025-01-01',
    sector: 'Technology',
    notes: '',
    isPublic: true,
    displayOrder: 0,
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeQuote(overrides: Partial<NormalizedQuote> = {}): NormalizedQuote {
  return {
    symbol: 'AAPL',
    price: 175,
    change: 2.5,
    changePercent: 1.45,
    volume: 1000000,
    latestTradingDay: '2026-04-18',
    fetchedAt: '2026-04-18T12:00:00Z',
    ...overrides,
  };
}

describe('calculateMarketValue', () => {
  it('multiplies quantity by price', () => {
    expect(calculateMarketValue(10, 150)).toBe(1500);
  });

  it('returns 0 for zero quantity', () => {
    expect(calculateMarketValue(0, 150)).toBe(0);
  });

  it('returns 0 for zero price', () => {
    expect(calculateMarketValue(10, 0)).toBe(0);
  });

  it('handles fractional shares', () => {
    expect(calculateMarketValue(0.5, 200)).toBe(100);
  });
});

describe('calculateTotalCost', () => {
  it('multiplies quantity by average cost', () => {
    expect(calculateTotalCost(10, 150)).toBe(1500);
  });

  it('returns 0 for zero quantity', () => {
    expect(calculateTotalCost(0, 150)).toBe(0);
  });
});

describe('calculateGainLoss', () => {
  it('calculates positive gain', () => {
    const result = calculateGainLoss(1750, 1500);
    expect(result.gainLoss).toBe(250);
    expect(result.gainLossPercent).toBeCloseTo(16.67, 1);
  });

  it('calculates negative loss', () => {
    const result = calculateGainLoss(1200, 1500);
    expect(result.gainLoss).toBe(-300);
    expect(result.gainLossPercent).toBeCloseTo(-20, 1);
  });

  it('returns 0% when total cost is 0', () => {
    const result = calculateGainLoss(500, 0);
    expect(result.gainLoss).toBe(500);
    expect(result.gainLossPercent).toBe(0);
  });

  it('returns 0 gain when values are equal', () => {
    const result = calculateGainLoss(1500, 1500);
    expect(result.gainLoss).toBe(0);
    expect(result.gainLossPercent).toBe(0);
  });
});

describe('calculateAllocationWeights', () => {
  it('calculates weights as percentages', () => {
    const holdings = [
      { ticker: 'AAPL', marketValue: 3000 },
      { ticker: 'MSFT', marketValue: 7000 },
    ];
    const result = calculateAllocationWeights(holdings);
    expect(result).toEqual([
      { ticker: 'AAPL', weight: 30 },
      { ticker: 'MSFT', weight: 70 },
    ]);
  });

  it('returns all zeros when total value is 0', () => {
    const holdings = [
      { ticker: 'AAPL', marketValue: 0 },
      { ticker: 'MSFT', marketValue: 0 },
    ];
    const result = calculateAllocationWeights(holdings);
    expect(result).toEqual([
      { ticker: 'AAPL', weight: 0 },
      { ticker: 'MSFT', weight: 0 },
    ]);
  });

  it('single holding gets 100%', () => {
    const result = calculateAllocationWeights([{ ticker: 'AAPL', marketValue: 5000 }]);
    expect(result).toEqual([{ ticker: 'AAPL', weight: 100 }]);
  });

  it('handles empty array', () => {
    expect(calculateAllocationWeights([])).toEqual([]);
  });
});

describe('calculatePortfolioSummary', () => {
  it('calculates summary for multiple holdings', () => {
    const holdings = [
      makeHolding({ ticker: 'AAPL', quantity: 10, averageCost: 150 }),
      makeHolding({ ticker: 'MSFT', quantity: 5, averageCost: 300 }),
    ];
    const quotes = new Map<string, NormalizedQuote>([
      ['AAPL', makeQuote({ symbol: 'AAPL', price: 175, change: 2 })],
      ['MSFT', makeQuote({ symbol: 'MSFT', price: 350, change: -3 })],
    ]);

    const result = calculatePortfolioSummary(holdings, quotes);
    expect(result.totalValue).toBe(10 * 175 + 5 * 350); // 3500
    expect(result.totalCost).toBe(10 * 150 + 5 * 300);  // 3000
    expect(result.totalGainLoss).toBe(500);
    expect(result.holdingsCount).toBe(2);
    expect(result.holdings).toHaveLength(2);
  });

  it('excludes archived holdings', () => {
    const holdings = [
      makeHolding({ ticker: 'AAPL', status: 'active' }),
      makeHolding({ ticker: 'MSFT', status: 'archived' }),
    ];
    const quotes = new Map<string, NormalizedQuote>([
      ['AAPL', makeQuote({ symbol: 'AAPL' })],
    ]);

    const result = calculatePortfolioSummary(holdings, quotes);
    expect(result.holdingsCount).toBe(1);
  });

  it('handles empty portfolio', () => {
    const result = calculatePortfolioSummary([], new Map());
    expect(result.totalValue).toBe(0);
    expect(result.totalCost).toBe(0);
    expect(result.holdingsCount).toBe(0);
    expect(result.holdings).toEqual([]);
  });

  it('handles missing quote (price defaults to 0)', () => {
    const holdings = [makeHolding({ ticker: 'AAPL', quantity: 10, averageCost: 150 })];
    const quotes = new Map<string, NormalizedQuote>(); // no quotes

    const result = calculatePortfolioSummary(holdings, quotes);
    expect(result.totalValue).toBe(0);
    expect(result.totalCost).toBe(1500);
    expect(result.totalGainLoss).toBe(-1500);
  });
});

describe('calculateCumulativeReturn', () => {
  it('calculates returns relative to first value', () => {
    const values = [
      { date: '2026-01-01', value: 100 },
      { date: '2026-01-02', value: 110 },
      { date: '2026-01-03', value: 90 },
    ];
    const result = calculateCumulativeReturn(values);
    expect(result[0].return).toBe(0);
    expect(result[1].return).toBe(10);
    expect(result[2].return).toBe(-10);
  });

  it('returns empty for empty input', () => {
    expect(calculateCumulativeReturn([])).toEqual([]);
  });

  it('returns 0% when start value is 0', () => {
    const values = [
      { date: '2026-01-01', value: 0 },
      { date: '2026-01-02', value: 100 },
    ];
    const result = calculateCumulativeReturn(values);
    expect(result[0].return).toBe(0);
    expect(result[1].return).toBe(0);
  });
});

describe('calculatePortfolioTimeSeries', () => {
  it('calculates weighted portfolio return over time', () => {
    const holdings = [
      makeHolding({ ticker: 'AAPL', quantity: 10, averageCost: 100 }),
    ];
    const timeSeries = new Map([
      ['AAPL', [
        { date: '2026-01-01', close: 100 },
        { date: '2026-01-02', close: 110 },
        { date: '2026-01-03', close: 105 },
      ]],
    ]);

    const result = calculatePortfolioTimeSeries(holdings, timeSeries);
    expect(result).toHaveLength(3);
    expect(result[0].return).toBe(0);   // 1000/1000 - 1
    expect(result[1].return).toBe(10);  // 1100/1000 - 1
    expect(result[2].return).toBe(5);   // 1050/1000 - 1
  });

  it('returns empty for no time series data', () => {
    const holdings = [makeHolding()];
    const result = calculatePortfolioTimeSeries(holdings, new Map());
    expect(result).toEqual([]);
  });

  it('returns empty when total cost basis is 0', () => {
    const holdings = [makeHolding({ quantity: 0, averageCost: 0 })];
    const timeSeries = new Map([
      ['AAPL', [{ date: '2026-01-01', close: 100 }]],
    ]);
    const result = calculatePortfolioTimeSeries(holdings, timeSeries);
    expect(result).toEqual([]);
  });

  it('uses last known price when date is missing for a holding', () => {
    const holdings = [
      makeHolding({ ticker: 'AAPL', quantity: 10, averageCost: 100 }),
      makeHolding({ ticker: 'MSFT', quantity: 5, averageCost: 200 }),
    ];
    const timeSeries = new Map([
      ['AAPL', [
        { date: '2026-01-01', close: 100 },
        { date: '2026-01-02', close: 110 },
      ]],
      ['MSFT', [
        { date: '2026-01-01', close: 200 },
        // MSFT has no data for 2026-01-02 — should use last known (200)
      ]],
    ]);

    const result = calculatePortfolioTimeSeries(holdings, timeSeries);
    // Total cost basis: 10*100 + 5*200 = 2000
    // Day 1: 10*100 + 5*200 = 2000 → 0%
    // Day 2: 10*110 + 5*200 = 2100 → 5%
    expect(result[0].return).toBe(0);
    expect(result[1].return).toBe(5);
  });
});
