import apiClient from './client';

export async function getDashboard() {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
}

export async function refreshMarketData() {
  const response = await apiClient.post('/admin/market/refresh');
  return response.data;
}

export async function getMarketStatus() {
  const response = await apiClient.get('/admin/market/status');
  return response.data;
}

export async function searchSymbol(query: string) {
  const response = await apiClient.get(`/admin/market/search/${query}`);
  return response.data;
}

export async function getPerformance(params?: Record<string, string>) {
  const response = await apiClient.get('/admin/performance', { params });
  return response.data;
}

export async function getSettings() {
  const response = await apiClient.get('/admin/settings');
  return response.data;
}

export async function updateSettings(data: Record<string, unknown>) {
  const response = await apiClient.put('/admin/settings', data);
  return response.data;
}

export async function publishPortfolio() {
  const response = await apiClient.post('/admin/publish');
  return response.data;
}

export async function unpublishPortfolio() {
  const response = await apiClient.post('/admin/unpublish');
  return response.data;
}

export async function getPublicPortfolio() {
  const response = await apiClient.get('/public/portfolio');
  return response.data;
}

export async function getPublicPerformance(params?: Record<string, string>) {
  const response = await apiClient.get('/public/performance', { params });
  return response.data;
}
