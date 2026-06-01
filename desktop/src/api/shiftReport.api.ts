import apiClient from './client';
import { ShiftReportResponse } from '../types';

export type ShiftReportPeriod = 'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom';

export interface ShiftReportParams {
  period?: ShiftReportPeriod;
  start_date?: string;
  end_date?: string;
  year?: string;
}

export async function getShiftReport(params: ShiftReportParams = {}): Promise<ShiftReportResponse> {
  const { data } = await apiClient.get('/api/shift-report', { params });
  return data;
}
