import apiClient from './client';
import { Order, CreateOrderPayload } from '../types';

export async function getActiveOrders(): Promise<Order[]> {
  const { data } = await apiClient.get('/api/orders/active');
  return data;
}

export interface OrderHistoryParams {
  status?: string;
  date?: string;
  payment_method?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getOrderHistory(params?: OrderHistoryParams): Promise<PaginatedOrders> {
  const { data } = await apiClient.get('/api/orders', { params });
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post('/api/orders', payload);
  return data;
}

export async function getNextOrderNumber(): Promise<string> {
  const { data } = await apiClient.get('/api/orders/next-number');
  return data.order_number as string;
}

export async function completeOrder(id: number): Promise<void> {
  await apiClient.patch(`/api/orders/${id}/complete`);
}

export async function cancelOrder(id: number): Promise<void> {
  await apiClient.patch(`/api/orders/${id}/cancel`);
}

export async function cancelCompletedOrder(id: number, reason: string): Promise<void> {
  await apiClient.patch(`/api/orders/${id}/cancel-completed`, { reason });
}
