/**
 * Static data generator for GitHub Pages deployment.
 * Reads data/ files and cached market data to produce static JSON
 * that the client can fetch without a backend.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUT_DIR = path.join(__dirname, '..', 'client', 'public', 'data');

async function readJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function listJSONFiles(dir) {
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}

async function main() {
  console.log('Generating static portfolio data...');

  // Read settings
  const settings = await readJSON(path.join(DATA_DIR, 'settings.json'));
  if (!settings.publicPage.isPublished) {
    console.log('Portfolio is not published. Generating empty data.');
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(path.join(OUT_DIR, 'portfolio.json'), JSON.stringify({ notFound: true }));
    await fs.writeFile(path.join(OUT_DIR, 'performance.json'), JSON.stringify({ notFound: true }));
    return;
  }

  // Read holdings
  const holdingFiles = await listJSONFiles(path.join(DATA_DIR, 'holdings'));
  const allHoldings = [];
  for (const file of holdingFiles) {
    const holding = await readJSON(path.join(DATA_DIR, 'holdings', file));
    allHoldings.push(holding);
  }
  allHoldings.sort((a, b) => a.displayOrder - b.displayOrder);
  const publicHoldings = allHoldings.filter(h => h.status === 'active' && h.isPublic);

  // Read benchmark data
  const benchmarkDir = path.join(DATA_DIR, 'benchmark');
  const historicalData = new Map();
  for (const h of publicHoldings) {
    try {
      const data = await readJSON(path.join(benchmarkDir, `${h.ticker}-daily.json`));
      historicalData.set(h.ticker, data.data || data);
    } catch {
      console.warn(`  No benchmark data for ${h.ticker}`);
    }
  }

  // Read SPY benchmark
  let spyData = [];
  try {
    const spy = await readJSON(path.join(benchmarkDir, `${settings.benchmark.symbol}-daily.json`));
    spyData = spy.data || spy;
  } catch {
    console.warn(`  No benchmark data for ${settings.benchmark.symbol}`);
  }

  // Read cached quotes for current prices
  const quotes = new Map();
  for (const h of publicHoldings) {
    try {
      const quote = await readJSON(path.join(DATA_DIR, 'cache', 'quotes', `${h.ticker}.json`));
      quotes.set(h.ticker, quote.data || quote);
    } catch {
      // Fallback: use last close from daily data
      const daily = historicalData.get(h.ticker);
      if (daily && daily.length > 0) {
        const last = daily[daily.length - 1];
        quotes.set(h.ticker, {
          symbol: h.ticker,
          price: last.close,
          change: 0,
          changePercent: 0,
          volume: 0,
          latestTradingDay: last.date,
        });
      }
    }
  }

  // Read transactions
  const allTransactions = new Map();
  for (const h of publicHoldings) {
    const txDir = path.join(DATA_DIR, 'transactions', h.ticker.toUpperCase());
    const txFiles = await listJSONFiles(txDir);
    const txs = [];
    for (const f of txFiles) {
      txs.push(await readJSON(path.join(txDir, f)));
    }
    txs.sort((a, b) => a.date.localeCompare(b.date));
    allTransactions.set(h.ticker, txs);
  }

  // Calculate portfolio summary
  let totalValue = 0;
  let totalCost = 0;
  const holdingDetails = [];

  for (const h of publicHoldings) {
    const quote = quotes.get(h.ticker);
    const price = quote?.price || 0;
    const marketValue = h.quantity * price;
    const costBasis = h.quantity * h.averageCost;
    totalValue += marketValue;
    totalCost += costBasis;

    const buyTxs = (allTransactions.get(h.ticker) || []).filter(t => t.type === 'buy');
    const firstBuyDate = buyTxs.length > 0 ? buyTxs[0].date : h.purchaseDate;
    const lastBuyDate = buyTxs.length > 0 ? buyTxs[buyTxs.length - 1].date : h.purchaseDate;

    const daily = historicalData.get(h.ticker) || [];
    const cumulativeReturn = h.averageCost > 0 ? ((price - h.averageCost) / h.averageCost) * 100 : 0;

    // Peak price after first buy
    const pricesAfterBuy = daily.filter(d => d.date >= firstBuyDate);
    const peakPrice = pricesAfterBuy.length > 0
      ? Math.round(Math.max(...pricesAfterBuy.map(d => d.close)) * 100) / 100
      : null;

    holdingDetails.push({
      ticker: h.ticker,
      companyName: h.companyName,
      sector: h.sector,
      marketValue,
      averagePrice: Math.round(h.averageCost * 100) / 100,
      peakPrice,
      currentPrice: Math.round(price * 100) / 100,
      cumulativeReturn: Math.round(cumulativeReturn * 100) / 100,
      firstBuyDate,
      lastBuyDate,
      notes: h.notes,
    });
  }

  // Calculate weights
  for (const h of holdingDetails) {
    h.weight = totalValue > 0 ? Math.round((h.marketValue / totalValue) * 1000) / 10 : 0;
  }

  // Sector allocation
  const sectorMap = new Map();
  for (const h of holdingDetails) {
    const sector = h.sector || 'Other';
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + h.weight);
  }
  const bySector = Array.from(sectorMap.entries())
    .map(([sector, weight]) => ({ sector, weight: Math.round(weight * 10) / 10 }))
    .sort((a, b) => b.weight - a.weight);

  // TWR calculation
  function getQuantityAtDate(ticker, targetDate) {
    const txs = allTransactions.get(ticker) || [];
    let qty = 0;
    for (const tx of txs) {
      if (tx.date > targetDate) break;
      if (tx.type === 'buy') qty += tx.quantity;
      else if (tx.type === 'sell') qty -= tx.quantity;
    }
    return qty;
  }

  function portfolioValueAtDate(targetDate, quantities) {
    let total = 0;
    for (const [ticker, qty] of quantities) {
      if (qty <= 0) continue;
      const daily = historicalData.get(ticker) || [];
      const candidates = daily.filter(d => d.date <= targetDate);
      if (candidates.length > 0) total += qty * candidates[candidates.length - 1].close;
    }
    return total;
  }

  function calculateTWR(startDate) {
    const currentQty = new Map();
    for (const h of publicHoldings) {
      const qty = getQuantityAtDate(h.ticker, startDate);
      if (qty > 0) currentQty.set(h.ticker, qty);
    }

    let subStartValue = portfolioValueAtDate(startDate, currentQty);
    let effectiveStartDate = startDate;

    if (subStartValue <= 0) {
      const allTxDates = [];
      for (const h of publicHoldings) {
        for (const tx of allTransactions.get(h.ticker) || []) {
          if (tx.date >= startDate) allTxDates.push(tx.date);
        }
      }
      if (allTxDates.length === 0) return null;
      effectiveStartDate = allTxDates.sort()[0];
    }

    const txsInPeriod = [];
    for (const h of publicHoldings) {
      for (const tx of allTransactions.get(h.ticker) || []) {
        if (tx.date > effectiveStartDate) txsInPeriod.push({ ...tx, ticker: h.ticker });
      }
    }
    txsInPeriod.sort((a, b) => a.date.localeCompare(b.date));

    const txDates = [...new Set(txsInPeriod.map(t => t.date))].sort();
    let twrProduct = 1;

    for (const txDate of txDates) {
      const vBefore = portfolioValueAtDate(txDate, currentQty);
      if (subStartValue > 0) twrProduct *= vBefore / subStartValue;

      let cashFlow = 0;
      for (const tx of txsInPeriod.filter(t => t.date === txDate)) {
        const existing = currentQty.get(tx.ticker) || 0;
        if (tx.type === 'buy') {
          currentQty.set(tx.ticker, existing + tx.quantity);
          cashFlow += tx.quantity * tx.price;
        } else {
          currentQty.set(tx.ticker, existing - tx.quantity);
          cashFlow -= tx.quantity * tx.price;
        }
      }
      subStartValue = vBefore + cashFlow;
    }

    const today = new Date().toISOString().slice(0, 10);
    const currentVal = portfolioValueAtDate(today, currentQty);
    if (subStartValue > 0 && currentVal > 0) twrProduct *= currentVal / subStartValue;

    return Math.round((twrProduct - 1) * 10000) / 100;
  }

  const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  const ytdStartDate = `${new Date().getFullYear()}-01-01`;
  const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
  const threeYearsAgo = new Date(Date.now() - 3 * 365 * 86400000).toISOString().slice(0, 10);

  // YTD chart for each holding (12-month)
  const ytdChart = [];
  for (const h of holdingDetails) {
    const daily = historicalData.get(h.ticker) || [];
    const ytdData = daily.filter(d => d.date >= oneYearAgo);
    if (ytdData.length > 0) {
      const startPrice = ytdData[0].close;
      ytdChart.push({
        ticker: h.ticker,
        data: ytdData.map(d => ({
          date: d.date,
          return: Math.round(((d.close - startPrice) / startPrice) * 10000) / 100,
        })),
      });
    }
  }

  // Portfolio vs SPY comparison (12-month)
  const allDatesSet = new Set();
  for (const h of publicHoldings) {
    const daily = historicalData.get(h.ticker) || [];
    for (const d of daily) {
      if (d.date >= oneYearAgo) allDatesSet.add(d.date);
    }
  }
  const allDates = Array.from(allDatesSet).sort();
  const portfolioSeries = [];
  let startVal = 0;
  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];
    let dayValue = 0;
    for (const h of publicHoldings) {
      const daily = historicalData.get(h.ticker) || [];
      const candidates = daily.filter(d => d.date <= date);
      const price = candidates.length > 0 ? candidates[candidates.length - 1].close : 0;
      dayValue += h.quantity * price;
    }
    if (i === 0) startVal = dayValue;
    const ret = startVal > 0 ? ((dayValue - startVal) / startVal) * 100 : 0;
    portfolioSeries.push({ date, return: Math.round(ret * 100) / 100 });
  }

  const spyYtd = spyData.filter(d => d.date >= oneYearAgo);
  let spySeries = [];
  if (spyYtd.length > 0) {
    const spyStart = spyYtd[0].close;
    spySeries = spyYtd.map(d => ({
      date: d.date,
      return: Math.round(((d.close - spyStart) / spyStart) * 10000) / 100,
    }));
  }

  // Benchmark performance for performance.json
  const earliestDate = publicHoldings.reduce((min, h) =>
    h.purchaseDate < min ? h.purchaseDate : min, publicHoldings[0].purchaseDate);
  const benchFiltered = spyData.filter(d => d.date >= earliestDate);
  let benchmarkReturn = 0;
  let benchmarkTimeSeries = [];
  if (benchFiltered.length > 0) {
    const startBench = benchFiltered[0].close;
    benchmarkTimeSeries = benchFiltered.map(d => ({
      date: d.date,
      return: Math.round(((d.close - startBench) / startBench) * 10000) / 100,
    }));
    benchmarkReturn = benchmarkTimeSeries[benchmarkTimeSeries.length - 1].return;
  }

  // Write output
  await fs.mkdir(OUT_DIR, { recursive: true });

  const portfolioJson = {
    portfolio: {
      title: settings.portfolio.title,
      subtitle: settings.portfolio.subtitle,
      description: settings.portfolio.description,
      disclaimer: settings.portfolio.disclaimer,
      lastUpdated: settings.updatedAt,
    },
    summary: {
      totalValue: Math.round(totalValue * 100) / 100,
      totalReturn: Math.round(totalGainLossPercent * 100) / 100,
      holdingsCount: holdingDetails.length,
      returnYtd: calculateTWR(ytdStartDate),
      return1yr: calculateTWR(oneYearAgo),
      return3yr: calculateTWR(threeYearsAgo),
    },
    holdings: holdingDetails.map(({ marketValue, ...rest }) => rest),
    allocation: { bySector },
    ytdChart,
    ytdComparison: { portfolio: portfolioSeries, spy: spySeries },
  };

  const performanceJson = {
    portfolio: { timeSeries: [], totalReturn: Math.round(totalGainLossPercent * 100) / 100 },
    benchmark: { timeSeries: benchmarkTimeSeries, totalReturn: Math.round(benchmarkReturn * 100) / 100 },
    relativePerformance: Math.round((totalGainLossPercent - benchmarkReturn) * 100) / 100,
  };

  await fs.writeFile(path.join(OUT_DIR, 'portfolio.json'), JSON.stringify(portfolioJson, null, 2));
  await fs.writeFile(path.join(OUT_DIR, 'performance.json'), JSON.stringify(performanceJson, null, 2));

  console.log(`Generated static data: ${holdingDetails.length} holdings`);
  console.log(`  Output: ${OUT_DIR}`);
}

main().catch(err => {
  console.error('Failed to generate static data:', err);
  process.exit(1);
});
