import apiClient from './client';
import { CashDrawer } from '../types';

export interface DrawerHistoryParams {
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface DrawerHistoryResponse {
  data: CashDrawer[];
  total: number;
  limit: number;
  offset: number;
}

export async function getTodayDrawer(): Promise<CashDrawer> {
  const { data } = await apiClient.get('/api/cash-drawer/today');
  return data;
}

export async function setOpeningAmount(amount: number): Promise<CashDrawer> {
  const { data } = await apiClient.put('/api/cash-drawer/opening', { amount });
  return data;
}

export async function closeDrawer(actualAmount: number, notes?: string): Promise<CashDrawer> {
  const { data } = await apiClient.put('/api/cash-drawer/close', {
    actual_amount: actualAmount,
    notes: notes ?? null,
  });
  return data;
}

export async function getDrawerHistory(params: DrawerHistoryParams = {}): Promise<DrawerHistoryResponse> {
  const { data } = await apiClient.get('/api/cash-drawer/history', { params });
  return data;
}
