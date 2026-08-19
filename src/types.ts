export type ShoeBrand = 'Nike' | 'Adidas' | 'Jordan' | 'New Balance' | 'Puma' | 'Asics' | 'Yeezy';

export type ShoeCategory = 'Lifestyle' | 'Running' | 'Basketball' | 'Skateboarding' | 'Retro';

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductSizeStock {
  size: string; // e.g. "US 7.5", "US 8", "US 9"
  stock: number;
}

export interface ShoeProduct {
  id: string;
  name: string;
  brand: ShoeBrand;
  category: ShoeCategory;
  price: number;
  originalPrice?: number;
  description: string;
  story: string;
  sku: string;
  colorway: string;
  images: string[];
  sizes: ProductSizeStock[];
  totalStock: number;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  badge?: 'NEW' | 'BESTSELLER' | 'HOT' | 'LIMITED';
  gender: 'Men' | 'Women' | 'Unisex';
  isFeatured?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique cart line id
  productId: string;
  product: ShoeProduct;
  selectedSize: string;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: ShoeBrand;
  image: string;
  selectedSize: string;
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
  recentSales: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  salesByBrand: {
    brand: ShoeBrand;
    sales: number;
    revenue: number;
  }[];
}

export interface FilterState {
  search: string;
  brands: ShoeBrand[];
  categories: ShoeCategory[];
  gender: string;
  minPrice: number;
  maxPrice: number;
  selectedSize: string;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
}
