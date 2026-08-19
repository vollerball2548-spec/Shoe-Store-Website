import { ShoeProduct, Order, QueueJob, User, AdminAnalytics, FilterState } from '../types';

export const api = {
  // Products
  async getProducts(filter?: Partial<FilterState>): Promise<ShoeProduct[]> {
    const params = new URLSearchParams();
    if (filter?.search) params.append('search', filter.search);
    if (filter?.brands && filter.brands.length > 0) params.append('brand', filter.brands.join(','));
    if (filter?.categories && filter.categories.length > 0) params.append('category', filter.categories.join(','));
    if (filter?.gender && filter.gender !== 'All') params.append('gender', filter.gender);
    if (filter?.minPrice) params.append('minPrice', filter.minPrice.toString());
    if (filter?.maxPrice) params.append('maxPrice', filter.maxPrice.toString());
    if (filter?.inStockOnly) params.append('inStock', 'true');
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    return data.data;
  },

  async getProductById(id: string): Promise<ShoeProduct> {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    return data.data;
  },

  async createProduct(productData: Partial<ShoeProduct>): Promise<ShoeProduct> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    return data.data;
  },

  async updateProduct(id: string, productData: Partial<ShoeProduct>): Promise<ShoeProduct> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    return data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Auth
  async login(email: string, role?: 'CUSTOMER' | 'ADMIN'): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return res.json();
  },

  async register(userData: { name: string; email: string; phone: string }): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  // Orders
  async getOrders(userId?: string, status?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    const res = await fetch(`/api/orders?${params.toString()}`);
    const data = await res.json();
    return data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    return data.data;
  },

  async createOrder(orderPayload: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    return data.data;
  },

  async updateOrderStatus(id: string, status: string, note?: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
    const data = await res.json();
    return data.data;
  },

  // Admin Analytics
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch('/api/analytics/dashboard');
    const data = await res.json();
    return data.data;
  },

  // BullMQ Queue Monitor
  async getQueueJobs(): Promise<{ metrics: any; jobs: QueueJob[] }> {
    const res = await fetch('/api/queue/jobs');
    const data = await res.json();
    return data;
  },

  async retryJob(id: string): Promise<QueueJob> {
    const res = await fetch(`/api/queue/jobs/retry/${id}`, { method: 'POST' });
    const data = await res.json();
    return data.data;
  },

  async triggerInventorySync(): Promise<any> {
    const res = await fetch('/api/queue/trigger-sync', { method: 'POST' });
    return res.json();
  }
};
