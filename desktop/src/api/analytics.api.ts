import apiClient from './client';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales } from '../types';
import { AnalyticsPeriod } from '../hooks/useAnalytics';

function periodParams(period: AnalyticsPeriod) {
  return period === 'today' ? {} : { period };
}

export async function getSummary(period: AnalyticsPeriod = 'today'): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get('/api/analytics/summary', { params: periodParams(period) });
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

export async function getPeakHours(period: AnalyticsPeriod = 'today'): Promise<PeakHour[]> {
  const { data } = await apiClient.get('/api/analytics/peak-hours', { params: periodParams(period) });
  return data;
}

export async function getCategorySales(period: AnalyticsPeriod = 'today'): Promise<CategorySales[]> {
  const { data } = await apiClient.get('/api/analytics/category-sales', { params: periodParams(period) });
  return data;
}

export async function getAverageOrderValue(period: AnalyticsPeriod = 'today'): Promise<{ avg_order_value: number; total_orders: number }> {
  const { data } = await apiClient.get('/api/analytics/average-order-value', { params: periodParams(period) });
  return data;
}
