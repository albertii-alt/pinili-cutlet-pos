import { useState, useEffect } from 'react';
import { getMenuItems } from '../api/menu.api';
import { getCategories } from '../api/category.api';
import { MenuItem, Category } from '../types';
import { onMenuUpdated, onItemAvailability } from '../socket/socket';

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

    onMenuUpdated((item) => {
      setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
    });

    onItemAvailability(({ id, is_available }) => {
      setMenuItems(prev => prev.map(i => i.id === id ? { ...i, is_available } : i));
    });
  }, []);

  return { menuItems, categories, loading };
}
