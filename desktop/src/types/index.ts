// Mirrored from server types

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category_id: number | null;
  image_path: string | null;
  is_available: number;
  is_featured: number;
  promo_price: number | null;
  promo_label: string | null;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  role: 'owner' | 'cashier' | 'kitchen';
}

export interface StaffUser {
  id: number;
  username: string;
  role: 'cashier' | 'kitchen';
  is_active: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  payment_method: string;
  cash_tendered: number | null;
  change_amount: number | null;
  status: 'pending' | 'completed' | 'cancelled';
  cancel_reason: string | null;
  created_by: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  item_name: string;
  item_price: number;
  quantity: number;
  notes?: string | null;
}

export interface PaymentBreakdown {
  payment_method: string;
  order_count: number;
  revenue: number;
}

export interface AnalyticsSummary {
  total_sales: number;
  total_orders: number;
  payment_breakdown: PaymentBreakdown[];
}

export interface DailySales {
  date: string;
  total: number;
}

export interface BestSeller {
  menu_item_id: number;
  item_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface RevenueByPayment {
  payment_method: string;
  total: number;
  count: number;
}

export interface PeakHour {
  hour: string;
  order_count: number;
  revenue: number;
}

export interface CategorySales {
  category: string;
  total_quantity: number;
  total_revenue: number;
}

// Filter types

export type OrderFilter = 'today' | 'week' | 'month' | 'custom';

// Frontend-specific types

export interface CartItem {
  menu_item_id: number;
  item_name: string;
  item_price: number;
  quantity: number;
  image_path: string | null;
  notes?: string | null;
}

export interface HeldOrder {
  id: string;
  label: string;
  items: CartItem[];
  payment_method?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  username: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  details?: string | null;
  created_at: string;
}

export interface CashDrawer {
  id: number;
  date: string;
  opening_amount: number;
  expected_amount: number;
  actual_amount: number | null;
  discrepancy: number | null;
  notes: string | null;
  closed_at: string | null;
  created_at: string;
  /** Computed by server — today's cash sales only */
  cash_sales?: number;
}

export const EXPENSE_CATEGORIES = [
  'Ingredients',
  'Utilities',
  'Staff Meals',
  'Packaging',
  'Transport',
  'Maintenance',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: ExpenseCategory | string;
  date: string;
  created_by: number | null;
  created_at: string;
}

export interface ExpenseCategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  total: number;
  breakdown: ExpenseCategoryBreakdown[];
}

export interface ShiftReportEntry {
  created_by: number | null;
  username: string | null;
  role: string | null;
  total_orders: number;
  cancelled_orders: number;
  total_sales: number;
  avg_order_value: number | null;
  first_order_at: string | null;
  last_order_at: string | null;
}

export interface ShiftReportSummary {
  total_orders: number;
  total_sales: number;
}

export interface ShiftReportResponse {
  data: ShiftReportEntry[];
  summary: ShiftReportSummary;
  period: { start_date: string; end_date: string };
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface CreateOrderPayload {
  payment_method: string;
  cash_tendered?: number;
  items: {
    menu_item_id: number;
    item_name: string;
    item_price: number;
    quantity: number;
    notes?: string | null;
  }[];
}
