import path from 'path';
import { Holding, CreateHoldingRequest, UpdateHoldingRequest, Settings, Transaction } from '@portfolio/shared';
import {
  readJSON, writeJSON, fileExists, listFiles, deleteFile,
  getHoldingsDir, getSettingsPath, getTransactionsDir, ensureDir
} from '../utils/fileSystem';

export async function listHoldings(): Promise<Holding[]> {
  const dir = getHoldingsDir();
  await ensureDir(dir);
  const files = await listFiles(dir);
  const holdings: Holding[] = [];

  for (const file of files) {
    const holding = await readJSON<Holding>(path.join(dir, file));
    holdings.push(holding);
  }

  return holdings.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getHolding(ticker: string): Promise<Holding | null> {
  const filePath = path.join(getHoldingsDir(), `${ticker.toUpperCase()}.json`);
  if (!(await fileExists(filePath))) return null;
  return readJSON<Holding>(filePath);
}

export async function createHolding(data: CreateHoldingRequest): Promise<Holding> {
  const ticker = data.ticker.toUpperCase();
  const filePath = path.join(getHoldingsDir(), `${ticker}.json`);

  await ensureDir(getHoldingsDir());
  const now = new Date().toISOString();

  // Record the buy transaction
  await addTransaction({
    ticker,
    type: 'buy',
    quantity: data.quantity,
    price: data.averageCost,
    date: data.purchaseDate,
    totalCost: Math.round(data.quantity * data.averageCost * 100) / 100,
    notes: data.notes || '',
  });

  // If holding already exists, merge: add quantity and compute weighted average cost
  if (await fileExists(filePath)) {
    const existing = await readJSON<Holding>(filePath);
    const oldTotal = existing.quantity * existing.averageCost;
    const newTotal = data.quantity * data.averageCost;
    const combinedQty = existing.quantity + data.quantity;
    const weightedAvgCost = Math.round(((oldTotal + newTotal) / combinedQty) * 100) / 100;

    const merged: Holding = {
      ...existing,
      quantity: combinedQty,
      averageCost: weightedAvgCost,
      // Keep the earlier purchase date
      purchaseDate: existing.purchaseDate < data.purchaseDate ? existing.purchaseDate : data.purchaseDate,
      updatedAt: now,
    };

    await writeJSON(filePath, merged);
    return merged;
  }

  const holding: Holding = {
    id: `${ticker.toLowerCase()}-${Date.now()}`,
    ticker,
    companyName: data.companyName,
    assetType: data.assetType,
    quantity: data.quantity,
    averageCost: data.averageCost,
    purchaseDate: data.purchaseDate,
    sector: data.sector || '',
    notes: data.notes || '',
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
    displayOrder: data.displayOrder || 0,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await writeJSON(filePath, holding);
  return holding;
}

export async function updateHolding(ticker: string, data: UpdateHoldingRequest): Promise<Holding> {
  const existing = await getHolding(ticker);
  if (!existing) {
    const error = new Error(`Holding ${ticker} not found`) as Error & { status: number };
    error.status = 404;
    throw error;
  }

  const updated: Holding = {
    ...existing,
    ...data,
    ticker: existing.ticker,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const filePath = path.join(getHoldingsDir(), `${ticker.toUpperCase()}.json`);
  await writeJSON(filePath, updated);
  return updated;
}

export async function deleteHoldingFile(ticker: string): Promise<void> {
  const filePath = path.join(getHoldingsDir(), `${ticker.toUpperCase()}.json`);
  if (!(await fileExists(filePath))) {
    const error = new Error(`Holding ${ticker} not found`) as Error & { status: number };
    error.status = 404;
    throw error;
  }
  await deleteFile(filePath);
}

// --- Transaction storage ---

export async function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  const dir = path.join(getTransactionsDir(), tx.ticker.toUpperCase());
  await ensureDir(dir);

  const transaction: Transaction = {
    ...tx,
    id: `${tx.ticker.toLowerCase()}-${tx.type}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const filePath = path.join(dir, `${transaction.id}.json`);
  await writeJSON(filePath, transaction);
  return transaction;
}

export async function getTransactionsForTicker(ticker: string): Promise<Transaction[]> {
  const dir = path.join(getTransactionsDir(), ticker.toUpperCase());
  await ensureDir(dir);
  const files = await listFiles(dir);
  const transactions: Transaction[] = [];

  for (const file of files) {
    const tx = await readJSON<Transaction>(path.join(dir, file));
    transactions.push(tx);
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const baseDir = getTransactionsDir();
  await ensureDir(baseDir);

  let allDirs: string[];
  try {
    const { readdir } = await import('fs/promises');
    const entries = await readdir(baseDir, { withFileTypes: true });
    allDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return [];
  }

  const transactions: Transaction[] = [];
  for (const dir of allDirs) {
    const txs = await getTransactionsForTicker(dir);
    transactions.push(...txs);
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteTransaction(ticker: string, transactionId: string): Promise<void> {
  const filePath = path.join(getTransactionsDir(), ticker.toUpperCase(), `${transactionId}.json`);
  if (!(await fileExists(filePath))) {
    const error = new Error(`Transaction ${transactionId} not found`) as Error & { status: number };
    error.status = 404;
    throw error;
  }
  await deleteFile(filePath);
}

export async function getSettings(): Promise<Settings> {
  const filePath = getSettingsPath();
  if (!(await fileExists(filePath))) {
    return getDefaultSettings();
  }
  return readJSON<Settings>(filePath);
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  const existing = await getSettings();
  const updated: Settings = {
    ...existing,
    ...data,
    portfolio: { ...existing.portfolio, ...data.portfolio },
    publicPage: { ...existing.publicPage, ...data.publicPage },
    benchmark: { ...existing.benchmark, ...data.benchmark },
    auth: existing.auth,
    updatedAt: new Date().toISOString(),
  };
  await writeJSON(getSettingsPath(), updated);
  return updated;
}

function getDefaultSettings(): Settings {
  return {
    portfolio: {
      title: 'My Portfolio',
      subtitle: '',
      description: '',
      disclaimer: 'For informational purposes only. Not investment advice.',
    },
    benchmark: {
      symbol: 'SPY',
      name: 'S&P 500 (SPY)',
    },
    publicPage: {
      isPublished: false,
      slug: 'portfolio',
      seoTitle: 'Portfolio',
      seoDescription: '',
    },
    auth: {
      username: 'admin',
      passwordHash: '',
    },
    updatedAt: new Date().toISOString(),
  };
}
