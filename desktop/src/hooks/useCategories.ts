import { useEffect } from 'react';
import { getCategories } from '../api/category.api';
import { useMenuStore } from '../store/useMenuStore';
import { onCategoryAdded, onCategoryDeleted } from '../socket/socket';

export function useCategories() {
  const { categories, setCategories, addCategory, removeCategory } = useMenuStore();

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);

    onCategoryAdded((category) => {
      addCategory(category);
    });

    onCategoryDeleted((id) => {
      removeCategory(id);
    });
  }, []);

  return { categories };
}
