import { useState, useEffect } from 'react';
import { IconShoppingCart, IconChevronDown } from '@tabler/icons-react';
import { useOrderStore } from '../../store/useOrderStore';
import { createOrder } from '../../api/order.api';
import { getPaymentMethods, type PaymentMethod } from '../../api/settings.api';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderItem from './OrderItem';
import EmptyState from '../shared/EmptyState';
import socket from '../../socket/socket';

export default function OrderPanel() {
  const { cartItems, totalAmount, incrementItem, decrementItem, removeItem, clearCart } = useOrderStore();
  const [open, setOpen]                     = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod]   = useState('');
  const [cashTendered, setCashTendered]     = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

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

  const isCash   = paymentMethod.toLowerCase() === 'cash';
  const change   = isCash ? parseFloat(cashTendered || '0') - totalAmount : 0;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  async function handleConfirm() {
    if (cartItems.length === 0) return;
    if (isCash && parseFloat(cashTendered) < totalAmount) {
      setError('Insufficient cash tendered');
      return;
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
      const def = paymentMethods.find(m => m.is_default) ?? paymentMethods[0];
      if (def) setPaymentMethod(def.name);
      setOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to place order: ${message}`);
    } finally {
      setLoading(false);
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
    </>
  );
}
