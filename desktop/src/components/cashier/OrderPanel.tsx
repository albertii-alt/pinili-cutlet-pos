import { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/useOrderStore';
import { createOrder } from '../../api/order.api';
import { getSettings } from '../../api/settings.api';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderItem from './OrderItem';
import EmptyState from '../shared/EmptyState';

export default function OrderPanel() {
  const { cartItems, totalAmount, incrementItem, decrementItem, removeItem, clearCart } = useOrderStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
  const [cashTendered, setCashTendered] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Read default payment method from settings on mount
  useEffect(() => {
    getSettings()
      .then(s => {
        if (s.default_payment === 'gcash') setPaymentMethod('gcash');
      })
      .catch(() => {/* keep cash default */});
  }, []);

  const change = paymentMethod === 'cash' ? parseFloat(cashTendered || '0') - totalAmount : 0;

  async function handleConfirm() {
    if (cartItems.length === 0) return;
    if (paymentMethod === 'cash' && (parseFloat(cashTendered) < totalAmount)) {
      setError('Insufficient cash tendered');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createOrder({
        payment_method: paymentMethod,
        cash_tendered: paymentMethod === 'cash' ? parseFloat(cashTendered) : undefined,
        items: cartItems.map(({ menu_item_id, item_name, item_price, quantity }) => ({
          menu_item_id, item_name, item_price, quantity,
        })),
      });
      clearCart();
      setCashTendered('');
      setPaymentMethod('cash');
    } catch {
      setError('Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[300px] bg-card border-l border-border flex flex-col h-full pt-[52px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-white font-semibold text-sm">Current Order</span>
        {cartItems.length > 0 && (
          <button onClick={clearCart} className="text-xs text-textMuted hover:text-danger transition-colors">
            Discard
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
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
          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-textGray text-sm">Total</span>
            <span className="text-white font-bold text-lg">{formatCurrency(totalAmount)}</span>
          </div>

          {/* Payment method */}
          <div className="flex gap-2">
            {(['cash', 'gcash'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                  paymentMethod === method
                    ? 'bg-primary text-white'
                    : 'bg-cardLight border border-border text-textGray hover:bg-cardLight'
                }`}
              >
                {method === 'gcash' ? 'GCash' : 'Cash'}
              </button>
            ))}
          </div>

          {/* Cash input */}
          {paymentMethod === 'cash' && (
            <div className="flex flex-col gap-1">
              <input
                type="number"
                placeholder="Cash tendered"
                value={cashTendered}
                onChange={e => setCashTendered(e.target.value)}
                className="bg-cardLight border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-textMuted focus:border-primary outline-none"
              />
              {parseFloat(cashTendered) >= totalAmount && (
                <div className="flex justify-between text-xs">
                  <span className="text-textGray">Change</span>
                  <span className="text-success font-medium">{formatCurrency(change)}</span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          <p className="text-danger text-xs min-h-[16px]">{error}</p>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryDark disabled:bg-cardLight disabled:text-textMuted text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
          >
            {loading ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </div>
      )}
    </div>
  );
}
