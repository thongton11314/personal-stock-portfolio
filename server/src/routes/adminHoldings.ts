import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as dataService from '../services/dataService';
import * as auditService from '../services/auditService';

const router = Router();

// Get all transactions across all tickers (must be before /:ticker routes)
router.get('/transactions/all', async (_req: AuthRequest, res: Response) => {
  try {
    const transactions = await dataService.getAllTransactions();
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// List holdings
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let holdings = await dataService.listHoldings();

    // Filters
    const { status, sector, visibility, sort, order } = req.query;
    if (status && status !== 'all') {
      holdings = holdings.filter(h => h.status === status);
    }
    if (sector && sector !== 'all') {
      holdings = holdings.filter(h => h.sector === sector);
    }
    if (visibility === 'public') {
      holdings = holdings.filter(h => h.isPublic);
    } else if (visibility === 'hidden') {
      holdings = holdings.filter(h => !h.isPublic);
    }

    // Sort
    if (sort) {
      const sortKey = sort as keyof typeof holdings[0];
      const sortOrder = order === 'desc' ? -1 : 1;
      holdings.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal) * sortOrder;
        if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * sortOrder;
        return 0;
      });
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const total = holdings.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = holdings.slice((page - 1) * limit, page * limit);

    res.json({
      holdings: paginated,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list holdings' });
  }
});

// Get single holding
router.get('/:ticker', async (req: AuthRequest, res: Response) => {
  try {
    const holding = await dataService.getHolding(req.params.ticker);
    if (!holding) {
      res.status(404).json({ error: 'Holding not found' });
      return;
    }
    res.json({ holding });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get holding' });
  }
});

// Create holding
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const holding = await dataService.createHolding(req.body);
    await auditService.appendAuditEntry('ADD_HOLDING', req.user?.username || 'admin', {
      Holding: holding.ticker,
      Details: `Added ${holding.companyName}, ${holding.quantity} shares at $${holding.averageCost}`,
    });
    res.status(201).json({ holding });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Update holding
router.put('/:ticker', async (req: AuthRequest, res: Response) => {
  try {
    const holding = await dataService.updateHolding(req.params.ticker, req.body);
    await auditService.appendAuditEntry('UPDATE_HOLDING', req.user?.username || 'admin', {
      Holding: holding.ticker,
      Fields: Object.keys(req.body).join(', '),
    });
    res.json({ holding });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Delete holding
router.delete('/:ticker', async (req: AuthRequest, res: Response) => {
  try {
    await dataService.deleteHoldingFile(req.params.ticker);
    await auditService.appendAuditEntry('DELETE_HOLDING', req.user?.username || 'admin', {
      Holding: req.params.ticker,
    });
    res.json({ message: 'Holding deleted' });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Toggle visibility
router.patch('/:ticker/visibility', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await dataService.getHolding(req.params.ticker);
    if (!existing) {
      res.status(404).json({ error: 'Holding not found' });
      return;
    }
    const holding = await dataService.updateHolding(req.params.ticker, {
      isPublic: !existing.isPublic,
    });
    res.json({ holding });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Update status (archive/activate)
router.patch('/:ticker/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (status !== 'active' && status !== 'archived') {
      res.status(400).json({ error: 'Status must be active or archived' });
      return;
    }
    const holding = await dataService.updateHolding(req.params.ticker, { status });
    await auditService.appendAuditEntry('STATUS_CHANGE', req.user?.username || 'admin', {
      Holding: req.params.ticker,
      Status: status,
    });
    res.json({ holding });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

// Reorder holdings
router.put('/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const { orders } = req.body as { orders: Array<{ ticker: string; displayOrder: number }> };
    if (!orders || !Array.isArray(orders)) {
      res.status(400).json({ error: 'orders array required' });
      return;
    }
    for (const item of orders) {
      await dataService.updateHolding(item.ticker, { displayOrder: item.displayOrder });
    }
    res.json({ message: 'Holdings reordered' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder holdings' });
  }
});

// Get transactions for a specific ticker
router.get('/:ticker/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await dataService.getTransactionsForTicker(req.params.ticker);
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Delete a transaction
router.delete('/:ticker/transactions/:transactionId', async (req: AuthRequest, res: Response) => {
  try {
    await dataService.deleteTransaction(req.params.ticker, req.params.transactionId);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    const error = err as Error & { status?: number };
    res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;
