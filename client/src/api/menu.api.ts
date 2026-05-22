import apiClient from './client';
import { MenuItem } from '../types';

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data } = await apiClient.get('/api/menu');
  return data;
}
