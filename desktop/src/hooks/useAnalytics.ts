import { useState, useEffect } from 'react';
import { getSummary, getDailySales, getBestSellers, getRevenueByPayment } from '../api/analytics.api';
import { AnalyticsSummary, DailySales, BestSeller, RevenueByPayment } from '../types';
import { toDateParam } from '../utils/formatDate';

export function useAnalytics(date?: string) {
  const [summary, setSummary]               = useState<AnalyticsSummary | null>(null);
  const [dailySales, setDailySales]         = useState<DailySales[]>([]);
  const [bestSellers, setBestSellers]       = useState<BestSeller[]>([]);
  const [revenueByPayment, setRevenueByPayment] = useState<RevenueByPayment[]>([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    const target = date ?? toDateParam();
    setLoading(true);

    Promise.all([
      getSummary(target),
      getDailySales(),
      getBestSellers(),
      getRevenueByPayment(),
    ])
      .then(([s, ds, bs, rp]) => {
        setSummary(s);
        setDailySales(ds);
        setBestSellers(bs);
        setRevenueByPayment(rp);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  return { summary, dailySales, bestSellers, revenueByPayment, loading };
}
