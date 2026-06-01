import { useState, useEffect } from 'react';
import {
  getSummary, getDailySales, getBestSellers, getRevenueByPayment,
  getPeakHours, getCategorySales, getAverageOrderValue,
} from '../api/analytics.api';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales } from '../types';

export type AnalyticsPeriod = 'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function useAnalytics(period: AnalyticsPeriod = 'today', dateRange?: DateRange) {
  const [summary, setSummary]                   = useState<AnalyticsSummary | null>(null);
  const [dailySales, setDailySales]             = useState<DailySales[]>([]);
  const [bestSellers, setBestSellers]           = useState<BestSeller[]>([]);
  const [revenueByPayment, setRevenueByPayment] = useState<RevenueByPayment[]>([]);
  const [peakHours, setPeakHours]               = useState<PeakHour[]>([]);
  const [categorySales, setCategorySales]       = useState<CategorySales[]>([]);
  const [avgOrderValue, setAvgOrderValue]       = useState<number>(0);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    // Don't fetch if custom period is selected but dates aren't set yet
    if (period === 'custom' && (!dateRange?.startDate || !dateRange?.endDate)) return;

    setLoading(true);

    Promise.all([
      getSummary(period, dateRange),
      getDailySales(),
      getBestSellers(undefined, period, dateRange),
      getRevenueByPayment(),
      getPeakHours(period, dateRange),
      getCategorySales(period, dateRange),
      getAverageOrderValue(period, dateRange),
    ])
      .then(([s, ds, bs, rp, ph, cs, aov]) => {
        setSummary(s);
        setDailySales(ds);
        setBestSellers(bs);
        setRevenueByPayment(rp);
        setPeakHours(ph);
        setCategorySales(cs);
        setAvgOrderValue(aov?.avg_order_value ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, dateRange?.startDate, dateRange?.endDate]);

  return { summary, dailySales, bestSellers, revenueByPayment, peakHours, categorySales, avgOrderValue, loading };
}
