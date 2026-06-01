import apiClient from './client';
import { Expense, ExpenseSummary } from '../types';

export type ExpensePeriod = 'all' | 'today' | 'week' | 'month' | 'last_month' | 'custom';

export interface ExpenseParams {
  period?: ExpensePeriod;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ExpenseListResponse {
  data: Expense[];
  total: number;
  limit: number;
  offset: number;
}

export interface AddExpensePayload {
  description: string;
  amount: number;
  category: string;
  date?: string;
}

export interface UpdateExpensePayload {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
}

export async function getExpenses(params: ExpenseParams = {}): Promise<ExpenseListResponse> {
  const { data } = await apiClient.get('/api/expenses', { params });
  return data;
}

export async function getExpenseSummary(params: Omit<ExpenseParams, 'limit' | 'offset'> = {}): Promise<ExpenseSummary> {
  const { data } = await apiClient.get('/api/expenses/summary', { params });
  return data;
}

export async function addExpense(payload: AddExpensePayload): Promise<Expense> {
  const { data } = await apiClient.post('/api/expenses', payload);
  return data;
}

export async function updateExpense(id: number, payload: UpdateExpensePayload): Promise<Expense> {
  const { data } = await apiClient.put(`/api/expenses/${id}`, payload);
  return data;
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete(`/api/expenses/${id}`);
}
