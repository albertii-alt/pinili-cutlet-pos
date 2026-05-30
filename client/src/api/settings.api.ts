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
  color: string | null;
  logo_path: string | null;
  created_at: string;
}

export async function getSettings(): Promise<AppSettings> {
  const { data } = await apiClient.get('/api/settings');
  return data;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await apiClient.get('/api/payment-methods');
  return data;
}
