import { create } from 'zustand';
import type { CartItem, HeldOrder } from '../types';

const HELD_ORDERS_KEY = 'pinili_held_orders';

function calcTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.item_price * i.quantity, 0);
}

function saveHeldOrders(orders: HeldOrder[]) {
  try { localStorage.setItem(HELD_ORDERS_KEY, JSON.stringify(orders)); } catch {}
}

function loadHeldOrders(): HeldOrder[] {
  try {
    const raw = localStorage.getItem(HELD_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

interface OrderStore {
  cartItems: CartItem[];
  totalAmount: number;
  heldOrders: HeldOrder[];
  addItem: (item: CartItem) => void;
  incrementItem: (menu_item_id: number) => void;
  decrementItem: (menu_item_id: number) => void;
  removeItem: (menu_item_id: number) => void;
  updateItemNotes: (menu_item_id: number, notes: string) => void;
  clearCart: () => void;
  holdCurrentOrder: (label: string, paymentMethod: string) => void;
  resumeHeldOrder: (id: string) => void;
  deleteHeldOrder: (id: string) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  cartItems: [],
  totalAmount: 0,
  heldOrders: loadHeldOrders(),

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

  updateItemNotes: (menu_item_id, notes) => set((state) => ({
    cartItems: state.cartItems.map(i =>
      i.menu_item_id === menu_item_id ? { ...i, notes: notes || null } : i
    ),
  })),

  clearCart: () => set({ cartItems: [], totalAmount: 0 }),

  holdCurrentOrder: (label, paymentMethod) => set((state) => {
    if (state.cartItems.length === 0) return state;
    const existing = state.heldOrders;
    const autoLabel = label.trim() || `Held Order #${existing.length + 1}`;
    const held: HeldOrder = {
      id: `held-${Date.now()}`,
      label: autoLabel,
      items: state.cartItems,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
    };
    const updated = [...existing, held];
    saveHeldOrders(updated);
    return { heldOrders: updated, cartItems: [], totalAmount: 0 };
  }),

  resumeHeldOrder: (id) => set((state) => {
    const held = state.heldOrders.find(o => o.id === id);
    if (!held) return state;
    const updated = state.heldOrders.filter(o => o.id !== id);
    saveHeldOrders(updated);
    return {
      heldOrders: updated,
      cartItems: held.items,
      totalAmount: calcTotal(held.items),
    };
  }),

  deleteHeldOrder: (id) => set((state) => {
    const updated = state.heldOrders.filter(o => o.id !== id);
    saveHeldOrders(updated);
    return { heldOrders: updated };
  }),
}));
