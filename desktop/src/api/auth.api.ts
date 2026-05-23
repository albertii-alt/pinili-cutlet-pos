import apiClient from './client';
import { User, StaffUser } from '../types';

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await apiClient.post('/api/auth/login', { username, password });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.put('/api/auth/change-password', { currentPassword, newPassword });
}

export async function getAllStaff(): Promise<StaffUser[]> {
  const { data } = await apiClient.get('/api/auth/staff');
  return data;
}

export async function createStaff(username: string, password: string, role: string): Promise<StaffUser> {
  const { data } = await apiClient.post('/api/auth/staff', { username, password, role });
  return data;
}

export async function updateStaff(id: number, payload: { username?: string; password?: string; role?: string }): Promise<StaffUser> {
  const { data } = await apiClient.put(`/api/auth/staff/${id}`, payload);
  return data;
}

export async function deleteStaff(id: number): Promise<void> {
  await apiClient.delete(`/api/auth/staff/${id}`);
}

export async function toggleStaffStatus(id: number, is_active: number): Promise<void> {
  await apiClient.patch(`/api/auth/staff/${id}/toggle`, { is_active });
}
