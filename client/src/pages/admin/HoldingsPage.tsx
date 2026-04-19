import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHoldings, deleteHolding, toggleVisibility, updateStatus } from '../../api/holdings';

interface HoldingRow {
  ticker: string;
  companyName: string;
  sector: string;
  quantity: number;
  averageCost: number;
  isPublic: boolean;
  status: string;
  displayOrder: number;
}

export default function HoldingsPage() {
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'ticker' | 'companyName' | 'sector' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const loadHoldings = async () => {
    try {
      setLoading(true);
      const data = await getHoldings({ status: statusFilter });
      setHoldings(data.holdings);
    } catch {
      // error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHoldings(); }, [statusFilter]);

  const filtered = holdings.filter(h =>
    h.ticker.toLowerCase().includes(search.toLowerCase()) ||
    h.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = (a[sortField] || '').toLowerCase();
    const bVal = (b[sortField] || '').toLowerCase();
    const cmp = aVal.localeCompare(bVal);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (field: 'ticker' | 'companyName' | 'sector') => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortIndicator = (field: string) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  const handleToggleVisibility = async (ticker: string) => {
    await toggleVisibility(ticker);
    loadHoldings();
  };

  const handleArchive = async (ticker: string) => {
    await updateStatus(ticker, 'archived');
    loadHoldings();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteHolding(deleteTarget);
    setDeleteTarget(null);
    loadHoldings();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Holdings</h1>
        <Link to="/admin/holdings/new" className="btn btn-primary">Add Holding</Link>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by ticker or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search holdings"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="card"><p>Loading holdings...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No holdings match your search.' : 'No holdings found. Add your first holding.'}</p>
          {!search && <Link to="/admin/holdings/new" className="btn btn-primary">Add Holding</Link>}
        </div>
      ) : (
        <table className="data-table" aria-label="Holdings">
          <caption className="sr-only">Portfolio holdings</caption>
          <thead>
            <tr>
              <th scope="col" onClick={() => handleSort('ticker')} style={{ cursor: 'pointer' }}>Ticker{sortIndicator('ticker')}</th>
              <th scope="col" onClick={() => handleSort('companyName')} style={{ cursor: 'pointer' }}>Company{sortIndicator('companyName')}</th>
              <th scope="col" onClick={() => handleSort('sector')} style={{ cursor: 'pointer' }}>Sector{sortIndicator('sector')}</th>
              <th scope="col">Visibility</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => (
              <tr key={h.ticker}>
                <td><strong>{h.ticker}</strong></td>
                <td>{h.companyName}</td>
                <td>{h.sector || '--'}</td>
                <td>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={h.isPublic}
                      onChange={() => handleToggleVisibility(h.ticker)}
                      aria-label={`Toggle visibility for ${h.ticker}`}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/admin/holdings/${h.ticker}/edit`} className="btn btn-secondary" style={{ height: 32, fontSize: 13 }}>
                      Edit
                    </Link>
                    {h.status === 'active' && (
                      <button className="btn btn-secondary" style={{ height: 32, fontSize: 13 }} onClick={() => handleArchive(h.ticker)}>
                        Archive
                      </button>
                    )}
                    <button className="btn btn-danger" style={{ height: 32, fontSize: 13 }} onClick={() => setDeleteTarget(h.ticker)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Delete Holding</h3>
            <p>Are you sure you want to delete {deleteTarget}? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
