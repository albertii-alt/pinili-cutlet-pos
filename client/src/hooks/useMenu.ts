import { useState, useEffect } from 'react';
import { getMenuItems } from '../api/menu.api';
import { getCategories } from '../api/category.api';
import type { MenuItem, Category } from '../types';
import socket from '../socket/socket';

export function useMenu() {
  const [menuItems, setMenuItems]   = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getMenuItems(), getCategories()])
      .then(([items, cats]) => {
        setMenuItems(items);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    function handleMenuUpdated(item: MenuItem) {
      setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
    }
    function handleAvailability({ id, is_available }: { id: number; is_available: number }) {
      setMenuItems(prev => prev.map(i => i.id === id ? { ...i, is_available } : i));
    }

    socket.on('menu:updated', handleMenuUpdated);
    socket.on('item:availability', handleAvailability);

    return () => {
      socket.off('menu:updated', handleMenuUpdated);
      socket.off('item:availability', handleAvailability);
    };
  }, []);

  return { menuItems, categories, loading };
}
