import { useState, useEffect } from 'react';
import { IconTrash, IconShoppingCart } from '@tabler/icons-react';
import { useOrderStore } from '../../store/useOrderStore';
import { createOrder, getNextOrderNumber } from '../../api/order.api';
import { getPaymentMethods, type PaymentMethod } from '../../api/settings.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { CartItem } from '../../types';
import OrderItem from './OrderItem';

import socket from '../../socket/socket';
import { useOrderSettings } from '../../hooks/useOrderSettings';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { PaymentBadge } from '../shared/Badge';

// ─── Order Confirmation Modal ─────────────────────────────────────────────────

interface OrderConfirmModalProps {
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentColor: string;
  cashTendered: string;
  orderPrefix: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function OrderConfirmModal({
  items,
  totalAmount,
  paymentMethod,
  paymentColor,
  cashTendered,
  orderPrefix,
  loading,
  onConfirm,
  onCancel,
}: OrderConfirmModalProps) {
  const isCash = paymentMethod.toLowerCase() === 'cash';
  const tendered = parseFloat(cashTendered || '0');
  const change = isCash ? tendered - totalAmount : 0;

  // Bug 1 — fetch next order number on modal open
  const [nextNumber, setNextNumber] = useState<string | null>(null);

  useEffect(() => {
    setNextNumber(null);
    getNextOrderNumber()
      .then(n => setNextNumber(n))
      .catch(() => setNextNumber(`${orderPrefix}-???`));
  }, [orderPrefix]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60]"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', animation: 'fadeIn 0.15s ease' }}
    >
      <div
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          width: '100%',
          maxWidth: 420,
          margin: '0 16px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-1 px-6 pt-6 pb-4">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Confirm Order?
          </h2>
          {/* Bug 1 — order number, large + accent, loading skeleton */}
          {nextNumber === null ? (
            <span style={{ fontSize: 24, fontWeight: 800, color: '#404040', letterSpacing: '0.02em' }}>
              ...
            </span>
          ) : (
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-color, #C0392B)', letterSpacing: '0.02em' }}>
              {nextNumber}
            </span>
          )}
        </div>

        <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />

        {/* Bug 3 — scrollable items list, fixed max height */}
        <div
          className="hide-scrollbar"
          style={{ maxHeight: 200, overflowY: 'auto', padding: '0 24px' }}
        >
          {items.map((item, i) => (
            <div key={item.menu_item_id}>
              <div className="flex items-center gap-3 py-2">
                <span
                  style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: 'var(--accent-color, #C0392B)',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: '0 5px',
                  }}
                >
                  {item.quantity}×
                </span>
                <span style={{ flex: 1, fontSize: 13, color: '#ffffff' }}>{item.item_name}</span>
                <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 500 }}>
                  {formatCurrency(item.item_price * item.quantity)}
                </span>
              </div>
              {i < items.length - 1 && (
                <div style={{ height: 1, backgroundColor: '#242424' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />

        {/* Payment details */}
        <div className="flex flex-col gap-2 px-6 py-3">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 12, color: '#606060' }}>Payment</span>
            <PaymentBadge method={paymentMethod} color={paymentColor} />
          </div>
          {isCash && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: '#606060' }}>Cash Tendered</span>
              <span style={{ fontSize: 12, color: '#ffffff' }}>{formatCurrency(tendered)}</span>
            </div>
          )}
          {isCash && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: '#606060' }}>Change</span>
              <span style={{ fontSize: 12, color: '#27AE60', fontWeight: 600 }}>{formatCurrency(change)}</span>
            </div>
          )}
        </div>

        <div style={{ height: 1, backgroundColor: '#2C2C2C' }} />

        {/* Total */}
        <div className="flex items-center justify-between px-6 py-4">
          <span style={{ fontSize: 11, color: '#606060', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            Total
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-color, #C0392B)' }}>
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 px-6 pb-6">
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: loading ? '#2C2C2C' : 'var(--accent-color, #C0392B)',
              color: loading ? '#606060' : '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: '1px solid #2C2C2C',
              backgroundColor: '#111111',
              color: '#A0A0A0',
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}

// ─── Order Panel ──────────────────────────────────────────────────────────────

export default function OrderPanel({ width }: { width: number }) {
  const { cartItems, totalAmount, incrementItem, decrementItem, removeItem, clearCart } = useOrderStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod]   = useState('');
  const [cashTendered, setCashTendered]     = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [confirmOpen, setConfirmOpen]       = useState(false);

  const { orderPrefix, showConfirmation } = useOrderSettings();
  const { getMethodColor } = usePaymentMethods();

  useEffect(() => {
    getPaymentMethods().then(methods => {
      const active = methods.filter(m => m.is_active);
      setPaymentMethods(active);
      const def = active.find(m => m.is_default) ?? active[0];
      if (def) setPaymentMethod(def.name);
    }).catch(() => {});

    function handleUpdated(methods: PaymentMethod[]) {
      const active = methods.filter(m => m.is_active);
      setPaymentMethods(active);
      setPaymentMethod(prev => {
        const stillExists = active.find(m => m.name === prev);
        if (stillExists) return prev;
        const def = active.find(m => m.is_default) ?? active[0];
        return def?.name ?? '';
      });
    }
    socket.on('payment_methods:updated', handleUpdated);
    return () => { socket.off('payment_methods:updated', handleUpdated); };
  }, []);

  const isCash = paymentMethod.toLowerCase() === 'cash';
  const change = isCash ? parseFloat(cashTendered || '0') - totalAmount : 0;

  async function submitOrder() {
    if (cartItems.length === 0) return;
    if (isCash) {
      const tendered = parseFloat(cashTendered);
      if (!cashTendered || isNaN(tendered)) {
        setError('Please enter cash tendered');
        return;
      }
      if (tendered < totalAmount) {
        setError(`Cash tendered must be at least ${formatCurrency(totalAmount)}`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      await createOrder({
        payment_method: paymentMethod,
        cash_tendered: isCash ? parseFloat(cashTendered) : undefined,
        items: cartItems.map(({ menu_item_id, item_name, item_price, quantity, notes }) => ({
          menu_item_id, item_name, item_price, quantity, notes: notes ?? null,
        })),
      });
      clearCart();
      setCashTendered('');
      setConfirmOpen(false);
      const def = paymentMethods.find(m => m.is_default) ?? paymentMethods[0];
      if (def) setPaymentMethod(def.name);
    } catch {
      setError('Failed to place order. Try again.');
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (cartItems.length === 0) return;
    if (isCash) {
      const tendered = parseFloat(cashTendered);
      if (!cashTendered || isNaN(tendered)) {
        setError('Please enter cash tendered');
        return;
      }
      if (tendered < totalAmount) {
        setError(`Cash tendered must be at least ${formatCurrency(totalAmount)}`);
        return;
      }
    }
    setError('');
    if (showConfirmation) {
      setConfirmOpen(true);
    } else {
      submitOrder();
    }
  }

  return (
    <div
      className="hide-scrollbar"
      style={{
        width,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#111111',
        borderLeft: '1px solid #2C2C2C',
      }}
    >
      {/* ── Header (fixed) ── */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '14px 16px', borderBottom: '1px solid #2C2C2C', flexShrink: 0, paddingTop: 'calc(14px + 52px)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Current Order</span>
          {cartItems.length > 0 && (
            <span
              style={{
                backgroundColor: 'var(--accent-color, #C0392B)',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 99,
                padding: '1px 7px',
                lineHeight: '16px',
              }}
            >
              {cartItems.length}
            </span>
          )}
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1"
            style={{
              backgroundColor: 'rgba(192,57,43,0.08)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#C0392B',
              fontSize: 11,
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.08)')}
          >
            <IconTrash size={11} />
            Discard
          </button>
        )}
      </div>

      {/* ── Item list (scrollable) ── */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: '#606060' }}>
            <IconShoppingCart size={32} />
            <span style={{ fontSize: 13 }}>No items yet</span>
            <span style={{ fontSize: 11, color: '#404040' }}>Add items from the menu</span>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.menu_item_id} style={{ padding: '0 16px', borderBottom: '1px solid #2C2C2C' }}>
              <OrderItem
                item={item}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
                onRemove={removeItem}
              />
            </div>
          ))
        )}
      </div>

      {/* ── Footer (fixed) ── */}
      {cartItems.length > 0 && (
        <div
          className="flex flex-col gap-3"
          style={{ padding: '14px 16px', borderTop: '1px solid #2C2C2C', flexShrink: 0 }}
        >
          {/* Total */}
          <div className="flex justify-between items-center">
            <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-color, #C0392B)' }}>{formatCurrency(totalAmount)}</span>
          </div>

          {/* Payment method */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {paymentMethods.map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(m.name)}
                style={{
                  flex: 1,
                  minWidth: 70,
                  height: 34,
                  padding: '4px',
                  borderRadius: 8,
                  border: paymentMethod === m.name ? 'none' : '1px solid #2C2C2C',
                  backgroundColor: paymentMethod === m.name ? 'var(--accent-color, #C0392B)' : '#1A1A1A',
                  color: paymentMethod === m.name ? '#ffffff' : '#606060',
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Cash input */}
          {isCash && (
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Cash Tendered
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={cashTendered}
                onChange={e => setCashTendered(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2C2C2C',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: 13,
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-color, #C0392B)')}
                onBlur={e => (e.currentTarget.style.borderColor = '#2C2C2C')}
              />
              {cashTendered.length > 0 && parseFloat(cashTendered) >= totalAmount && (
                <div className="flex justify-between" style={{ fontSize: 12 }}>
                  <span style={{ color: '#606060' }}>Change</span>
                  <span style={{ color: '#27AE60', fontWeight: 600 }}>{formatCurrency(change)}</span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && <p style={{ fontSize: 12, color: '#C0392B', minHeight: 16 }}>{error}</p>}

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 8,
              border: 'none',
              backgroundColor: loading ? '#2C2C2C' : 'var(--accent-color, #C0392B)',
              color: loading ? '#606060' : '#ffffff',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(192,57,43,0.3)',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </div>
      )}

      {/* Order confirmation modal */}
      {confirmOpen && (
        <OrderConfirmModal
          items={cartItems}
          totalAmount={totalAmount}
          paymentMethod={paymentMethod}
          paymentColor={getMethodColor(paymentMethod)}
          cashTendered={cashTendered}
          orderPrefix={orderPrefix}
          loading={loading}
          onConfirm={submitOrder}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
