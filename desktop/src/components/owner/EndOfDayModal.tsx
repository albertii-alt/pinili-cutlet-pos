import { useState, useEffect } from 'react';
import { IconX, IconMoon, IconDownload } from '@tabler/icons-react';
import { getEndOfDaySummary, type EndOfDaySummary } from '../../api/analytics.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';

interface EndOfDayModalProps {
  onClose: () => void;
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
      <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color: accent ? 'var(--accent-color, #C0392B)' : '#ffffff' }}>{value}</span>
    </div>
  );
}

function generateCSV(data: EndOfDaySummary): string {
  const lines: string[] = [
    'PINILI CUTLET — END OF DAY SUMMARY',
    `Date,${data.date}`,
    '',
    'SUMMARY',
    `Total Orders,${data.total_orders}`,
    `Completed Orders,${data.completed_orders}`,
    `Cancelled Orders,${data.cancelled_orders}`,
    `Total Revenue,${data.total_revenue.toFixed(2)}`,
    `Average Order Value,${(data.average_order_value ?? 0).toFixed(2)}`,
    '',
    'PAYMENT BREAKDOWN',
    ...data.payment_breakdown.map(b =>
      `${b.payment_method},${b.order_count} orders,${b.revenue.toFixed(2)}`
    ),
    '',
    'TOP 5 ITEMS',
    'Rank,Item,Qty Sold,Revenue',
    ...data.top_items.map((item, i) =>
      `${i + 1},${item.item_name},${item.total_quantity},${item.total_revenue.toFixed(2)}`
    ),
  ];
  return lines.join('\n');
}

function downloadCSV(data: EndOfDaySummary): void {
  const csv = generateCSV(data);
  import('@tauri-apps/plugin-dialog').then(({ save }) =>
    save({
      defaultPath: `pinili-cutlet-summary-${data.date}.csv`,
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    })
  ).then(filePath => {
    if (!filePath) return;
    import('@tauri-apps/plugin-fs').then(({ writeTextFile }) =>
      writeTextFile(filePath, csv)
    );
  });
}

