import apiClient from './client';
import { ShiftReportResponse } from '../types';

export type ShiftReportPeriod = 'today' | 'week' | 'month' | 'custom';

export interface ShiftReportParams {
  period?: ShiftReportPeriod;
  start_date?: string;
  end_date?: string;
}

export async function getShiftReport(params: ShiftReportParams = {}): Promise<ShiftReportResponse> {
  const { data } = await apiClient.get('/api/shift-report', { params });
  return data;
}
