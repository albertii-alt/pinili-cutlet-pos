import { useState, useEffect } from 'react';
import { IconReportMoney, IconShoppingCart, IconCash, IconDeviceMobile, IconMoon } from '@tabler/icons-react';
import { useAnalytics, type AnalyticsPeriod } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatCurrency';
import SalesCard from '../../components/owner/SalesCard';
import SalesChart from '../../components/owner/SalesChart';
import BestSellerList from '../../components/owner/BestSellerList';
import EndOfDayModal from '../../components/owner/EndOfDayModal';
import DailySalesTarget from '../../components/owner/DailySalesTarget';
import { getDailyTarget } from '../../api/analytics.api';

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Today',      value: 'today' },
  { label: 'This Week',  value: 'week'  },
  { label: 'This Month', value: 'month' },
];

export default function DashboardPage() {
  const [period, setPeriod]         = useState<AnalyticsPeriod>('today');
  const [showEOD, setShowEOD]       = useState(false);
  const [dailyTarget, setDailyTarget] = useState<number>(0);
  const { summary, dailySales, bestSellers, loading } = useAnalytics(period);

  // Fetch daily target once on mount
  useEffect(() => {
    getDailyTarget().then(setDailyTarget).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + filters + EOD button */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-semibold text-lg">Dashboard</h1>
        <div className="flex items-center gap-2">
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

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* End of Day button */}
          <button
            onClick={() => setShowEOD(true)}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#A0A0A0',
              fontSize: 13,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}
          >
            <IconMoon size={14} />
            End of Day
          </button>
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

          {/* Daily sales target — only shown on Today period */}
          {period === 'today' && (
            <DailySalesTarget
              totalSales={summary?.total_sales ?? 0}
              dailyTarget={dailyTarget}
              onTargetUpdated={setDailyTarget}
            />
          )}

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

      {showEOD && <EndOfDayModal onClose={() => setShowEOD(false)} />}
    </div>
  );
}
