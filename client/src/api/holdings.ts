import apiClient from './client';

export async function lookupTicker(ticker: string) {
  const response = await apiClient.get(`/admin/market/lookup/${ticker}`);
  return response.data as { symbol: string; name: string; assetType: string; sector: string; industry: string };
}

export async function fetchHistoricalPrice(ticker: string, date: string) {
  const response = await apiClient.get(`/admin/market/price/${ticker}/${date}`);
  return response.data as { ticker: string; date: string; price: number };
}

export async function getHoldings(params?: Record<string, string>) {
  const response = await apiClient.get('/admin/holdings', { params });
  return response.data;
}

export async function getHolding(ticker: string) {
  const response = await apiClient.get(`/admin/holdings/${ticker}`);
  return response.data;
}

export async function createHolding(data: Record<string, unknown>) {
  const response = await apiClient.post('/admin/holdings', data);
  return response.data;
}

export async function updateHolding(ticker: string, data: Record<string, unknown>) {
  const response = await apiClient.put(`/admin/holdings/${ticker}`, data);
  return response.data;
}

export async function deleteHolding(ticker: string) {
  const response = await apiClient.delete(`/admin/holdings/${ticker}`);
  return response.data;
}

export async function toggleVisibility(ticker: string) {
  const response = await apiClient.patch(`/admin/holdings/${ticker}/visibility`);
  return response.data;
}

export async function updateStatus(ticker: string, status: string) {
  const response = await apiClient.patch(`/admin/holdings/${ticker}/status`, { status });
  return response.data;
}

export async function getTransactions(ticker: string) {
  const response = await apiClient.get(`/admin/holdings/${ticker}/transactions`);
  return response.data;
}

export async function getAllTransactions() {
  const response = await apiClient.get('/admin/holdings/transactions/all');
  return response.data;
}

export async function deleteTransaction(ticker: string, transactionId: string) {
  const response = await apiClient.delete(`/admin/holdings/${ticker}/transactions/${transactionId}`);
  return response.data;
}
