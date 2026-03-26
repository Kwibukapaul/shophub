export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  price: number;
  cost_price: number;
  category_id: string;
  partner_store_id: string | null;
  stock_quantity: number;
  sku: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  helpful_count: number;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
  added_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  subtotal: number;
  tax: number;
  shipping_fee: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'credit_card' | 'mobile_money' | 'e_wallet';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  delivery_type: 'delivery' | 'pickup';
  shipping_address_id: string | null;
  pickup_location: string | null;
  delivery_notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalesAnalytics {
  id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  avg_order_value: number;
  orders_by_category: Record<string, number>;
  payment_method_breakdown: Record<string, number>;
  created_at: string;
  updated_at: string;
}