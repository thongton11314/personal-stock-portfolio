import { useState, useEffect } from 'react';
import { getPublicPortfolio, getPublicPerformance } from '../api/portfolio';
import { formatCurrency, formatPercent, getValueClass } from '../utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './PublicPortfolioPage.css';

interface PublicData {
  portfolio: { title: string; subtitle: string; description: string; disclaimer: string; lastUpdated: string };
  summary: { totalValue: number; totalReturn: number; holdingsCount: number; returnYtd: number | null; return1yr: number | null; return3yr: number | null };
  holdings: Array<{
    ticker: string; companyName: string; sector: string;
    weight: number; averagePrice: number; peakPrice: number | null; currentPrice: number; cumulativeReturn: number;
    firstBuyDate: string; lastBuyDate: string; notes: string;
  }>;
  allocation: { bySector: Array<{ sector: string; weight: number }> };
  ytdChart: Array<{ ticker: string; data: Array<{ date: string; return: number }> }>;
  ytdComparison: {
    portfolio: Array<{ date: string; return: number }>;
    spy: Array<{ date: string; return: number }>;
  };
}

export default function PublicPortfolioPage() {
  const [data, setData] = useState<PublicData | null>(null);
  const [perfData, setPerfData] = useState<{ benchmark: { timeSeries: Array<{ date: string; return: number }> }; portfolio: { totalReturn: number }; relativePerformance: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [holdingSort, setHoldingSort] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    Promise.all([
      getPublicPortfolio().catch(() => null),
      getPublicPerformance().catch(() => null),
    ]).then(([portfolio, performance]) => {
      if (!portfolio) {
        setNotFound(true);
      } else {
        setData(portfolio);
        setPerfData(performance);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="public-page"><div className="public-container"><p>Loading...</p></div></div>;
  if (notFound) return <div className="public-page"><div className="public-container"><h1>Page not found</h1><p>This portfolio page is not available.</p></div></div>;
  if (!data) return null;

  const chartData = perfData?.benchmark.timeSeries.map(p => ({
    date: p.date,
    benchmark: Math.round(p.return * 100) / 100,
  })) || [];

  return (
    <div className="public-page">
      <a href="#main-content" className="skip-link">Skip to content</a>

      <header className="public-hero" role="banner">
        <div className="public-container">
          <h1>{data.portfolio.title}</h1>
          {data.portfolio.subtitle && <p className="public-subtitle">{data.portfolio.subtitle}</p>}
          <div className="hero-metrics">
            <span className={getValueClass(data.summary.totalReturn)}>
              Total Return: {formatPercent(data.summary.totalReturn)}
            </span>
            <span>{data.summary.holdingsCount} Holdings</span>
          </div>
          <p className="public-updated">Last updated: {new Date(data.portfolio.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
      </header>

      <main id="main-content">
        <section className="public-section" aria-labelledby="overview-heading">
          <div className="public-container">
            <h2 id="overview-heading">Portfolio Overview</h2>
            <p className="portfolio-notice">This portfolio tracks individual stock positions held in a public brokerage account only. Index funds, ETFs (except single-asset ETFs), and other diversified holdings are excluded. This represents a high-conviction, concentrated segment of the overall investment strategy — not the total portfolio.</p>
            <div className="public-metrics">
              <div className="public-metric" title="Total Return = (Current Market Value − Total Cost Basis) ÷ Total Cost Basis. Cost basis is the total amount invested (quantity × average purchase price per share). This is a simple return that shows how much the portfolio has gained or lost relative to the money invested.">
                <div className="metric-label">Total Return</div>
                <div className={`metric-value ${getValueClass(data.summary.totalReturn)}`}>{formatPercent(data.summary.totalReturn)}</div>
              </div>
              {data.summary.returnYtd != null && (
                <div className="public-metric" title="YTD Return uses the Time-Weighted Return (TWR) method since January 1st. TWR chains daily sub-period returns at each transaction date, neutralizing the effect of cash deposits. This measures pure investment performance regardless of when money was added or withdrawn.">
                  <div className="metric-label">YTD Return</div>
                  <div className={`metric-value ${getValueClass(data.summary.returnYtd)}`}>{formatPercent(data.summary.returnYtd)}</div>
                </div>
              )}
              {data.summary.return1yr != null && (
                <div className="public-metric" title="1Y Return uses the Time-Weighted Return (TWR) method over the past 12 months. TWR splits the period into sub-periods at each buy/sell transaction, computes the return for each sub-period, then chains them: TWR = (1+r₁)(1+r₂)...(1+rₙ) − 1. This is the industry standard (GIPS-compliant) method used by fund managers.">
                  <div className="metric-label">1Y Return</div>
                  <div className={`metric-value ${getValueClass(data.summary.return1yr)}`}>{formatPercent(data.summary.return1yr)}</div>
                </div>
              )}
              {data.summary.return3yr != null && (
                <div className="public-metric" title="3Y Return uses the Time-Weighted Return (TWR) method over the past 3 years (or since inception if the portfolio is younger). TWR neutralizes cash flows so the return reflects investment skill, not the timing or size of deposits.">
                  <div className="metric-label">3Y Return</div>
                  <div className={`metric-value ${getValueClass(data.summary.return3yr)}`}>{formatPercent(data.summary.return3yr)}</div>
                </div>
              )}
              <div className="public-metric" title="Total number of active stock holdings in the portfolio.">
                <div className="metric-label">Holdings</div>
                <div className="metric-value">{data.summary.holdingsCount}</div>
              </div>
            </div>

            {data.allocation.bySector.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3>Allocation by Sector</h3>
                <div className="sector-bars">
                  {data.allocation.bySector.map(s => (
                    <div key={s.sector} className="sector-bar-row">
                      <span className="sector-label">{s.sector}</span>
                      <div className="sector-bar-track">
                        <div className="sector-bar-fill" style={{ width: `${s.weight}%` }} />
                      </div>
                      <span className="sector-weight">{s.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="public-section" aria-labelledby="holdings-heading">
          <div className="public-container">
            <h2 id="holdings-heading">Holdings</h2>
            <p className="portfolio-notice">The positions shown reflect current active holdings only. Previously sold positions and past sell transactions are not displayed.</p>

            {data.holdings.length > 0 && (() => {
              const PIE_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#e11d48', '#0d9488'];
              const pieData = data.holdings.map(h => ({ name: h.ticker, value: h.weight }));
              const renderLabel = ({ name, value }: { name: string; value: number }) => `${name} ${value.toFixed(1)}%`;
              return (
                <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={renderLabel} labelLine={true}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            {(() => {
              const handleHoldingSort = (field: string) => {
                if (holdingSort?.field === field) {
                  setHoldingSort({ field, dir: holdingSort.dir === 'asc' ? 'desc' : 'asc' });
                } else {
                  setHoldingSort({ field, dir: 'asc' });
                }
              };
              const si = (field: string) => holdingSort?.field === field ? (holdingSort.dir === 'asc' ? ' ▲' : ' ▼') : '';

              const sortedHoldings = [...data.holdings].sort((a, b) => {
                if (!holdingSort) return 0;
                const f = holdingSort.field;
                let aVal: string | number, bVal: string | number;
                if (['weight', 'averagePrice', 'peakPrice', 'currentPrice', 'cumulativeReturn'].includes(f)) {
                  aVal = (a as Record<string, unknown>)[f] as number ?? 0;
                  bVal = (b as Record<string, unknown>)[f] as number ?? 0;
                  return holdingSort.dir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
                }
                aVal = String((a as Record<string, unknown>)[f] ?? '').toLowerCase();
                bVal = String((b as Record<string, unknown>)[f] ?? '').toLowerCase();
                const cmp = aVal.localeCompare(bVal as string);
                return holdingSort.dir === 'asc' ? cmp : -cmp;
              });

              return (
            <table className="data-table" aria-label="Portfolio holdings">
              <caption className="sr-only">Portfolio holdings showing allocation and details</caption>
              <thead>
                <tr>
                  <th scope="col" onClick={() => handleHoldingSort('ticker')} style={{ cursor: 'pointer' }}>Ticker{si('ticker')}</th>
                  <th scope="col" onClick={() => handleHoldingSort('companyName')} style={{ cursor: 'pointer' }}>Company{si('companyName')}</th>
                  <th scope="col" onClick={() => handleHoldingSort('sector')} style={{ cursor: 'pointer' }}>Sector{si('sector')}</th>
                  <th scope="col" className="numeric" onClick={() => handleHoldingSort('weight')} style={{ cursor: 'pointer' }}>Weight{si('weight')}</th>
                  <th scope="col" onClick={() => handleHoldingSort('firstBuyDate')} style={{ cursor: 'pointer' }}>First Day Bought{si('firstBuyDate')}</th>
                  <th scope="col" onClick={() => handleHoldingSort('lastBuyDate')} style={{ cursor: 'pointer' }}>Last Day Buy{si('lastBuyDate')}</th>
                  <th scope="col" className="numeric" onClick={() => handleHoldingSort('averagePrice')} style={{ cursor: 'pointer' }}>Average Price{si('averagePrice')}</th>
                  <th scope="col" className="numeric" onClick={() => handleHoldingSort('peakPrice')} style={{ cursor: 'pointer' }}>Peak After First Buy{si('peakPrice')}</th>
                  <th scope="col" className="numeric" onClick={() => handleHoldingSort('currentPrice')} style={{ cursor: 'pointer' }}>Current Price{si('currentPrice')}</th>
                  <th scope="col" className="numeric" onClick={() => handleHoldingSort('cumulativeReturn')} style={{ cursor: 'pointer' }}>Cumulative Return{si('cumulativeReturn')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map(h => (
                  <tr key={h.ticker}>
                    <td><strong>{h.ticker}</strong></td>
                    <td>{h.companyName}</td>
                    <td>{h.sector || '--'}</td>
                    <td className="numeric">{h.weight.toFixed(1)}%</td>
                    <td>{h.firstBuyDate ? new Date(h.firstBuyDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '--'}</td>
                    <td>{h.lastBuyDate ? new Date(h.lastBuyDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '--'}</td>
                    <td className="numeric">{formatCurrency(h.averagePrice)}</td>
                    <td className="numeric">{h.peakPrice != null ? formatCurrency(h.peakPrice) : '--'}</td>
                    <td className="numeric">{formatCurrency(h.currentPrice)}</td>
                    <td className={`numeric ${getValueClass(h.cumulativeReturn)}`}>{formatPercent(h.cumulativeReturn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              );
            })()}
          </div>
        </section>

        {(chartData.length > 0 || (data.ytdComparison && (data.ytdComparison.portfolio.length > 0 || data.ytdComparison.spy.length > 0))) && (
          <section className="public-section" aria-labelledby="performance-heading">
            <div className="public-container">
              <h2 id="performance-heading">Performance</h2>

              {data.ytdComparison && (data.ytdComparison.portfolio.length > 0 || data.ytdComparison.spy.length > 0) && (() => {
                const allDates = Array.from(new Set([
                  ...data.ytdComparison.portfolio.map(d => d.date),
                  ...data.ytdComparison.spy.map(d => d.date),
                ])).sort();
                const mergedData = allDates.map(date => {
                  const pEntry = data.ytdComparison.portfolio.find(d => d.date === date);
                  const sEntry = data.ytdComparison.spy.find(d => d.date === date);
                  return {
                    date,
                    ...(pEntry ? { portfolio: pEntry.return } : {}),
                    ...(sEntry ? { spy: sEntry.return } : {}),
                  };
                });
                let lastLabel = '';
                const formatMonth = (date: string) => {
                  const d = new Date(date + 'T00:00:00');
                  const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  if (label === lastLabel) return '';
                  lastLabel = label;
                  return label;
                };
                return (
                  <div className="card">
                    <h3>Portfolio vs S&P 500 (12 Months)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={mergedData} aria-label="Portfolio vs S&P 500 12-month performance chart">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatMonth} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} stroke="#2563eb" />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} stroke="#9ca3af" />
                        <Tooltip formatter={(v: number, name: string) => [`${v.toFixed(2)}%`, name]} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="portfolio" name="My Portfolio" stroke="#2563eb" dot={false} strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="spy" name="S&P 500" stroke="#9ca3af" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              {data.ytdChart && data.ytdChart.length > 0 && (() => {
                const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];
                const allDates = Array.from(new Set(data.ytdChart.flatMap(s => s.data.map(d => d.date)))).sort();
                const mergedData = allDates.map(date => {
                  const point: Record<string, string | number> = { date };
                  for (const series of data.ytdChart) {
                    const entry = series.data.find(d => d.date === date);
                    if (entry) point[series.ticker] = entry.return;
                  }
                  return point;
                });

                let lastLabel2 = '';
                const formatMonth2 = (date: string) => {
                  const d = new Date(date + 'T00:00:00');
                  const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  if (label === lastLabel2) return '';
                  lastLabel2 = label;
                  return label;
                };
                return (
                  <div className="card" aria-labelledby="ytd-chart-heading">
                    <h3 id="ytd-chart-heading">Holdings Performance (12 Months)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={mergedData} aria-label="12-month holdings performance chart">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatMonth2} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                        <Legend />
                        {data.ytdChart.map((series, i) => (
                          <Line key={series.ticker} type="monotone" dataKey={series.ticker} name={series.ticker} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        <section className="public-section methodology" aria-labelledby="methodology-heading">
          <div className="public-container">
            <h2 id="methodology-heading">Methodology</h2>
            <div className="card">
              <h3>Data Source</h3>
              <p>Market data provided by Alpha Vantage. Prices may be delayed up to 24 hours on trading days.</p>

              <h3>Return Calculation</h3>
              <p><strong>Total Return</strong> is calculated as the percentage change from total cost basis (quantity × average purchase price) to current market value. This is a simple return that shows overall gain or loss on invested capital.</p>
              <p><strong>YTD, 1Y, and 3Y Returns</strong> use the Time-Weighted Return (TWR) method — the industry standard used by fund managers and required by GIPS (Global Investment Performance Standards). TWR splits the measurement period into sub-periods at each cash flow event (buy or sell transaction). The return for each sub-period is calculated independently, then chained together: TWR = (1+r₁)(1+r₂)...(1+rₙ) − 1. This neutralizes the effect of cash deposits and withdrawals, measuring pure investment performance regardless of when money was added.</p>
              <p>All returns use price returns only (dividends not included). If the portfolio is younger than the requested period (e.g., 3Y for a 2-year-old portfolio), the return is calculated from the date of the first transaction.</p>

              <h3>Benchmark</h3>
              <p>The S&P 500 benchmark is represented by SPY (SPDR S&P 500 ETF Trust). SPY tracks the S&P 500 index with minimal tracking error.</p>

              {data.portfolio.disclaimer && (
                <>
                  <h3>Disclaimer</h3>
                  <p>{data.portfolio.disclaimer}</p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
