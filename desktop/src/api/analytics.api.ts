import apiClient from './client';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales, PaymentBreakdown } from '../types';
import { AnalyticsPeriod } from '../hooks/useAnalytics';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

function periodParams(period: AnalyticsPeriod, dateRange?: DateRangeParams) {
  if (period === 'custom' && dateRange?.startDate && dateRange?.endDate) {
    return { startDate: dateRange.startDate, endDate: dateRange.endDate };
  }
  return period === 'today' ? {} : { period };
}

export async function getSummary(period: AnalyticsPeriod = 'today', dateRange?: DateRangeParams): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get('/api/analytics/summary', { params: periodParams(period, dateRange) });
  return data;
}

export async function getDailySales(): Promise<DailySales[]> {
  const { data } = await apiClient.get('/api/analytics/sales');
  return data;
}

export async function getBestSellers(limit?: number, period: AnalyticsPeriod = 'today', dateRange?: DateRangeParams): Promise<BestSeller[]> {
  const { data } = await apiClient.get('/api/analytics/best-sellers', { params: { limit, ...periodParams(period, dateRange) } });
  return data;
}

export async function getRevenueByPayment(): Promise<RevenueByPayment[]> {
  const { data } = await apiClient.get('/api/analytics/revenue');
  return data;
}

export async function getPeakHours(period: AnalyticsPeriod = 'today', dateRange?: DateRangeParams): Promise<PeakHour[]> {
  const { data } = await apiClient.get('/api/analytics/peak-hours', { params: periodParams(period, dateRange) });
  return data;
}

export async function getCategorySales(period: AnalyticsPeriod = 'today', dateRange?: DateRangeParams): Promise<CategorySales[]> {
  const { data } = await apiClient.get('/api/analytics/category-sales', { params: periodParams(period, dateRange) });
  return data;
}

export async function getAverageOrderValue(period: AnalyticsPeriod = 'today', dateRange?: DateRangeParams): Promise<{ avg_order_value: number; total_orders: number }> {
  const { data } = await apiClient.get('/api/analytics/average-order-value', { params: periodParams(period, dateRange) });
  return data;
}

export interface EndOfDaySummary {
  date: string;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  payment_breakdown: PaymentBreakdown[];
  top_items: { menu_item_id: number; item_name: string; total_quantity: number; total_revenue: number }[];
}

export async function getEndOfDaySummary(): Promise<EndOfDaySummary> {
  const { data } = await apiClient.get('/api/analytics/end-of-day');
  return data;
}

export async function getDailyTarget(): Promise<number> {
  const { data } = await apiClient.get('/api/analytics/daily-target');
  return data.daily_target;
}

export async function setDailyTarget(target: number): Promise<number> {
  const { data } = await apiClient.put('/api/analytics/daily-target', { target });
  return data.daily_target;
}
