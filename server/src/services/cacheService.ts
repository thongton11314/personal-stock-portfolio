import path from 'path';
import { NormalizedQuote, NormalizedTimeSeries } from '@portfolio/shared';
import { readJSON, writeJSON, fileExists, getCacheDir, getBenchmarkDir, ensureDir } from '../utils/fileSystem';

const QUOTE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const BENCHMARK_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isStale(fetchedAt: string, ttlMs: number): boolean {
  const fetchTime = new Date(fetchedAt).getTime();
  return Date.now() - fetchTime > ttlMs;
}

export async function getCachedQuote(ticker: string): Promise<NormalizedQuote | null> {
  const filePath = path.join(getCacheDir(), 'quotes', `${ticker.toUpperCase()}.json`);
  if (!(await fileExists(filePath))) return null;
  const data = await readJSON<NormalizedQuote>(filePath);
  if (isStale(data.fetchedAt, QUOTE_TTL_MS)) return null;
  return data;
}

export async function setCachedQuote(ticker: string, data: NormalizedQuote): Promise<void> {
  const dir = path.join(getCacheDir(), 'quotes');
  await ensureDir(dir);
  await writeJSON(path.join(dir, `${ticker.toUpperCase()}.json`), data);
}

export async function getCachedBenchmark(symbol: string): Promise<NormalizedTimeSeries | null> {
  const filePath = path.join(getBenchmarkDir(), `${symbol.toUpperCase()}-daily.json`);
  if (!(await fileExists(filePath))) return null;
  const data = await readJSON<NormalizedTimeSeries>(filePath);
  if (isStale(data.fetchedAt, BENCHMARK_TTL_MS)) return null;
  return data;
}

export async function setCachedBenchmark(symbol: string, data: NormalizedTimeSeries): Promise<void> {
  await ensureDir(getBenchmarkDir());
  await writeJSON(path.join(getBenchmarkDir(), `${symbol.toUpperCase()}-daily.json`), data);
}

export async function getStaleCachedQuote(ticker: string): Promise<NormalizedQuote | null> {
  const filePath = path.join(getCacheDir(), 'quotes', `${ticker.toUpperCase()}.json`);
  if (!(await fileExists(filePath))) return null;
  return readJSON<NormalizedQuote>(filePath);
}

export async function getStaleCachedBenchmark(symbol: string): Promise<NormalizedTimeSeries | null> {
  const filePath = path.join(getBenchmarkDir(), `${symbol.toUpperCase()}-daily.json`);
  if (!(await fileExists(filePath))) return null;
  return readJSON<NormalizedTimeSeries>(filePath);
}
