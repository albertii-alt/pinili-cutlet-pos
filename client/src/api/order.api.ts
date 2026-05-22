import apiClient from './client';
import type { Order, CreateOrderPayload } from '../types';

export async function getActiveOrders(): Promise<Order[]> {
  const { data } = await apiClient.get('/api/orders/active');
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post('/api/orders', payload);
  return data;
}

export async function completeOrder(id: number): Promise<void> {
  await apiClient.patch(`/api/orders/${id}/complete`);
}

export async function cancelOrder(id: number): Promise<void> {
  await apiClient.patch(`/api/orders/${id}/cancel`);
}
