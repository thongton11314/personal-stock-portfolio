import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPerformance } from '../../api/portfolio';
import { formatPercent, getValueClass } from '../../utils/format';

export default function PerformancePage() {
  const [data, setData] = useState<{ portfolio: { timeSeries: Array<{ date: string; return: number }> }; benchmark: { timeSeries: Array<{ date: string; return: number }> }; comparison: { portfolioReturn: number; benchmarkReturn: number; relativePerformance: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerformance().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div><div className="page-header"><h1>Performance</h1></div><p>Loading...</p></div>;
  if (!data) return <div><div className="page-header"><h1>Performance</h1></div><p>Unable to load performance data.</p></div>;

  // Merge portfolio and benchmark time series by date
  const allDates = Array.from(new Set([
    ...data.portfolio.timeSeries.map(p => p.date),
    ...data.benchmark.timeSeries.map(p => p.date),
  ])).sort();

  const portfolioMap = new Map(data.portfolio.timeSeries.map(p => [p.date, p.return]));
  const benchmarkMap = new Map(data.benchmark.timeSeries.map(p => [p.date, p.return]));

  const chartData = allDates.map(date => ({
    date,
    ...(portfolioMap.has(date) ? { portfolio: Math.round(portfolioMap.get(date)! * 100) / 100 } : {}),
    ...(benchmarkMap.has(date) ? { benchmark: Math.round(benchmarkMap.get(date)! * 100) / 100 } : {}),
  }));

  return (
    <div>
      <div className="page-header"><h1>Performance</h1></div>

      <div className="metric-cards">
        <div className="metric-card">
          <div className="metric-label">Portfolio Return</div>
          <div className={`metric-value ${getValueClass(data.comparison.portfolioReturn)}`}>
            {formatPercent(data.comparison.portfolioReturn)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">S&P 500 Return</div>
          <div className="metric-value">{formatPercent(data.comparison.benchmarkReturn)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Relative Performance</div>
          <div className={`metric-value ${getValueClass(data.comparison.relativePerformance)}`}>
            {formatPercent(data.comparison.relativePerformance)}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Portfolio vs S&P 500</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} aria-label={`Performance chart. Portfolio returned ${formatPercent(data.comparison.portfolioReturn)} vs S&P 500 at ${formatPercent(data.comparison.benchmarkReturn)}`}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} stroke="#2563eb" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} stroke="#6b7280" />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="portfolio" name="Portfolio" stroke="#2563eb" dot={false} strokeWidth={2} connectNulls />
              <Line yAxisId="right" type="monotone" dataKey="benchmark" name="S&P 500" stroke="#6b7280" strokeDasharray="5 5" dot={false} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
