import { useState, useEffect, useCallback } from 'react';
import { StaffUser } from '../types';
import { getAllStaff, createStaff, updateStaff, deleteStaff, toggleStaffStatus } from '../api/auth.api';

export function useStaff() {
  const [staff, setStaff]     = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    getAllStaff()
      .then(setStaff)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  async function addStaff(username: string, password: string, role: string): Promise<void> {
    await createStaff(username, password, role);
    refetch();
  }

  async function editStaff(id: number, payload: { username?: string; password?: string; role?: string }): Promise<void> {
    await updateStaff(id, payload);
    refetch();
  }

  async function removeStaff(id: number): Promise<void> {
    await deleteStaff(id);
    refetch();
  }

  async function toggleStatus(id: number, is_active: number): Promise<void> {
    await toggleStaffStatus(id, is_active);
    refetch();
  }

  return { staff, loading, refetch, addStaff, editStaff, removeStaff, toggleStatus };
}
