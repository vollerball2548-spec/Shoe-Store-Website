import {
  AdminAnalytics,
  AuthResponse,
  DbStatus,
  FilterState,
  Order,
  OrderStatus,
  Product,
  QueueJob,
  SqlQueryResult,
  User
} from '../types';

const SESSION_KEY = 'patsakorn.authenticated';
const LEGACY_TOKEN_KEY = 'patsakorn.token';

export function getStoredToken(): string | null {
  try {
    // Old bearer tokens are removed; new sessions use an HttpOnly cookie.
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function storeToken() {
  localStorage.setItem(SESSION_KEY, '1');
}

export function clearStoredToken() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(path, { ...init, headers, credentials: 'same-origin' });
  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || `เกิดข้อผิดพลาด (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { productId: string; selectedVariant: string; quantity: number }[];
  couponCode?: string;
  paymentMethod: 'PromptPay' | 'CreditCard' | 'COD';
  shippingAddress: Order['shippingAddress'];
}

export const api = {
  async getProducts(filter: Partial<FilterState> = {}): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filter.search) params.set('search', filter.search);
    if (filter.brands?.length) params.set('brand', filter.brands.join(','));
    if (filter.categories?.length) params.set('category', filter.categories.join(','));
    if (filter.maxPrice != null) params.set('maxPrice', String(filter.maxPrice));
    if (filter.inStockOnly) params.set('inStock', 'true');
    if (filter.sortBy) params.set('sortBy', filter.sortBy);
    const result = await request<{ data: Product[] }>(`/api/products?${params.toString()}`);
    return result.data;
  },

  async getProduct(id: string): Promise<Product> {
    const result = await request<{ data: Product }>(`/api/products/${encodeURIComponent(id)}`);
    return result.data;
  },

  async createProduct(input: Partial<Product>): Promise<Product> {
    const result = await request<{ data: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    return result.data;
  },

  async updateProduct(id: string, input: Partial<Product>): Promise<Product> {
    const result = await request<{ data: Product }>(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
    return result.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await request(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST' });
  },

  async register(input: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async me(): Promise<User> {
    const result = await request<{ user: User }>('/api/auth/me');
    return result.user;
  },

  async getOrders(status?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.set('status', status);
    const result = await request<{ data: Order[] }>(`/api/orders?${params.toString()}`);
    return result.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const result = await request<{ data: Order }>(`/api/orders/${encodeURIComponent(id)}`);
    return result.data;
  },

  async createOrder(payload: CheckoutPayload): Promise<Order> {
    const result = await request<{ data: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return result.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    const result = await request<{ data: Order }>(
      `/api/orders/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, note })
      }
    );
    return result.data;
  },

  async markOrderPaid(id: string): Promise<Order> {
    const result = await request<{ data: Order }>(
      `/api/orders/${encodeURIComponent(id)}/payment`,
      { method: 'PATCH', body: JSON.stringify({ paymentStatus: 'PAID' }) }
    );
    return result.data;
  },

  async getAnalytics(): Promise<AdminAnalytics> {
    const result = await request<{ data: AdminAnalytics }>('/api/analytics/dashboard');
    return result.data;
  },

  async getQueueJobs(): Promise<{
    metrics: { waiting: number; active: number; completed: number; failed: number };
    jobs: QueueJob[];
  }> {
    return request('/api/queue/jobs');
  },

  async retryJob(id: string): Promise<QueueJob> {
    const result = await request<{ data: QueueJob }>(
      `/api/queue/jobs/retry/${encodeURIComponent(id)}`,
      { method: 'POST' }
    );
    return result.data;
  },

  async triggerInventorySync(): Promise<QueueJob> {
    const result = await request<{ job: QueueJob }>('/api/queue/trigger-sync', {
      method: 'POST',
      body: JSON.stringify({})
    });
    return result.job;
  },

  async getDbStatus(): Promise<DbStatus> {
    const result = await request<{ data: DbStatus }>('/api/admin/db/status');
    return result.data;
  },

  async runSql(sql: string): Promise<SqlQueryResult> {
    const result = await request<{ data: SqlQueryResult }>('/api/admin/db/query', {
      method: 'POST',
      body: JSON.stringify({ sql })
    });
    return result.data;
  },

  async subscribeNewsletter(email: string): Promise<{ created: boolean; message: string }> {
    return request('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }
};
