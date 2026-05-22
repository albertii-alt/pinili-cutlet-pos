import { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatCurrency';
import { toDateParam } from '../../utils/formatDate';
import SalesCard from '../../components/owner/SalesCard';
import SalesChart from '../../components/owner/SalesChart';
import BestSellerList from '../../components/owner/BestSellerList';

const periods = [
  { label: 'Today',      value: toDateParam() },
  { label: 'Yesterday',  value: toDateParam(new Date(Date.now() - 86400000)) },
];

export default function DashboardPage() {
  const [date, setDate] = useState(periods[0].value);
  const { summary, dailySales, bestSellers, loading } = useAnalytics(date);

  return (
    <div className="flex flex-col gap-6 max-w-[960px]">
      {/* Header + period filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">Dashboard</h1>
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setDate(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                date === p.value
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
            <SalesCard label="Total Sales"   value={formatCurrency(summary?.total_sales ?? 0)}  accent />
            <SalesCard label="Total Orders"  value={String(summary?.total_orders ?? 0)} />
            <SalesCard label="Cash Sales"    value={formatCurrency(summary?.cash_sales ?? 0)} />
            <SalesCard label="GCash Sales"   value={formatCurrency(summary?.gcash_sales ?? 0)} />
          </div>

          {/* Chart + best sellers */}
          <div className="grid grid-cols-[1fr_320px] gap-4">
            <SalesChart data={dailySales} />
            <BestSellerList items={bestSellers} />
          </div>
        </>
      )}
    </div>
  );
}
