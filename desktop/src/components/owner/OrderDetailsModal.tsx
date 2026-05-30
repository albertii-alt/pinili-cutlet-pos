import { useState } from 'react';
import { IconX, IconAlertCircle } from '@tabler/icons-react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import Badge, { PaymentBadge } from '../shared/Badge';
import { cancelCompletedOrder } from '../../api/order.api';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onCancelled?: (id: number) => void;
}

export default function OrderDetailsModal({ order, onClose, onCancelled }: OrderDetailsModalProps) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason]                 = useState('');
  const [cancelling, setCancelling]         = useState(false);
  const [cancelError, setCancelError]       = useState('');
  const { getMethodColor, getMethodLogoUrl } = usePaymentMethods();

  const isCompleted = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';

  async function handleConfirmCancel() {
    if (reason.trim().length < 5) {
      setCancelError('Please enter at least 5 characters.');
      return;
    }
    setCancelling(true);
    setCancelError('');
    try {
      await cancelCompletedOrder(order.id, reason.trim());
      onCancelled?.(order.id);
      onClose();
    } catch {
      setCancelError('Failed to cancel order. Try again.');
    } finally {
      setCancelling(false);
    }
  }

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
            {isCancelled ? (
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#C0392B',
                backgroundColor: 'rgba(192,57,43,0.1)',
                border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: 4, padding: '2px 7px',
              }}>
                Cancelled
              </span>
            ) : (
              <Badge variant="completed" />
            )}
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
              <PaymentBadge method={order.payment_method} color={getMethodColor(order.payment_method)} logoUrl={getMethodLogoUrl(order.payment_method)} />
            </div>
          </div>

          {/* Cancel reason — shown if cancelled */}
          {isCancelled && order.cancel_reason && (
            <div
              className="flex flex-col gap-1 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.25)' }}
            >
              <span style={{ fontSize: 11, color: '#C0392B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Cancellation Reason
              </span>
              <span style={{ fontSize: 13, color: '#A0A0A0' }}>{order.cancel_reason}</span>
            </div>
          )}

          {/* Cash payment details */}
          {order.payment_method.toLowerCase() === 'cash' && order.cash_tendered !== null && (
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
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2C2C2C' }}>
              {order.items.map((item, i) => (
                <div
                  key={item.id}
                  className="flex flex-col px-3 py-2.5"
                  style={{
                    borderBottom: i < order.items.length - 1 ? '1px solid #2C2C2C' : 'none',
                    backgroundColor: '#1A1A1A',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ flex: 1, fontSize: 13, color: '#ffffff' }}>{item.item_name}</span>
                    <span style={{ fontSize: 13, color: '#C0392B', fontWeight: 600 }}>×{item.quantity}</span>
                    <span style={{ fontSize: 13, color: '#A0A0A0', minWidth: 60, textAlign: 'right' }}>
                      {formatCurrency(item.item_price * item.quantity)}
                    </span>
                  </div>
                  {item.notes && (
                    <span style={{ fontSize: 11, color: '#606060', fontStyle: 'italic', marginTop: 2 }}>
                      {item.notes}
                    </span>
                  )}
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
            <span style={{ fontSize: 20, color: isCancelled ? '#606060' : '#C0392B', fontWeight: 700, textDecoration: isCancelled ? 'line-through' : 'none' }}>
              {formatCurrency(order.total_amount)}
            </span>
          </div>

          {/* Cancel form — inline, shown when cancel button clicked */}
          {showCancelForm && (
            <div
              className="flex flex-col gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.25)' }}
            >
              <p style={{ fontSize: 12, color: '#C0392B', fontWeight: 500 }}>
                Why are you cancelling this order?
              </p>
              <textarea
                value={reason}
                onChange={e => { setReason(e.target.value); setCancelError(''); }}
                placeholder="Enter reason (min. 5 characters)"
                rows={3}
                style={{
                  backgroundColor: '#1A1A1A',
                  border: `1px solid ${cancelError ? '#C0392B' : '#2C2C2C'}`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'none',
                  width: '100%',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = cancelError ? '#C0392B' : '#C0392B')}
                onBlur={e => (e.currentTarget.style.borderColor = cancelError ? '#C0392B' : '#2C2C2C')}
              />
              {cancelError && (
                <div className="flex items-center gap-1.5">
                  <IconAlertCircle size={13} color="#C0392B" />
                  <span style={{ fontSize: 12, color: '#C0392B' }}>{cancelError}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCancelForm(false); setReason(''); setCancelError(''); }}
                  style={{
                    flex: 1, backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C',
                    borderRadius: 8, padding: '8px', color: '#A0A0A0', fontSize: 13, cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#242424')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  style={{
                    flex: 1,
                    backgroundColor: cancelling ? '#2C2C2C' : '#C0392B',
                    border: 'none', borderRadius: 8, padding: '8px',
                    color: cancelling ? '#606060' : '#ffffff',
                    fontSize: 13, fontWeight: 600,
                    cursor: cancelling ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (!cancelling) e.currentTarget.style.backgroundColor = '#96281B'; }}
                  onMouseLeave={e => { if (!cancelling) e.currentTarget.style.backgroundColor = '#C0392B'; }}
                >
                  {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 sticky bottom-0 flex gap-2"
          style={{ backgroundColor: '#111111', borderTop: '1px solid #2C2C2C' }}
        >
          {/* Cancel order button — only for completed orders, hidden when form is open */}
          {isCompleted && !showCancelForm && onCancelled && (
            <button
              onClick={() => setShowCancelForm(true)}
              style={{
                backgroundColor: 'rgba(192,57,43,0.08)',
                border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: 8, padding: '10px 16px',
                color: '#C0392B', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 transition-colors"
            style={{
              backgroundColor: '#1A1A1A', border: '1px solid #2C2C2C',
              borderRadius: 8, padding: '10px',
              color: '#A0A0A0', fontSize: 13, cursor: 'pointer',
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