export default function EndOfDayModal({ onClose }: EndOfDayModalProps) {
  const [data, setData]       = useState<EndOfDaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const { getMethodColor } = usePaymentMethods();

  useEffect(() => {
    getEndOfDaySummary()
      .then(setData)
      .catch(() => setError('Failed to load summary'))
      .finally(() => setLoading(false));
  }, []);

  // Cash revenue for closing reminder (first cash-named method, fallback to first method)
  const cashEntry = data?.payment_breakdown.find(b =>
    b.payment_method.toLowerCase() === 'cash'
  ) ?? data?.payment_breakdown[0];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        className="w-[580px] max-h-[90vh] overflow-y-auto flex flex-col hide-scrollbar"
        style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', borderRadius: 16 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ backgroundColor: '#111111', borderBottom: '1px solid #2C2C2C' }}
        >
          <div className="flex items-center gap-2">
            <IconMoon size={16} color="var(--accent-color, #C0392B)" />
            <div>
              <h2 className="text-white font-semibold text-sm">End of Day Summary</h2>
              {data && <p style={{ fontSize: 11, color: '#606060' }}>{formatFullDate(data.date)}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#606060' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
          >
            <IconX size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p style={{ color: 'var(--accent-color, #C0392B)', fontSize: 13, textAlign: 'center' }}>{error}</p>
          ) : data ? (
            <>
              {/* Summary cards — total + one per payment method */}
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${2 + data.payment_breakdown.length}, minmax(0, 1fr))` }}
              >
                <SummaryCard label="Total Orders" value={String(data.total_orders)} />
                <SummaryCard label="Revenue"      value={formatCurrency(data.total_revenue)} accent />
                {data.payment_breakdown.map((b, i) => (
                  <SummaryCard
                    key={b.payment_method}
                    label={b.payment_method.charAt(0).toUpperCase() + b.payment_method.slice(1)}
                    value={formatCurrency(b.revenue)}
                  />
                ))}
              </div>

              {/* Orders breakdown */}
              <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
                <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Orders Breakdown</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Completed', value: data.completed_orders,                        color: '#27AE60' },
                    { label: 'Cancelled', value: data.cancelled_orders,                        color: 'var(--accent-color, #C0392B)' },
                    { label: 'Avg Value', value: formatCurrency(data.average_order_value ?? 0), color: '#ffffff' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span style={{ fontSize: 11, color: '#606060' }}>{label}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment breakdown — dynamic */}
              <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
                <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment Breakdown</p>
                <div className="flex flex-col gap-2">
                  {data.payment_breakdown.map((b) => {
                    const color = getMethodColor(b.payment_method);
                    const pct = data.total_revenue > 0 ? (b.revenue / data.total_revenue) * 100 : 0;
                    return (
                      <div key={b.payment_method} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span style={{ fontSize: 13, color: '#ffffff' }}>
                              {b.payment_method.charAt(0).toUpperCase() + b.payment_method.slice(1)}
                            </span>
                            <span style={{ fontSize: 12, color: '#606060' }}>{b.order_count} orders</span>
                          </div>
                          <span style={{ fontSize: 13, color, fontWeight: 600 }}>{formatCurrency(b.revenue)}</span>
                        </div>
                        {/* Per-method proportion bar */}
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2C2C2C' }}>
                          <div style={{ width: `${pct}%`, backgroundColor: color, height: '100%', transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#606060' }}>{pct.toFixed(0)}% of revenue</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top 5 items */}
              <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}>
                <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top 5 Items Today</p>
                {data.top_items.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#606060', textAlign: 'center', padding: '8px 0' }}>No items sold today</p>
                ) : (
                  <div className="flex flex-col">
                    {data.top_items.map((item, i) => (
                      <div
                        key={item.menu_item_id}
                        className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                        style={i === 0 ? { backgroundColor: 'rgba(244,196,48,0.04)', borderRadius: 6 } : undefined}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? '#F4C430' : '#606060', width: 20, textAlign: 'center' }}>
                          {i + 1}
                        </span>
                        <span style={{ flex: 1, fontSize: 13, color: i === 0 ? '#F4C430' : '#ffffff' }} className="truncate">
                          {item.item_name}
                        </span>
                        <span style={{ fontSize: 12, color: '#606060' }}>×{item.total_quantity}</span>
                        <span style={{ fontSize: 13, color: 'var(--accent-color, #C0392B)', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                          {formatCurrency(item.total_revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Closing reminder — dynamic cash amount */}
              {cashEntry && (
                <div
                  className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)' }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span style={{ fontSize: 12, color: '#27AE60', fontWeight: 600 }}>Closing Reminder</span>
                    <span style={{ fontSize: 13, color: '#A0A0A0' }}>
                      Please collect{' '}
                      <span style={{ color: '#27AE60', fontWeight: 700 }}>{formatCurrency(cashEntry.revenue)}</span>
                      {' '}in {cashEntry.payment_method} from the register.
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky bottom-0"
          style={{ backgroundColor: '#111111', borderTop: '1px solid #2C2C2C' }}
        >
          <button
            onClick={() => data && downloadCSV(data)}
            disabled={!data}
            className="flex items-center gap-2 transition-colors"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '8px 16px',
              color: data ? '#A0A0A0' : '#606060',
              fontSize: 13,
              cursor: data ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (data) { e.currentTarget.style.backgroundColor = '#242424'; e.currentTarget.style.color = '#ffffff'; }}}
            onMouseLeave={e => { if (data) { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#A0A0A0'; }}}
          >
            <IconDownload size={14} />
            Export as CSV
          </button>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'var(--accent-color, #C0392B)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 24px',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-color-dark, #96281B)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent-color, #C0392B)')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
