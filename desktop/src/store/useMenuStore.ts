import { create } from 'zustand';
import { MenuItem, Category } from '../types';

interface MenuStore {
  menuItems: MenuItem[];
  categories: Category[];
  setMenuItems: (items: MenuItem[]) => void;
  setCategories: (categories: Category[]) => void;
  updateItem: (item: MenuItem) => void;
  updateAvailability: (id: number, is_available: number) => void;
  addCategory: (category: Category) => void;
  removeCategory: (id: number) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  menuItems: [],
  categories: [],

  setMenuItems: (items) => set({ menuItems: items }),
  setCategories: (categories) => set({ categories }),

  updateItem: (item) => set((state) => ({
    menuItems: state.menuItems.map(i => i.id === item.id ? item : i),
  })),

  updateAvailability: (id, is_available) => set((state) => ({
    menuItems: state.menuItems.map(i => i.id === id ? { ...i, is_available } : i),
  })),

  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category],
  })),

  removeCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id),
    menuItems: state.menuItems.map(i => i.category_id === id ? { ...i, category_id: null } : i),
  })),
}));
