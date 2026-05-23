import { useState } from 'react';
import { IconShoppingCart, IconChevronDown } from '@tabler/icons-react';
import { useOrderStore } from '../../store/useOrderStore';
import { createOrder } from '../../api/order.api';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderItem from './OrderItem';
import EmptyState from '../shared/EmptyState';

export default function OrderPanel() {
  const { cartItems, totalAmount, incrementItem, decrementItem, removeItem, clearCart } = useOrderStore();
  const [open, setOpen]               = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
  const [cashTendered, setCashTendered]   = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  const change = paymentMethod === 'cash' ? parseFloat(cashTendered || '0') - totalAmount : 0;
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  async function handleConfirm() {
    if (cartItems.length === 0) return;
    if (paymentMethod === 'cash' && parseFloat(cashTendered) < totalAmount) {
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

                <div className="flex gap-2">
                  {(['cash', 'gcash'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2.5 rounded-lg text-sm min-h-[44px] transition-colors ${
                        paymentMethod === method
                          ? 'bg-primary text-white'
                          : 'bg-cardLight border border-border text-textGray'
                      }`}
                    >
                      {method === 'gcash' ? 'GCash' : 'Cash'}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'cash' && (
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
