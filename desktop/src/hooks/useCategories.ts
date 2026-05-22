import { useEffect } from 'react';
import { getCategories } from '../api/category.api';
import { useMenuStore } from '../store/useMenuStore';
import socket from '../socket/socket';
import { Category } from '../types';

export function useCategories() {
  const { categories, setCategories, addCategory, removeCategory } = useMenuStore();

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);

    function handleCategoryAdded(category: Category) {
      addCategory(category);
    }
    function handleCategoryDeleted(id: number) {
      removeCategory(id);
    }

    socket.on('category:added', handleCategoryAdded);
    socket.on('category:deleted', handleCategoryDeleted);

    return () => {
      socket.off('category:added', handleCategoryAdded);
      socket.off('category:deleted', handleCategoryDeleted);
    };
  }, []);

  return { categories };
}
