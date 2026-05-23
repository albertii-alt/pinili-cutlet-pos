import { useState } from 'react';
import { IconReportMoney, IconShoppingCart, IconTag, IconTrendingUp } from '@tabler/icons-react';
import { useAnalytics, type AnalyticsPeriod } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatCurrency';
import SalesCard from '../../components/owner/SalesCard';
import SalesChart from '../../components/owner/SalesChart';
import PeakHoursChart from '../../components/owner/PeakHoursChart';
import CategorySalesChart from '../../components/owner/CategorySalesChart';

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Today',      value: 'today' },
  { label: 'This Week',  value: 'week'  },
  { label: 'This Month', value: 'month' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('today');
  const {
    summary, dailySales, bestSellers,
    peakHours, categorySales, avgOrderValue, loading,
  } = useAnalytics(period);

  const topCategory = categorySales[0]?.category ?? '—';

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header + period filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">Analytics</h1>
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
            <SalesCard label="Total Revenue"    value={formatCurrency(summary?.total_sales ?? 0)}  accent icon={IconReportMoney} />
            <SalesCard label="Avg Order Value"  value={formatCurrency(avgOrderValue)}              icon={IconTrendingUp} />
            <SalesCard label="Top Category"     value={topCategory}                                icon={IconTag} />
            <SalesCard label="Total Orders"     value={String(summary?.total_orders ?? 0)}         icon={IconShoppingCart} />
          </div>

          {/* Sales chart + Category donut */}
          <div className="flex items-stretch gap-4">
            <div className="flex-1">
              <SalesChart data={dailySales} />
            </div>
            <div className="w-[340px] shrink-0">
              <CategorySalesChart data={categorySales} />
            </div>
          </div>

          {/* Peak hours — full width */}
          <PeakHoursChart data={peakHours} />

          {/* Best sellers — full width */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-textGray text-xs uppercase tracking-wider mb-3">Best Sellers</p>
            <div className="flex flex-col">
              {bestSellers.length === 0 ? (
                <p className="text-textMuted text-sm text-center py-6">No data yet</p>
              ) : (
                bestSellers.map((item, index) => (
                  <div
                    key={item.menu_item_id}
                    className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
                    style={index === 0 ? { backgroundColor: 'rgba(244,196,48,0.04)', borderRadius: 6 } : undefined}
                  >
                    <span
                      className="text-sm font-bold w-6 text-center shrink-0"
                      style={{ color: index === 0 ? '#F4C430' : '#606060' }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className="flex-1 text-sm truncate"
                      style={{ color: index === 0 ? '#F4C430' : '#ffffff' }}
                    >
                      {item.item_name}
                    </span>
                    <span className="text-textGray text-xs">{item.total_quantity}x sold</span>
                    <span className="text-primary text-sm font-medium" style={{ minWidth: 70, textAlign: 'right' }}>
                      {formatCurrency(item.total_revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
