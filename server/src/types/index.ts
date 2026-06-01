// Database entity types

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
  is_available: number; // 1 = available, 0 = unavailable
  is_featured: number;  // 1 = featured, 0 = not featured
  promo_price: number | null;
  promo_label: string | null;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'owner' | 'cashier' | 'kitchen';
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

// Auth types

export interface AuthPayload {
  id: number;
  username: string;
  role: 'owner' | 'cashier' | 'kitchen';
  avatar_path?: string | null;
}

// Request filter types

export interface OrderFilter {
  status?: 'pending' | 'completed' | 'cancelled';
  date?: string; // YYYY-MM-DD
  payment_method?: 'cash' | 'gcash';
}

// Analytics types

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

// Audit log

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

// Order creation payload

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
