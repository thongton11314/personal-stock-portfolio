export interface TimeSeriesPoint {
  date: string;
  value: number;
  return: number;
}

export interface PerformanceData {
  portfolio: {
    totalValue: number;
    totalCost: number;
    totalReturn: number;
    dailyChange: number;
    timeSeries: TimeSeriesPoint[];
  };
  benchmark: {
    timeSeries: TimeSeriesPoint[];
    totalReturn: number;
  };
  comparison: {
    portfolioReturn: number;
    benchmarkReturn: number;
    relativePerformance: number;
  };
}

export interface DashboardData {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdingsCount: number;
  benchmarkReturn: number;
  portfolioReturn: number;
  relativePerformance: number;
  lastRefresh: string;
}

export interface NormalizedQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  latestTradingDay: string;
  fetchedAt: string;
}

export interface NormalizedTimeSeriesEntry {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedTimeSeries {
  symbol: string;
  fetchedAt: string;
  data: NormalizedTimeSeriesEntry[];
}
