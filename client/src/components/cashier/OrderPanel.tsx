import { useState, useEffect } from 'react';
import { IconShoppingCart, IconChevronDown, IconTrash, IconShoppingCartOff } from '@tabler/icons-react';
import { useOrderStore } from '../../store/useOrderStore';
import { createOrder, getNextOrderNumber } from '../../api/order.api';
import { getPaymentMethods, type PaymentMethod } from '../../api/settings.api';
import { formatCurrency } from '../../utils/formatCurrency';
import type { CartItem } from '../../types';
import OrderItem from './OrderItem';
import EmptyState from '../shared/EmptyState';
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
        <div className="flex flex-col items-center gap-1 px-6 pt-6 pb-4">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Confirm Order?
          </h2>
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

        <div className="flex items-center justify-between px-6 py-4">
          <span style={{ fontSize: 11, color: '#606060', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            Total
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-color, #C0392B)' }}>
            {formatCurrency(totalAmount)}
          </span>
        </div>

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

interface OrderPanelProps {
  variant?: 'phone' | 'tablet' | 'desktop';
  width?: number;
}

export default function OrderPanel({ variant = 'phone', width = 320 }: OrderPanelProps) {
  const { cartItems, totalAmount, incrementItem, decrementItem, removeItem, clearCart } = useOrderStore();
  const [open, setOpen]                     = useState(false);
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

  const isCash    = paymentMethod.toLowerCase() === 'cash';
  const change    = isCash ? parseFloat(cashTendered || '0') - totalAmount : 0;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  async function submitOrder() {
    if (cartItems.length === 0) return;
    if (isCash) {
      const tendered = parseFloat(cashTendered);
      if (!cashTendered || isNaN(tendered)) { setError('Please enter cash tendered'); return; }
      if (tendered < totalAmount) { setError(`Cash tendered must be at least ${formatCurrency(totalAmount)}`); return; }
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
      if (!cashTendered || isNaN(tendered)) { setError('Please enter cash tendered'); return; }
      if (tendered < totalAmount) { setError(`Cash tendered must be at least ${formatCurrency(totalAmount)}`); return; }
    }
    setError('');
    if (showConfirmation) { setConfirmOpen(true); } else { submitOrder(); }
  }

  // ── Desktop: matches desktop app OrderPanel exactly ──────────────────────────
  if (variant === 'desktop') {
    return (
      <>
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
          {/* Header */}
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

          {/* Item list */}
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
                  <OrderItem item={item} onIncrement={incrementItem} onDecrement={decrementItem} onRemove={removeItem} />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div
              className="flex flex-col gap-3"
              style={{ padding: '14px 16px', borderTop: '1px solid #2C2C2C', flexShrink: 0 }}
            >
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-color, #C0392B)' }}>{formatCurrency(totalAmount)}</span>
              </div>

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

              {error && <p style={{ fontSize: 12, color: '#C0392B', minHeight: 16 }}>{error}</p>}

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
        </div>

        {confirmOpen && (
          <OrderConfirmModal
            items={cartItems} totalAmount={totalAmount} paymentMethod={paymentMethod}
            paymentColor={getMethodColor(paymentMethod)} cashTendered={cashTendered}
            orderPrefix={orderPrefix} loading={loading} onConfirm={submitOrder} onCancel={() => setConfirmOpen(false)}
          />
        )}
      </>
    );
  }

  // ── Tablet portrait: fixed bottom panel, horizontal scroll items ─────────────
  if (variant === 'tablet') {
    return (
      <>
        <div
          className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex flex-col"
          style={{ height: 320 }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
            <span className="text-white font-semibold text-sm">Current Order</span>
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="text-xs text-textMuted">Discard</button>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto px-4 py-2 shrink-0 scrollbar-none" style={{ minHeight: 110 }}>
            {cartItems.length === 0 ? (
              <span className="text-textMuted text-sm py-2">No items yet — add from the menu above</span>
            ) : (
              cartItems.map(item => (
                <div key={item.menu_item_id} className="shrink-0 bg-cardLight border border-border rounded-lg p-2 flex flex-col gap-1" style={{ minWidth: 140 }}>
                  <span className="text-white text-xs font-medium leading-tight">{item.item_name}</span>
                  <span className="text-primary text-xs">{formatCurrency(item.item_price)}</span>
                  <div className="flex items-center gap-2 mt-auto">
                    <button onClick={() => decrementItem(item.menu_item_id)} className="w-6 h-6 rounded bg-card text-white text-sm flex items-center justify-center">−</button>
                    <span className="text-white text-xs">{item.quantity}</span>
                    <button onClick={() => incrementItem(item.menu_item_id)} className="w-6 h-6 rounded bg-card text-white text-sm flex items-center justify-center">+</button>
                    <button onClick={() => removeItem(item.menu_item_id)} className="ml-auto text-textMuted text-xs">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-border px-4 py-2 flex items-center gap-3 shrink-0 mt-auto">
              <span className="text-white font-bold shrink-0">{formatCurrency(totalAmount)}</span>
              <div className="flex gap-2 flex-1">
                {paymentMethods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.name)}
                    className={`flex-1 py-2 rounded-lg text-xs min-h-[36px] transition-colors ${
                      paymentMethod === m.name ? 'bg-primary text-white' : 'bg-cardLight border border-border text-textGray'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              {isCash && (
                <input
                  type="number"
                  placeholder="Cash"
                  value={cashTendered}
                  onChange={e => setCashTendered(e.target.value)}
                  className="bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none min-h-[36px] w-28"
                />
              )}
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg px-4 py-2 text-sm font-semibold min-h-[36px] transition-colors shrink-0"
              >
                {loading ? '...' : 'Confirm'}
              </button>
            </div>
          )}
          {error && <p className="text-danger text-xs px-4 pb-2">{error}</p>}
        </div>

        {confirmOpen && (
          <OrderConfirmModal
            items={cartItems} totalAmount={totalAmount} paymentMethod={paymentMethod}
            paymentColor={getMethodColor(paymentMethod)} cashTendered={cashTendered}
            orderPrefix={orderPrefix} loading={loading} onConfirm={submitOrder} onCancel={() => setConfirmOpen(false)}
          />
        )}
      </>
    );
  }

  // ── Phone: original bottom sheet ─────────────────────────────────────────────
  return (
    <>
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

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="bg-black/75 absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative bg-card border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col">
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

            <div className="flex-1 overflow-y-auto px-4">
              {cartItems.length === 0 ? (
                <EmptyState icon={<IconShoppingCartOff size={48} color="#2C2C2C" />} message="No items yet" subtitle="Add items from the menu" />
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
    </>
  );
}
