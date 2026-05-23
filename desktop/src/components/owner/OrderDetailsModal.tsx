import { IconX } from '@tabler/icons-react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import Badge from '../shared/Badge';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div
        className="w-[480px] max-h-[90vh] overflow-y-auto flex flex-col hide-scrollbar"
        style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C', borderRadius: 16 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0"
          style={{ backgroundColor: '#111111', borderBottom: '1px solid #2C2C2C' }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 20, fontWeight: 700, color: '#C0392B', letterSpacing: '0.05em' }}>
              {order.order_number}
            </span>
            <Badge variant="completed" />
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
        <div className="flex flex-col gap-4 px-5 py-4">

          {/* Order info */}
          <div
            className="flex flex-col gap-2 p-3 rounded-lg"
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}
          >
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 12, color: '#606060' }}>Date & Time</span>
              <span style={{ fontSize: 13, color: '#ffffff' }}>{formatDateTime(order.created_at)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 12, color: '#606060' }}>Payment</span>
              <Badge variant={order.payment_method === 'cash' ? 'cash' : 'gcash'} />
            </div>
          </div>

          {/* Cash payment details */}
          {order.payment_method === 'cash' && order.cash_tendered !== null && (
            <div
              className="flex flex-col gap-2 p-3 rounded-lg"
              style={{ backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C' }}
            >
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 12, color: '#606060' }}>Cash Tendered</span>
                <span style={{ fontSize: 13, color: '#ffffff' }}>{formatCurrency(order.cash_tendered)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 12, color: '#606060' }}>Change</span>
                <span style={{ fontSize: 13, color: '#27AE60', fontWeight: 600 }}>
                  {formatCurrency(order.change_amount ?? 0)}
                </span>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex flex-col">
            <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Items
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid #2C2C2C' }}
            >
              {order.items.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                  style={{
                    borderBottom: i < order.items.length - 1 ? '1px solid #2C2C2C' : 'none',
                    backgroundColor: '#1A1A1A',
                  }}
                >
                  <span style={{ flex: 1, fontSize: 13, color: '#ffffff' }}>{item.item_name}</span>
                  <span style={{ fontSize: 13, color: '#C0392B', fontWeight: 600 }}>×{item.quantity}</span>
                  <span style={{ fontSize: 13, color: '#A0A0A0', minWidth: 60, textAlign: 'right' }}>
                    {formatCurrency(item.item_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid #2C2C2C' }}
          >
            <span style={{ fontSize: 13, color: '#606060', fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: 20, color: '#C0392B', fontWeight: 700 }}>
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 sticky bottom-0"
          style={{ backgroundColor: '#111111', borderTop: '1px solid #2C2C2C' }}
        >
          <button
            onClick={onClose}
            className="w-full transition-colors"
            style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 8,
              padding: '10px',
              color: '#A0A0A0',
              fontSize: 13,
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#242424')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
