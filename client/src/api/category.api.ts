import apiClient from './client';
import type { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get('/api/categories');
  return data;
}
