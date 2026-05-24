import apiClient from './client';

export interface AppSettings {
  daily_target: string;
  stall_name: string;
  default_payment: string;
  [key: string]: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  is_active: number;
  is_default: number;
  sort_order: number;
  created_at: string;
}

export async function getSettings(): Promise<AppSettings> {
  const { data } = await apiClient.get('/api/settings');
  return data;
}

export async function updateSetting(key: string, value: string): Promise<{ key: string; value: string }> {
  const { data } = await apiClient.patch(`/api/settings/${key}`, { value });
  return data;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await apiClient.get('/api/payment-methods');
  return data;
}

export async function addPaymentMethod(name: string): Promise<PaymentMethod> {
  const { data } = await apiClient.post('/api/payment-methods', { name });
  return data;
}

export async function deletePaymentMethod(id: number): Promise<void> {
  await apiClient.delete(`/api/payment-methods/${id}`);
}

export async function setDefaultPaymentMethod(id: number): Promise<void> {
  await apiClient.patch(`/api/payment-methods/${id}/default`);
}

export async function togglePaymentMethod(id: number, isActive: boolean): Promise<void> {
  await apiClient.patch(`/api/payment-methods/${id}/toggle`, { isActive });
}
