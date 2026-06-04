import { useState, useEffect, useMemo } from 'react';
import { IconReportMoney, IconShoppingCart, IconCreditCard, IconMoon, IconTrendingUp, IconTrendingDown, IconLayoutDashboard, IconCalendar } from '@tabler/icons-react';
import { useAnalytics, type AnalyticsPeriod, type DateRange } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatCurrency';
import SalesCard from '../../components/owner/SalesCard';
import SalesChart from '../../components/owner/SalesChart';
import BestSellerList from '../../components/owner/BestSellerList';
import EndOfDayModal from '../../components/owner/EndOfDayModal';
import DailySalesTarget from '../../components/owner/DailySalesTarget';
import CashDrawerCard from '../../components/owner/CashDrawerCard';
import DateRangePicker, { type DateRangeValue } from '../../components/shared/DateRangePicker';
import YearSelector from '../../components/shared/YearSelector';
import { getDailyTarget, getAvailableYears } from '../../api/analytics.api';
import { getExpenseSummary } from '../../api/expense.api';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { useAuthStore } from '../../store/useAuthStore';

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'All',        value: 'all'        },
  { label: 'Today',      value: 'today'      },
  { label: 'This Week',  value: 'week'       },
  { label: 'This Month', value: 'month'      },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom',     value: 'custom'     },
];

export default function DashboardPage() {
  const currentYear                           = String(new Date().getFullYear());
  const [period, setPeriod]                   = useState<AnalyticsPeriod>('today');
  const [showEOD, setShowEOD]                 = useState(false);
  const [dailyTarget, setDailyTarget]         = useState<number>(0);
  const [todayExpenses, setTodayExpenses]     = useState<number>(0);
  const [dateRange, setDateRange]             = useState<DateRangeValue>({ startDate: '', endDate: '' });
  const [appliedRange, setAppliedRange]       = useState<DateRange | null>(null);
  const [selectedYear, setSelectedYear]       = useState<string>(currentYear);
  const [availableYears, setAvailableYears]   = useState<string[]>([]);
  const { summary, dailySales, bestSellers, loading } = useAnalytics(period, appliedRange ?? undefined, selectedYear);
  const { getMethodColor, getMethodLogoUrl } = usePaymentMethods();
  const { user } = useAuthStore();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // One-shot entrance animation — only plays right after login
  const [animate] = useState(() => sessionStorage.getItem('just_logged_in') === '1');

  // Fetch available years once on mount
  useEffect(() => {
    getAvailableYears().then(setAvailableYears).catch(console.error);
  }, []);

  function handlePeriodChange(p: AnalyticsPeriod) {
    setPeriod(p);
    if (p !== 'custom') setAppliedRange(null);
    if (p !== 'all') setSelectedYear(currentYear);
  }

  // Fetch daily target once on mount
  useEffect(() => {
    getDailyTarget().then(setDailyTarget).catch(console.error);
  }, []);

  // Fetch today's expenses whenever period changes (only used for Today card)
  useEffect(() => {
    getExpenseSummary({ period: 'today' })
      .then(s => setTodayExpenses(s.total))
      .catch(() => setTodayExpenses(0));
  }, [period]);

  const awaitingRange = period === 'custom' && !appliedRange;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header + filters + EOD button */}
      <div className={`flex items-center justify-between ${animate ? 'dashboard-enter dashboard-enter-1' : ''}`}>
        <div className="flex items-center gap-2">
          <IconLayoutDashboard size={18} color="var(--accent-color, #C0392B)" />
          <h1 className="text-white font-semibold text-lg" style={{ margin: 0 }}>Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {period === 'all' && (
            <YearSelector
              years={availableYears}
              selectedYear={selectedYear}
              onChange={setSelectedYear}
            />
          )}
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

      {/* Custom date range picker */}
      {period === 'custom' && (
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          onApply={range => setAppliedRange({ startDate: range.startDate, endDate: range.endDate })}
        />
      )}

      {awaitingRange ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconCalendar size={48} color="#2C2C2C" />
          <p style={{ fontSize: 14, color: '#606060' }}>Select a date range and press Apply</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Greeting */}
          {user && (
            <p className={animate ? 'dashboard-enter dashboard-enter-2' : ''} style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              {greeting},{' '}
              <span style={{ color: 'var(--accent-color, #C0392B)' }}>
                {user.nickname ?? user.username} !
              </span>
              {' '}<span className="wave-hand">👋</span>
            </p>
          )}

          {/* Stat cards */}
          <div className={animate ? 'dashboard-enter dashboard-enter-3' : ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', width: '100%' }}>
            <SalesCard label="Total Sales"  value={formatCurrency(summary?.total_sales ?? 0)}  accent icon={IconReportMoney} />
            <SalesCard label="Total Orders" value={String(summary?.total_orders ?? 0)}          icon={IconShoppingCart} />
            {(summary?.payment_breakdown ?? []).map(b => (
              <SalesCard
                key={b.payment_method}
                label={`${b.payment_method.charAt(0).toUpperCase() + b.payment_method.slice(1)} Sales`}
                value={formatCurrency(b.revenue)}
                icon={IconCreditCard}
                logoUrl={getMethodLogoUrl(b.payment_method)}
                accent
                accentColor={getMethodColor(b.payment_method)}
              />
            ))}
            {period === 'today' && (() => {
              const revenue    = summary?.total_sales ?? 0;
              const netProfit  = revenue - todayExpenses;
              const isPositive = netProfit >= 0;
              return (
                <SalesCard
                  label="Est. Net Profit"
                  value={formatCurrency(netProfit)}
                  accent
                  accentColor={isPositive ? '#27AE60' : '#C0392B'}
                  icon={isPositive ? IconTrendingUp : IconTrendingDown}
                  isZero={netProfit === 0}
                />
              );
            })()}
          </div>

          {/* Daily sales target — only shown on Today period */}
          {period === 'today' && (
            <div className={animate ? 'dashboard-enter dashboard-enter-4' : ''}>
              <DailySalesTarget
                totalSales={summary?.total_sales ?? 0}
                dailyTarget={dailyTarget}
                onTargetUpdated={setDailyTarget}
              />
            </div>
          )}

          {/* Cash drawer management — only shown on Today period */}
          {period === 'today' && (
            <div className={animate ? 'dashboard-enter dashboard-enter-5' : ''}>
              <CashDrawerCard />
            </div>
          )}
          {/* Chart + best sellers */}
          <div className={`flex items-stretch gap-4 ${animate ? 'dashboard-enter dashboard-enter-4' : ''}`}>
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
