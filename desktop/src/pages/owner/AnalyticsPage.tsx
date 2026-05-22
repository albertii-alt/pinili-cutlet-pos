import { useAnalytics } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatCurrency';
import SalesCard from '../../components/owner/SalesCard';
import SalesChart from '../../components/owner/SalesChart';
import BestSellerList from '../../components/owner/BestSellerList';

export default function AnalyticsPage() {
  const { summary, dailySales, bestSellers, revenueByPayment, loading } = useAnalytics();

  return (
    <div className="flex flex-col gap-6 max-w-[960px]">
      <h1 className="text-white font-semibold text-lg">Analytics</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* All-time summary cards */}
          <div className="grid grid-cols-4 gap-3">
            <SalesCard label="Total Sales"   value={formatCurrency(summary?.total_sales ?? 0)} accent />
            <SalesCard label="Total Orders"  value={String(summary?.total_orders ?? 0)} />
            <SalesCard label="Cash Sales"    value={formatCurrency(summary?.cash_sales ?? 0)} />
            <SalesCard label="GCash Sales"   value={formatCurrency(summary?.gcash_sales ?? 0)} />
          </div>

          {/* Chart + best sellers */}
          <div className="grid grid-cols-[1fr_320px] gap-4">
            <SalesChart data={dailySales} />
            <BestSellerList items={bestSellers} />
          </div>

          {/* Revenue by payment */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-textGray text-xs uppercase tracking-wider mb-3">Revenue by Payment Method</p>
            <div className="flex flex-col gap-2">
              {revenueByPayment.length === 0 ? (
                <p className="text-textMuted text-sm text-center py-4">No data yet</p>
              ) : (
                revenueByPayment.map(r => (
                  <div key={r.payment_method} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-white text-sm capitalize">{r.payment_method === 'gcash' ? 'GCash' : 'Cash'}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-textGray text-xs">{r.count} orders</span>
                      <span className="text-primary font-semibold text-sm">{formatCurrency(r.total)}</span>
                    </div>
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
