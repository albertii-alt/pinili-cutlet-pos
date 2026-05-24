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
}

export interface AnalyticsSummary {
  total_sales: number;
  total_orders: number;
  cash_sales: number;
  gcash_sales: number;
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
  }[];
}
