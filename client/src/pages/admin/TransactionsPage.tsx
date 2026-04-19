import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTransactions, deleteTransaction } from '../../api/holdings';

interface TransactionRow {
  id: string;
  ticker: string;
  type: string;
  quantity: number;
  price: number;
  date: string;
  totalCost: number;
  notes: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadTransactions = () => {
    getAllTransactions()
      .then((data) => setTransactions(data.transactions))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTransactions(); }, []);

  const handleDelete = async (ticker: string, id: string) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(ticker, id);
      loadTransactions();
    } catch { /* ignore */ }
  };

  const filtered = transactions.filter(tx =>
    tx.ticker.toLowerCase().includes(search.toLowerCase())
  );

  const totalInvested = filtered
    .filter(tx => tx.type === 'buy')
    .reduce((sum, tx) => sum + tx.totalCost, 0);

  const totalSold = filtered
    .filter(tx => tx.type === 'sell')
    .reduce((sum, tx) => sum + tx.totalCost, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Transaction History</h1>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by ticker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search transactions"
        />
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary, #666)' }}>Total Transactions</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{filtered.length}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary, #666)' }}>Total Invested</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>${totalInvested.toFixed(2)}</div>
        </div>
        {totalSold > 0 && (
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary, #666)' }}>Total Sold</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>${totalSold.toFixed(2)}</div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card"><p>Loading transactions...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No transactions match your search.' : 'No transactions recorded yet.'}</p>
        </div>
      ) : (
        <table className="data-table" aria-label="All transactions">
          <caption className="sr-only">Transaction history across all holdings</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Ticker</th>
              <th scope="col">Type</th>
              <th scope="col">Quantity</th>
              <th scope="col">Price</th>
              <th scope="col">Total</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>
                  <Link to={`/admin/holdings/${tx.ticker}/edit`}>
                    <strong>{tx.ticker}</strong>
                  </Link>
                </td>
                <td>
                  <span style={{
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    color: tx.type === 'buy' ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)',
                  }}>
                    {tx.type}
                  </span>
                </td>
                <td>{tx.quantity}</td>
                <td>${(tx.price ?? 0).toFixed(2)}</td>
                <td>${(tx.totalCost ?? 0).toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger" style={{ height: 28, fontSize: 12, padding: '0 8px' }} onClick={() => handleDelete(tx.ticker, tx.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
