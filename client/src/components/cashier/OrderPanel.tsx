import { useState, useEffect } from 'react';
import { IconShoppingCart, IconChevronDown } from '@tabler/icons-react';
import { useOrderStore } from '../../store/useOrderStore';
import { createOrder, getNextOrderNumber } from '../../api/order.api';
import { getPaymentMethods, type PaymentMethod } from '../../api/settings.api';
import { formatCurrency } from '../../utils/formatCurrency';
import type { CartItem } from '../../types';
import OrderItem from './OrderItem';
import EmptyState from '../shared/EmptyState';
import socket from '../../socket/socket';
import { useOrderSettings } from '../../hooks/useOrderSettings';

// ─── Order Confirmation Modal ─────────────────────────────────────────────────

interface OrderConfirmModalProps {
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
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
      className="fixed inset-0 flex items-center justify-center z-[60] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', animation: 'fadeIn 0.15s ease' }}
    >
      <div
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid #2C2C2C',
          borderRadius: 16,
          width: '100%',
          maxWidth: 420,
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
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2C2C2C',
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {paymentMethod}
            </span>
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
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: loading ? '#2C2C2C' : 'var(--accent-color, #C0392B)',
              color: loading ? '#606060' : '#ffffff',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s',
              minHeight: 48,
            }}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: '1px solid #2C2C2C',
              backgroundColor: '#111111',
              color: '#A0A0A0',
              fontSize: 15,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              minHeight: 48,
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

export default function OrderPanel() {
  const { cartItems, totalAmount, incrementItem, decrementItem, removeItem, clearCart } = useOrderStore();
  const [open, setOpen]                     = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod]   = useState('');
  const [cashTendered, setCashTendered]     = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [confirmOpen, setConfirmOpen]       = useState(false);

  const { orderPrefix, showConfirmation } = useOrderSettings();

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

  const isCash    = paymentMethod.toLowerCase() === 'cash';
  const change    = isCash ? parseFloat(cashTendered || '0') - totalAmount : 0;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

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
        items: cartItems.map(({ menu_item_id, item_name, item_price, quantity }) => ({
          menu_item_id, item_name, item_price, quantity,
        })),
      });
      clearCart();
      setCashTendered('');
      setConfirmOpen(false);
      setOpen(false);
      const def = paymentMethods.find(m => m.is_default) ?? paymentMethods[0];
      if (def) setPaymentMethod(def.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to place order: ${message}`);
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
    <>
      {/* Floating cart button */}
      {!open && itemCount > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 bg-primary text-white rounded-full px-5 py-3 flex items-center gap-2 shadow-lg z-40 active:scale-95 transition-transform"
        >
          <IconShoppingCart size={18} />
          <span className="font-semibold text-sm">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
          <span className="text-sm">{formatCurrency(totalAmount)}</span>
        </button>
      )}

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="bg-black/75 absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Handle */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-white font-semibold">Current Order</span>
              <div className="flex items-center gap-3">
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="text-xs text-textMuted">Discard</button>
                )}
                <button onClick={() => setOpen(false)} className="text-textGray">
                  <IconChevronDown size={20} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4">
              {cartItems.length === 0 ? (
                <EmptyState emoji="🛒" message="No items yet" subtitle="Add items from the menu" />
              ) : (
                cartItems.map(item => (
                  <OrderItem
                    key={item.menu_item_id}
                    item={item}
                    onIncrement={incrementItem}
                    onDecrement={decrementItem}
                    onRemove={removeItem}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-border p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-textGray text-sm">Total</span>
                  <span className="text-white font-bold text-xl">{formatCurrency(totalAmount)}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {paymentMethods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.name)}
                      className={`flex-1 py-2.5 rounded-lg text-sm min-h-[44px] transition-colors ${
                        paymentMethod === m.name
                          ? 'bg-primary text-white'
                          : 'bg-cardLight border border-border text-textGray'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>

                {isCash && (
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      placeholder="Cash tendered"
                      value={cashTendered}
                      onChange={e => setCashTendered(e.target.value)}
                      className="bg-cardLight border border-border rounded-lg px-3 py-3 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none min-h-[44px]"
                    />
                    {parseFloat(cashTendered) >= totalAmount && (
                      <div className="flex justify-between text-xs px-1">
                        <span className="text-textGray">Change</span>
                        <span className="text-success font-medium">{formatCurrency(change)}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-danger text-xs min-h-[16px]">{error}</p>

                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg py-3 text-sm font-semibold min-h-[44px] transition-colors"
                >
                  {loading ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order confirmation modal — z-[60] clears the bottom sheet z-50 */}
      {confirmOpen && (
        <OrderConfirmModal
          items={cartItems}
          totalAmount={totalAmount}
          paymentMethod={paymentMethod}
          cashTendered={cashTendered}
          orderPrefix={orderPrefix}
          loading={loading}
          onConfirm={submitOrder}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
