import apiClient from './client';
import { Notification } from '../types';

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get('/api/notifications');
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get('/api/notifications/unread-count');
  return data.count;
}

export async function markAsRead(id: number): Promise<void> {
  await apiClient.put(`/api/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.put('/api/notifications/read-all');
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`/api/notifications/${id}`);
}
