import apiClient from './client';
import { AuditLog } from '../types';

export interface AuditLogsParams {
  start_date?: string;
  end_date?: string;
  username?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export async function getAuditLogs(params: AuditLogsParams = {}): Promise<AuditLogsResponse> {
  const { data } = await apiClient.get('/api/audit-logs', { params });
  return data;
}

export async function deleteAuditLog(id: number): Promise<void> {
  await apiClient.delete(`/api/audit-logs/${id}`);
}

export async function deleteAllAuditLogs(): Promise<void> {
  await apiClient.delete('/api/audit-logs/all');
}

export async function deleteManyAuditLogs(ids: number[]): Promise<void> {
  await apiClient.post('/api/audit-logs/bulk-delete', { ids });
}
