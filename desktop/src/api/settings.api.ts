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

export async function updateSetting(key: string, value: string): Promise<{ key: string; value: string }> {
  const { data } = await apiClient.patch(`/api/settings/${key}`, { value });
  return data;
}
