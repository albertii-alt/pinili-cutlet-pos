import apiClient from './client';
import { User } from '../types';

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await apiClient.post('/api/auth/login', { username, password });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}
