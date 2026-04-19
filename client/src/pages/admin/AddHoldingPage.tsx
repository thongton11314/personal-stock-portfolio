import { useState, useCallback, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHolding, lookupTicker, fetchHistoricalPrice } from '../../api/holdings';

const SECTOR_MAP: Record<string, string> = {
  'TECHNOLOGY': 'Technology',
  'HEALTH CARE': 'Healthcare',
  'HEALTHCARE': 'Healthcare',
  'FINANCE': 'Finance',
  'FINANCIAL SERVICES': 'Finance',
  'CONSUMER DISCRETIONARY': 'Consumer Discretionary',
  'CONSUMER CYCLICAL': 'Consumer Discretionary',
  'CONSUMER STAPLES': 'Consumer Staples',
  'CONSUMER DEFENSIVE': 'Consumer Staples',
  'ENERGY': 'Energy',
  'INDUSTRIALS': 'Industrials',
  'BASIC MATERIALS': 'Materials',
  'MATERIALS': 'Materials',
  'UTILITIES': 'Utilities',
  'REAL ESTATE': 'Real Estate',
  'COMMUNICATION SERVICES': 'Communication Services',
};

function mapAssetType(avType: string): string {
  const t = avType.toUpperCase();
  if (t.includes('ETF')) return 'ETF';
  if (t.includes('MUTUAL') || t.includes('FUND')) return 'Mutual Fund';
  if (t.includes('BOND') || t.includes('FIXED')) return 'Bond';
  return 'Stock';
}

export default function AddHoldingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ticker: '', companyName: '', assetType: 'Stock',
    quantity: '', averageCost: '', purchaseDate: '',
    sector: '', notes: '', isPublic: true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTickerLookup = useCallback((ticker: string) => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (ticker.length < 1) return;

    lookupTimer.current = setTimeout(async () => {
      setLookingUp(true);
      try {
        const data = await lookupTicker(ticker);
        setForm(prev => ({
          ...prev,
          companyName: data.name || prev.companyName,
          assetType: mapAssetType(data.assetType) || prev.assetType,
          sector: SECTOR_MAP[data.sector?.toUpperCase()] || prev.sector,
        }));
      } catch {
        // Lookup failed — user can fill manually
      } finally {
        setLookingUp(false);
      }
    }, 600);
  }, []);

  const fetchPrice = useCallback((ticker: string, date: string) => {
    if (priceTimer.current) clearTimeout(priceTimer.current);
    if (!ticker || !date) return;

    priceTimer.current = setTimeout(async () => {
      setFetchingPrice(true);
      try {
        const data = await fetchHistoricalPrice(ticker.toUpperCase(), date);
        setForm(prev => ({ ...prev, averageCost: String(data.price) }));
      } catch {
        // Price fetch failed — user can fill manually
      } finally {
        setFetchingPrice(false);
      }
    }, 400);
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'ticker' && typeof value === 'string') {
        handleTickerLookup(value.toUpperCase());
        if (prev.purchaseDate) fetchPrice(value, prev.purchaseDate);
      }
      if (field === 'purchaseDate' && typeof value === 'string') {
        if (prev.ticker) fetchPrice(prev.ticker, value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await createHolding({
        ticker: form.ticker.toUpperCase(),
        companyName: form.companyName,
        assetType: form.assetType,
        quantity: parseFloat(form.quantity),
        averageCost: parseFloat(form.averageCost),
        purchaseDate: form.purchaseDate,
        sector: form.sector,
        notes: form.notes,
        isPublic: form.isPublic,
      });
      navigate('/admin/holdings');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to save holding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Holding</h1>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        {error && <div className="login-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ticker">Ticker *</label>
            <div style={{ position: 'relative' }}>
              <input id="ticker" type="text" value={form.ticker} onChange={(e) => handleChange('ticker', e.target.value)} required style={{ textTransform: 'uppercase' }} />
              {lookingUp && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50)', fontSize: 12, color: 'var(--text-secondary, #666)' }}>Looking up...</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input id="companyName" type="text" value={form.companyName} readOnly placeholder={lookingUp ? 'Auto-filling...' : 'Enter ticker to auto-fill'} />
          </div>

          <div className="form-group">
            <label htmlFor="assetType">Asset Type *</label>
            <input id="assetType" type="text" value={form.assetType} readOnly />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input id="quantity" type="number" step="any" min="0.0001" value={form.quantity} onChange={(e) => handleChange('quantity', e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="averageCost">Average Cost ($) *</label>
              <div style={{ position: 'relative' }}>
                <input id="averageCost" type="number" step="0.01" min="0" value={form.averageCost} readOnly placeholder={fetchingPrice ? 'Fetching price...' : 'Select date to auto-fill'} />
                {fetchingPrice && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-secondary, #666)' }}>Fetching...</span>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purchaseDate">Purchase Date *</label>
            <input id="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} required max={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="form-group">
            <label htmlFor="sector">Sector</label>
            <input id="sector" type="text" value={form.sector} readOnly placeholder="Enter ticker to auto-fill" />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} maxLength={500} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Public Visibility</span>
              <label className="toggle">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => handleChange('isPublic', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/holdings')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
