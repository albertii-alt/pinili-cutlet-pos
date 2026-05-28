import { useState, useEffect } from 'react';
import { IconPlayerPlay, IconTrash, IconX, IconClock } from '@tabler/icons-react';
import type { HeldOrder } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface HeldOrdersPanelProps {
  heldOrders: HeldOrder[];
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function getElapsedMins(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function ElapsedLabel({ createdAt }: { createdAt: string }) {
  const [mins, setMins] = useState(() => getElapsedMins(createdAt));
  useEffect(() => {
    const id = setInterval(() => setMins(getElapsedMins(createdAt)), 30000);
    return () => clearInterval(id);
  }, [createdAt]);
  const color = mins >= 10 ? '#C0392B' : mins >= 5 ? '#F39C12' : '#606060';
  return (
    <span className="flex items-center gap-1" style={{ fontSize: 11, color }}>
      <IconClock size={11} />
      {mins === 0 ? 'just now' : `${mins}m ago`}
    </span>
  );
}

export default function HeldOrdersPanel({ heldOrders, onResume, onDelete, onClose }: HeldOrdersPanelProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          maxWidth: 420,
          maxHeight: '80vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2C2C2C' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
            Held Orders
            {heldOrders.length > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, backgroundColor: '#F39C12', color: '#000', borderRadius: 99, padding: '1px 7px' }}>
                {heldOrders.length}
              </span>
            )}
          </span>
          <button onClick={onClose} className="text-textGray p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <IconX size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {heldOrders.length === 0 ? (
            <p className="text-textMuted text-sm text-center py-8">No held orders</p>
          ) : (
            [...heldOrders].reverse().map((order, idx) => {
              const isOldest = idx === heldOrders.length - 1;
              const total = order.items.reduce((s, i) => s + i.item_price * i.quantity, 0);
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 mx-3 mb-2 px-3 py-3 rounded-xl"
                  style={{
                    backgroundColor: isOldest ? 'rgba(243,156,18,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isOldest ? 'rgba(243,156,18,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{order.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-textMuted text-xs">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} · {formatCurrency(total)}
                      </span>
                      <ElapsedLabel createdAt={order.created_at} />
                    </div>
                  </div>
                  <button
                    onClick={() => onResume(order.id)}
                    className="flex items-center gap-1 shrink-0 min-h-[36px] px-3 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: '#F39C12', color: '#000000', border: 'none' }}
                  >
                    <IconPlayerPlay size={12} />
                    Resume
                  </button>
                  <button
                    onClick={() => onDelete(order.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: '#C0392B' }}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid #2C2C2C' }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg border border-border bg-card text-textGray text-sm min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
