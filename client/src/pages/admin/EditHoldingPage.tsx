import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHolding, updateHolding, deleteHolding, getTransactions, deleteTransaction } from '../../api/holdings';

interface TransactionRow {
  id: string;
  type: string;
  quantity: number;
  price: number;
  date: string;
  totalCost: number;
  notes: string;
  createdAt: string;
}

export default function EditHoldingPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', assetType: 'Stock',
    quantity: '', averageCost: '', purchaseDate: '',
    sector: '', notes: '', isPublic: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  useEffect(() => {
    if (!ticker) return;
    getHolding(ticker).then((data) => {
      const h = data.holding;
      setForm({
        companyName: h.companyName, assetType: h.assetType,
        quantity: String(h.quantity), averageCost: String(h.averageCost),
        purchaseDate: h.purchaseDate, sector: h.sector,
        notes: h.notes, isPublic: h.isPublic,
      });
      setLoading(false);
    }).catch(() => { setError('Holding not found'); setLoading(false); });
    getTransactions(ticker).then((data) => {
      setTransactions(data.transactions);
    }).catch(() => { /* ignore */ });
  }, [ticker]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    setError('');
    setSaving(true);
    try {
      await updateHolding(ticker, {
        companyName: form.companyName, assetType: form.assetType,
        quantity: parseFloat(form.quantity), averageCost: parseFloat(form.averageCost),
        purchaseDate: form.purchaseDate, sector: form.sector,
        notes: form.notes, isPublic: form.isPublic,
      });
      navigate('/admin/holdings');
    } catch {
      setError('Failed to update holding');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!ticker) return;
    await deleteHolding(ticker);
    navigate('/admin/holdings');
  };

  if (loading) return <div><div className="page-header"><h1>Edit Holding</h1></div><p>Loading...</p></div>;

  return (
    <div>
      <div className="page-header"><h1>Edit {ticker}</h1></div>
      <div className="card" style={{ maxWidth: 600 }}>
        {error && <div className="login-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input id="companyName" type="text" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="assetType">Asset Type *</label>
            <select id="assetType" value={form.assetType} onChange={(e) => handleChange('assetType', e.target.value)}>
              <option>Stock</option><option>ETF</option><option>Mutual Fund</option><option>Bond</option><option>Other</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input id="quantity" type="number" step="any" min="0.0001" value={form.quantity} onChange={(e) => handleChange('quantity', e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="averageCost">Average Cost ($) *</label>
              <input id="averageCost" type="number" step="0.01" min="0" value={form.averageCost} onChange={(e) => handleChange('averageCost', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="purchaseDate">Purchase Date *</label>
            <input id="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} required max={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label htmlFor="sector">Sector</label>
            <select id="sector" value={form.sector} onChange={(e) => handleChange('sector', e.target.value)}>
              <option value="">Select sector...</option>
              <option>Technology</option><option>Healthcare</option><option>Finance</option>
              <option>Consumer Discretionary</option><option>Consumer Staples</option><option>Energy</option>
              <option>Industrials</option><option>Materials</option><option>Utilities</option>
              <option>Real Estate</option><option>Communication Services</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} maxLength={500} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Public Visibility</span>
              <label className="toggle"><input type="checkbox" checked={form.isPublic} onChange={(e) => handleChange('isPublic', e.target.checked)} /><span className="toggle-slider"></span></label>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-danger" onClick={() => setShowDelete(true)}>Delete</button>
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/holdings')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      {transactions.length > 0 && (
        <div className="card" style={{ maxWidth: 600, marginTop: 24 }}>
          <h2 style={{ marginBottom: 16 }}>Transaction History</h2>
          <table className="data-table" aria-label="Transaction history">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Type</th>
                <th scope="col">Qty</th>
                <th scope="col">Price</th>
                <th scope="col">Total</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td><span style={{ textTransform: 'capitalize', fontWeight: 600, color: tx.type === 'buy' ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)' }}>{tx.type}</span></td>
                  <td>{tx.quantity}</td>
                  <td>${(tx.price ?? 0).toFixed(2)}</td>
                  <td>${(tx.totalCost ?? 0).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-danger" style={{ height: 28, fontSize: 12, padding: '0 8px' }} onClick={async () => {
                      if (!confirm('Delete this transaction?')) return;
                      try {
                        await deleteTransaction(ticker!, tx.id);
                        setTransactions(prev => prev.filter(t => t.id !== tx.id));
                      } catch { /* ignore */ }
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>Delete {ticker}</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
