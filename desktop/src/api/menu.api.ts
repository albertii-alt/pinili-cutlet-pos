import apiClient from './client';
import { MenuItem } from '../types';

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data } = await apiClient.get('/api/menu');
  return data;
}

export async function addMenuItem(payload: FormData): Promise<MenuItem> {
  const { data } = await apiClient.post('/api/menu', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateMenuItem(id: number, payload: FormData): Promise<MenuItem> {
  const { data } = await apiClient.put(`/api/menu/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteMenuItem(id: number): Promise<void> {
  await apiClient.delete(`/api/menu/${id}`);
}

export async function toggleAvailability(id: number): Promise<{ id: number; is_available: number }> {
  const { data } = await apiClient.patch(`/api/menu/${id}/availability`);
  return data;
}

export async function bulkToggleAvailability(categoryId: number, isAvailable: boolean): Promise<void> {
  await apiClient.patch('/api/menu/bulk-availability', { categoryId, isAvailable });
}

export async function toggleFeatured(id: number): Promise<{ id: number; is_featured: number }> {
  const { data } = await apiClient.patch(`/api/menu/${id}/featured`);
  return data;
}

export async function setPromoPrice(
  id: number,
  promoPrice: number | null,
  promoLabel?: string | null,
): Promise<MenuItem> {
  const { data } = await apiClient.patch(`/api/menu/${id}/promo`, { promoPrice, promoLabel });
  return data;
}

export async function uploadImage(file: File): Promise<{ image_path: string }> {
  const form = new FormData();
  form.append('image', file);
  const { data } = await apiClient.post('/api/menu/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
