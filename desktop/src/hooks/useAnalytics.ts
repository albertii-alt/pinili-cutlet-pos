import { useState, useEffect } from 'react';
import {
  getSummary, getDailySales, getBestSellers, getRevenueByPayment,
  getPeakHours, getCategorySales, getAverageOrderValue, getMonthlySales,
} from '../api/analytics.api';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales, MonthlySales } from '../types';

export type AnalyticsPeriod = 'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function useAnalytics(period: AnalyticsPeriod = 'today', dateRange?: DateRange, year?: string) {
  const [summary, setSummary]                   = useState<AnalyticsSummary | null>(null);
  const [dailySales, setDailySales]             = useState<DailySales[]>([]);
  const [bestSellers, setBestSellers]           = useState<BestSeller[]>([]);
  const [revenueByPayment, setRevenueByPayment] = useState<RevenueByPayment[]>([]);
  const [peakHours, setPeakHours]               = useState<PeakHour[]>([]);
  const [categorySales, setCategorySales]       = useState<CategorySales[]>([]);
  const [monthlySales, setMonthlySales]         = useState<MonthlySales[]>([]);
  const [avgOrderValue, setAvgOrderValue]       = useState<number>(0);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    // Don't fetch if custom period is selected but dates aren't set yet
    if (period === 'custom' && (!dateRange?.startDate || !dateRange?.endDate)) return;

    setLoading(true);

    const y = period === 'all' ? year : undefined;

    Promise.all([
      getSummary(period, dateRange, y),
      getDailySales(),
      getBestSellers(undefined, period, dateRange, y),
      getRevenueByPayment(),
      getPeakHours(period, dateRange, y),
      getCategorySales(period, dateRange, y),
      getAverageOrderValue(period, dateRange, y),
      getMonthlySales(period, dateRange, y),
    ])
      .then(([s, ds, bs, rp, ph, cs, aov, ms]) => {
        setSummary(s);
        setDailySales(ds);
        setBestSellers(bs);
        setRevenueByPayment(rp);
        setPeakHours(ph);
        setCategorySales(cs);
        setAvgOrderValue(aov?.avg_order_value ?? 0);
        setMonthlySales(ms);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, dateRange?.startDate, dateRange?.endDate, year]);

  return { summary, dailySales, bestSellers, revenueByPayment, peakHours, categorySales, monthlySales, avgOrderValue, loading };
}
