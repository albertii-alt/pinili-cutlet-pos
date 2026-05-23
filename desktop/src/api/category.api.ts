import apiClient from './client';
import { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get('/api/categories');
  return data;
}

export async function addCategory(name: string): Promise<Category> {
  const { data } = await apiClient.post('/api/categories', { name });
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/categories/${id}`);
}

export async function renameCategory(id: number, name: string): Promise<Category> {
  const { data } = await apiClient.patch(`/api/categories/${id}/rename`, { name });
  return data;
}
