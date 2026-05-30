import { useState } from 'react';
import { IconCalendar, IconReportMoney, IconShoppingCart, IconTag, IconTrendingUp, IconChartBar } from '@tabler/icons-react';
import { useAnalytics, type AnalyticsPeriod, type DateRange } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatCurrency';
import SalesCard from '../../components/owner/SalesCard';
import SalesChart from '../../components/owner/SalesChart';
import PeakHoursChart from '../../components/owner/PeakHoursChart';
import CategorySalesChart from '../../components/owner/CategorySalesChart';
import DateRangePicker, { type DateRangeValue } from '../../components/shared/DateRangePicker';
import EmptyState from '../../components/shared/EmptyState';

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Today',      value: 'today'  },
  { label: 'This Week',  value: 'week'   },
  { label: 'This Month', value: 'month'  },
  { label: 'Custom',     value: 'custom' },
];

export default function AnalyticsPage() {
  const [period, setPeriod]               = useState<AnalyticsPeriod>('today');
  const [dateRange, setDateRange]         = useState<DateRangeValue>({ startDate: '', endDate: '' });
  const [appliedRange, setAppliedRange]   = useState<DateRange | null>(null);

  // Reset applied range when switching away from custom
  function handlePeriodChange(p: AnalyticsPeriod) {
    setPeriod(p);
    if (p !== 'custom') setAppliedRange(null);
  }

  const {
    summary, dailySales, bestSellers,
    peakHours, categorySales, avgOrderValue, loading,
  } = useAnalytics(period, appliedRange ?? undefined);

  const topCategory = categorySales[0]?.category ?? '—';

  // Show picker prompt when custom is selected but no range applied yet
  const awaitingRange = period === 'custom' && !appliedRange;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header + period filter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <IconChartBar size={18} color="#C0392B" />
          <h1 className="text-white font-semibold text-lg">Analytics</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => handlePeriodChange(p.value)}
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

      {/* Custom date range picker — shown only when Custom is selected */}
      {period === 'custom' && (
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          onApply={range => setAppliedRange({ startDate: range.startDate, endDate: range.endDate })}
        />
      )}

      {awaitingRange ? (
        <EmptyState icon={<IconCalendar size={48} color="#2C2C2C" />} message="Select a date range" subtitle="Choose a start and end date, then press Apply" />
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', width: '100%' }}>
            <SalesCard label="Total Revenue"    value={formatCurrency(summary?.total_sales ?? 0)}  accent isZero={!summary?.total_sales}                icon={IconReportMoney} />
            <SalesCard label="Avg Order Value"  value={formatCurrency(avgOrderValue)}              isZero={!avgOrderValue}                             icon={IconTrendingUp} />
            <SalesCard label="Top Category"     value={topCategory}                                isZero={categorySales.length === 0}                 icon={IconTag} />
            <SalesCard label="Total Orders"     value={String(summary?.total_orders ?? 0)}         isZero={!summary?.total_orders}                     icon={IconShoppingCart} />
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
