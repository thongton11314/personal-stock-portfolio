import apiClient from './client';

export async function login(username: string, password: string) {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
}

export async function verifyToken() {
  const response = await apiClient.post('/auth/verify');
  return response.data;
}
