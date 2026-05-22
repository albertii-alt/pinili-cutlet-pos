import { useEffect } from 'react';
import { getMenuItems } from '../api/menu.api';
import { useMenuStore } from '../store/useMenuStore';
import { onMenuUpdated, onItemAvailability } from '../socket/socket';

export function useMenu() {
  const { menuItems, setMenuItems, updateItem, updateAvailability } = useMenuStore();

  useEffect(() => {
    getMenuItems().then(setMenuItems).catch(console.error);

    onMenuUpdated((item) => {
      updateItem(item);
    });

    onItemAvailability(({ id, is_available }) => {
      updateAvailability(id, is_available);
    });
  }, []);

  return { menuItems };
}
