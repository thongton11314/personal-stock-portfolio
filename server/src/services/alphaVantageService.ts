import axios from 'axios';
import { NormalizedQuote, NormalizedTimeSeries, NormalizedTimeSeriesEntry } from '@portfolio/shared';
import * as cacheService from './cacheService';

const AV_BASE_URL = 'https://www.alphavantage.co/query';

interface RateLimitState {
  dailyCount: number;
  dailyResetAt: number;
  minuteCount: number;
  minuteResetAt: number;
}

const rateLimit: RateLimitState = {
  dailyCount: 0,
  dailyResetAt: getNextMidnight(),
  minuteCount: 0,
  minuteResetAt: Date.now() + 60000,
};

function getApiKey(): string {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) throw new Error('ALPHA_VANTAGE_API_KEY not configured');
  return key;
}

function getNextMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight.getTime();
}

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now > rateLimit.dailyResetAt) {
    rateLimit.dailyCount = 0;
    rateLimit.dailyResetAt = getNextMidnight();
  }
  if (now > rateLimit.minuteResetAt) {
    rateLimit.minuteCount = 0;
    rateLimit.minuteResetAt = now + 60000;
  }
  return rateLimit.dailyCount < 500 && rateLimit.minuteCount < 75;
}

function recordCall(): void {
  rateLimit.dailyCount++;
  rateLimit.minuteCount++;
}

export function getRateLimitStatus() {
  return {
    dailyRemaining: Math.max(0, 500 - rateLimit.dailyCount),
    minuteRemaining: Math.max(0, 75 - rateLimit.minuteCount),
    canCall: checkRateLimit(),
  };
}

export async function getQuote(ticker: string): Promise<NormalizedQuote> {
  const cached = await cacheService.getCachedQuote(ticker);
  if (cached) return cached;

  if (!checkRateLimit()) {
    const stale = await cacheService.getStaleCachedQuote(ticker);
    if (stale) return stale;
    const error = new Error('Rate limit exceeded') as Error & { status: number };
    error.status = 429;
    throw error;
  }

  const response = await axios.get(AV_BASE_URL, {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol: ticker,
      apikey: getApiKey(),
    },
  });

  recordCall();

  const raw = response.data['Global Quote'];
  if (!raw || !raw['05. price']) {
    if (response.data['Note']) {
      const stale = await cacheService.getStaleCachedQuote(ticker);
      if (stale) return stale;
      const error = new Error('Rate limit exceeded') as Error & { status: number };
      error.status = 429;
      throw error;
    }
    const error = new Error(`No quote data for ${ticker}`) as Error & { status: number };
    error.status = 404;
    throw error;
  }

  const quote: NormalizedQuote = {
    symbol: raw['01. symbol'],
    price: parseFloat(raw['05. price']),
    change: parseFloat(raw['09. change']),
    changePercent: parseFloat(raw['10. change percent']?.replace('%', '') || '0'),
    volume: parseInt(raw['06. volume'], 10),
    latestTradingDay: raw['07. latest trading day'],
    fetchedAt: new Date().toISOString(),
  };

  await cacheService.setCachedQuote(ticker, quote);
  return quote;
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  assetType: string;
  sector: string;
  industry: string;
  exchange: string;
  description: string;
}

export async function getCompanyOverview(ticker: string): Promise<CompanyOverview> {
  if (!checkRateLimit()) {
    const error = new Error('Rate limit exceeded') as Error & { status: number };
    error.status = 429;
    throw error;
  }

  const response = await axios.get(AV_BASE_URL, {
    params: {
      function: 'OVERVIEW',
      symbol: ticker,
      apikey: getApiKey(),
    },
  });

  recordCall();

  const data = response.data;
  if (!data || !data.Symbol) {
    if (data?.Note) {
      const error = new Error('Rate limit exceeded') as Error & { status: number };
      error.status = 429;
      throw error;
    }
    const error = new Error(`No overview data for ${ticker}`) as Error & { status: number };
    error.status = 404;
    throw error;
  }

  return {
    symbol: data.Symbol,
    name: data.Name,
    assetType: data.AssetType,
    sector: data.Sector,
    industry: data.Industry,
    exchange: data.Exchange,
    description: data.Description,
  };
}

export async function searchSymbol(query: string): Promise<Array<{ symbol: string; name: string; type: string; region: string }>> {
  if (!checkRateLimit()) {
    const error = new Error('Rate limit exceeded') as Error & { status: number };
    error.status = 429;
    throw error;
  }

  const response = await axios.get(AV_BASE_URL, {
    params: {
      function: 'SYMBOL_SEARCH',
      keywords: query,
      apikey: getApiKey(),
    },
  });

  recordCall();

  const matches = response.data['bestMatches'] || [];
  return matches.map((m: Record<string, string>) => ({
    symbol: m['1. symbol'],
    name: m['2. name'],
    type: m['3. type'],
    region: m['4. region'],
  }));
}

export async function getDailyTimeSeries(ticker: string, full: boolean = false): Promise<NormalizedTimeSeries> {
  // Always try cache first for consistency — both compact and full use the same cache
  const cached = await cacheService.getCachedBenchmark(ticker);
  if (cached) return cached;

  if (!checkRateLimit()) {
    const stale = await cacheService.getStaleCachedBenchmark(ticker);
    if (stale) return stale;
    const error = new Error('Rate limit exceeded') as Error & { status: number };
    error.status = 429;
    throw error;
  }

  const response = await axios.get(AV_BASE_URL, {
    params: {
      function: 'TIME_SERIES_DAILY',
      symbol: ticker,
      outputsize: full ? 'full' : 'compact',
      apikey: getApiKey(),
    },
  });

  recordCall();

  const raw = response.data['Time Series (Daily)'];
  if (!raw) {
    if (response.data['Note']) {
      const stale = await cacheService.getStaleCachedBenchmark(ticker);
      if (stale) return stale;
    }
    const error = new Error(`No time series data for ${ticker}`) as Error & { status: number };
    error.status = 404;
    throw error;
  }

  const data: NormalizedTimeSeriesEntry[] = Object.entries(raw)
    .map(([date, values]: [string, unknown]) => {
      const v = values as Record<string, string>;
      return {
        date,
        open: parseFloat(v['1. open']),
        high: parseFloat(v['2. high']),
        low: parseFloat(v['3. low']),
        close: parseFloat(v['4. close']),
        volume: parseInt(v['5. volume'], 10),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const result: NormalizedTimeSeries = {
    symbol: ticker,
    fetchedAt: new Date().toISOString(),
    data,
  };

  await cacheService.setCachedBenchmark(ticker, result);
  return result;
}
