import { useState, useEffect } from 'react';
import {
  getSummary, getDailySales, getBestSellers, getRevenueByPayment,
  getPeakHours, getCategorySales, getAverageOrderValue,
} from '../api/analytics.api';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment, PeakHour, CategorySales } from '../types';

export type AnalyticsPeriod = 'today' | 'week' | 'month';

export function useAnalytics(period: AnalyticsPeriod = 'today') {
  const [summary, setSummary]                   = useState<AnalyticsSummary | null>(null);
  const [dailySales, setDailySales]             = useState<DailySales[]>([]);
  const [bestSellers, setBestSellers]           = useState<BestSeller[]>([]);
  const [revenueByPayment, setRevenueByPayment] = useState<RevenueByPayment[]>([]);
  const [peakHours, setPeakHours]               = useState<PeakHour[]>([]);
  const [categorySales, setCategorySales]       = useState<CategorySales[]>([]);
  const [avgOrderValue, setAvgOrderValue]       = useState<number>(0);
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      getSummary(period),
      getDailySales(),
      getBestSellers(),
      getRevenueByPayment(),
      getPeakHours(period),
      getCategorySales(period),
      getAverageOrderValue(period),
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
  }, [period]);

  return { summary, dailySales, bestSellers, revenueByPayment, peakHours, categorySales, avgOrderValue, loading };
}
