import { create } from 'zustand';
import type { CartItem } from '../types';

interface OrderStore {
  cartItems: CartItem[];
  totalAmount: number;
  addItem: (item: CartItem) => void;
  incrementItem: (menu_item_id: number) => void;
  decrementItem: (menu_item_id: number) => void;
  removeItem: (menu_item_id: number) => void;
  clearCart: () => void;
}

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.item_price * i.quantity, 0);
}

export const useOrderStore = create<OrderStore>((set) => ({
  cartItems: [],
  totalAmount: 0,

  addItem: (item) => set((state) => {
    const existing = state.cartItems.find(i => i.menu_item_id === item.menu_item_id);
    const updated = existing
      ? state.cartItems.map(i => i.menu_item_id === item.menu_item_id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...state.cartItems, { ...item, quantity: 1 }];
    return { cartItems: updated, totalAmount: calcTotal(updated) };
  }),

  incrementItem: (menu_item_id) => set((state) => {
    const updated = state.cartItems.map(i =>
      i.menu_item_id === menu_item_id ? { ...i, quantity: i.quantity + 1 } : i
    );
    return { cartItems: updated, totalAmount: calcTotal(updated) };
  }),

  decrementItem: (menu_item_id) => set((state) => {
    const updated = state.cartItems
      .map(i => i.menu_item_id === menu_item_id ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0);
    return { cartItems: updated, totalAmount: calcTotal(updated) };
  }),

  removeItem: (menu_item_id) => set((state) => {
    const updated = state.cartItems.filter(i => i.menu_item_id !== menu_item_id);
    return { cartItems: updated, totalAmount: calcTotal(updated) };
  }),

  clearCart: () => set({ cartItems: [], totalAmount: 0 }),
}));
