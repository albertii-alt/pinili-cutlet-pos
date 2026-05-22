import apiClient from './client';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment } from '../types';

export async function getSummary(date?: string): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get('/api/analytics/summary', { params: { date } });
  return data;
}

export async function getDailySales(): Promise<DailySales[]> {
  const { data } = await apiClient.get('/api/analytics/sales');
  return data;
}

export async function getBestSellers(limit?: number): Promise<BestSeller[]> {
  const { data } = await apiClient.get('/api/analytics/best-sellers', { params: { limit } });
  return data;
}

export async function getRevenueByPayment(): Promise<RevenueByPayment[]> {
  const { data } = await apiClient.get('/api/analytics/revenue');
  return data;
}
