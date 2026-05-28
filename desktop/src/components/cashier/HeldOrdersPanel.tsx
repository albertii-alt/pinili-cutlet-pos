import { useState, useEffect } from 'react';
import { IconPlayerPlay, IconTrash, IconX, IconClock } from '@tabler/icons-react';
import { HeldOrder } from '../../types';
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
      className="fixed inset-0 flex items-center justify-center z-[60]"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
    >
      <div
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          width: '100%',
          maxWidth: 420,
          margin: '0 16px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
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
          <button
            onClick={onClose}
            style={{ color: '#606060', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606060')}
          >
            <IconX size={17} />
          </button>
        </div>

        {/* List */}
        <div className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {heldOrders.length === 0 ? (
            <p style={{ fontSize: 13, color: '#606060', textAlign: 'center', padding: '24px 0' }}>No held orders</p>
          ) : (
            [...heldOrders].reverse().map((order, idx) => {
              const isOldest = idx === heldOrders.length - 1;
              const total = order.items.reduce((s, i) => s + i.item_price * i.quantity, 0);
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 mx-3 mb-2 px-3 py-3 rounded-lg"
                  style={{
                    backgroundColor: isOldest ? 'rgba(243,156,18,0.06)' : '#111111',
                    border: `1px solid ${isOldest ? 'rgba(243,156,18,0.25)' : '#2C2C2C'}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, color: '#ffffff', fontWeight: 600 }} className="truncate">{order.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontSize: 11, color: '#606060' }}>
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} · {formatCurrency(total)}
                      </span>
                      <ElapsedLabel createdAt={order.created_at} />
                    </div>
                  </div>
                  <button
                    onClick={() => onResume(order.id)}
                    className="flex items-center gap-1"
                    style={{ backgroundColor: '#F39C12', border: 'none', borderRadius: 6, padding: '5px 10px', color: '#000000', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e08e0b')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F39C12')}
                  >
                    <IconPlayerPlay size={12} />
                    Resume
                  </button>
                  <button
                    onClick={() => onDelete(order.id)}
                    style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: '#C0392B', flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
                  >
                    <IconTrash size={12} />
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
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #2C2C2C', backgroundColor: '#111111', color: '#A0A0A0', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#111111')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
