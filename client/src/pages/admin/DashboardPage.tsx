import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, refreshMarketData } from '../../api/portfolio';
import { formatCurrency, formatPercent, formatDateTime, getValueClass } from '../../utils/format';

interface DashboardData {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdingsCount: number;
  benchmarkReturn: number;
  portfolioReturn: number;
  relativePerformance: number;
  lastRefresh: string | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const result = await getDashboard();
      setData(result);
      setError('');
    } catch {
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMarketData();
      await loadDashboard();
    } catch {
      setError('Failed to refresh market data.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="metric-cards">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card"><div className="metric-label">Loading...</div><div className="metric-value">--</div></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="card">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadDashboard} style={{ marginTop: 16 }}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data || data.holdingsCount === 0) {
    return (
      <div>
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="empty-state">
          <p>No holdings yet. Add your first holding to get started.</p>
          <Link to="/admin/holdings/new" className="btn btn-primary">Add Holding</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="metric-cards">
        <div className="metric-card">
          <div className="metric-label">Total Value</div>
          <div className="metric-value">{formatCurrency(data.totalValue)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Gain/Loss</div>
          <div className={`metric-value ${getValueClass(data.totalGainLoss)}`}>
            {formatCurrency(data.totalGainLoss)} ({formatPercent(data.totalGainLossPercent)})
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Daily Change</div>
          <div className={`metric-value ${getValueClass(data.dailyChange)}`}>
            {formatCurrency(data.dailyChange)} ({formatPercent(data.dailyChangePercent)})
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Holdings</div>
          <div className="metric-value">{data.holdingsCount}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Benchmark Comparison</h3>
        <div style={{ display: 'flex', gap: 32 }}>
          <div>
            <div className="metric-label">Portfolio Return</div>
            <div className={getValueClass(data.portfolioReturn)} style={{ fontSize: 20, fontWeight: 600 }}>
              {formatPercent(data.portfolioReturn)}
            </div>
          </div>
          <div>
            <div className="metric-label">S&P 500 Return</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {formatPercent(data.benchmarkReturn)}
            </div>
          </div>
          <div>
            <div className="metric-label">Relative Performance</div>
            <div className={getValueClass(data.relativePerformance)} style={{ fontSize: 20, fontWeight: 600 }}>
              {formatPercent(data.relativePerformance)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/admin/holdings/new" className="btn btn-primary">Add Holding</Link>
        <Link to="/admin/preview" className="btn btn-secondary">View Public Page</Link>
        <Link to="/admin/settings" className="btn btn-secondary">Settings</Link>
      </div>

      {data.lastRefresh && (
        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-muted)' }}>
          Market data as of {formatDateTime(data.lastRefresh)}
        </p>
      )}
    </div>
  );
}
