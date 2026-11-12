export type ProductCategory =
  | 'Sneakers'
  | 'Apparel'
  | 'Bags'
  | 'Accessories'
  | 'Tech'
  | 'Home';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Sneakers',
  'Apparel',
  'Bags',
  'Accessories',
  'Tech',
  'Home'
];

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductVariant {
  label: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  story: string;
  sku: string;
  subtitle: string;
  images: string[];
  variants: ProductVariant[];
  totalStock: number;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  badge?: 'NEW' | 'BESTSELLER' | 'HOT' | 'LIMITED' | 'SALE';
  isFeatured?: boolean;
  createdAt: string;
}

/** Kept as a friendly alias for older project files. */
export type ShoeProduct = Product;

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedVariant: string;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  image: string;
  selectedVariant: string;
  unitPrice: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  district: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: 'PromptPay' | 'CreditCard' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
  phone?: string;
  address?: ShippingAddress;
}

export interface QueueJob {
  id: string;
  queueName: 'order-processing' | 'email-notification' | 'inventory-sync' | 'invoice-generation';
  jobName: string;
  data: Record<string, any>;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  attempts: number;
  maxAttempts: number;
  logs: string[];
  createdAt: string;
  finishedAt?: string;
  errorMessage?: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockCount: number;
  activeJobsCount: number;
  recentSales: {
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }[];
  salesByCategory: {
    category: ProductCategory;
    sales: number;
    revenue: number;
  }[];
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export interface FilterState {
  search: string;
  categories: ProductCategory[];
  brands: string[];
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
  truncated: boolean;
}

export interface DbTableInfo {
  name: string;
  label: string;
  description: string;
  columns: string[];
  rowCount: number;
}

export interface DbStatus {
  mode: 'postgres' | 'pg-mem';
  label: string;
  target: string;
  tables: DbTableInfo[];
}

export interface AuthResponse {
  success: boolean;
  user: User;
}
