import { useState } from 'react';
import { IconReportMoney, IconShoppingCart, IconCash, IconDeviceMobile } from '@tabler/icons-react';
import { useAnalytics, type AnalyticsPeriod } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatCurrency';
import SalesCard from '../../components/owner/SalesCard';
import SalesChart from '../../components/owner/SalesChart';
import BestSellerList from '../../components/owner/BestSellerList';

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Today',      value: 'today' },
  { label: 'This Week',  value: 'week'  },
  { label: 'This Month', value: 'month' },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('today');
  const { summary, dailySales, bestSellers, loading } = useAnalytics(period);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + period filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">Dashboard</h1>
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p.value
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-textGray hover:bg-cardLight'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3">
            <SalesCard label="Total Sales"  value={formatCurrency(summary?.total_sales ?? 0)}  accent icon={IconReportMoney} />
            <SalesCard label="Total Orders" value={String(summary?.total_orders ?? 0)}          icon={IconShoppingCart} />
            <SalesCard label="Cash Sales"   value={formatCurrency(summary?.cash_sales ?? 0)}   icon={IconCash} />
            <SalesCard label="GCash Sales"  value={formatCurrency(summary?.gcash_sales ?? 0)}  icon={IconDeviceMobile} />
          </div>

          {/* Chart + best sellers */}
          <div className="flex items-stretch gap-4">
            <div className="flex-1">
              <SalesChart data={dailySales} />
            </div>
            <div className="w-[380px] shrink-0">
              <BestSellerList items={bestSellers} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
