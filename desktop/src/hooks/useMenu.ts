import { useEffect } from 'react';
import { getMenuItems, toggleFeatured as apiToggleFeatured } from '../api/menu.api';
import { useMenuStore } from '../store/useMenuStore';
import socket from '../socket/socket';
import { MenuItem } from '../types';

export function useMenu() {
  const { menuItems, setMenuItems, updateItem, updateAvailability } = useMenuStore();

  useEffect(() => {
    getMenuItems().then(setMenuItems).catch(console.error);

    function handleMenuUpdated(item: MenuItem) {
      updateItem(item);
    }
    function handleAvailability({ id, is_available }: { id: number; is_available: number }) {
      updateAvailability(id, is_available);
    }

    socket.on('menu:updated', handleMenuUpdated);
    socket.on('item:availability', handleAvailability);

    return () => {
      socket.off('menu:updated', handleMenuUpdated);
      socket.off('item:availability', handleAvailability);
    };
  }, []);

  async function toggleFeatured(id: number) {
    await apiToggleFeatured(id);
    // Server emits menu:updated with the full updated item — store handles the rest
  }

  return { menuItems, toggleFeatured };
}
