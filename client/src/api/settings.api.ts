import apiClient from './client';

export interface AppSettings {
  daily_target: string;
  stall_name: string;
  default_payment: string;
  [key: string]: string;
}

export async function getSettings(): Promise<AppSettings> {
  const { data } = await apiClient.get('/api/settings');
  return data;
}
