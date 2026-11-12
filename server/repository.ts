import crypto from "crypto";
import {
  AdminAnalytics,
  DbStatus,
  DbTableInfo,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  ProductReview,
  ProductVariant,
  QueueJob,
  SqlQueryResult,
  User,
} from "../src/types";
import { getDbMode, getDbTarget, query, withTransaction } from "./db";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80";

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone || undefined,
    avatar: row.avatar || undefined,
  };
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category as ProductCategory,
    price: Number(row.price),
    originalPrice: row.original_price == null ? undefined : Number(row.original_price),
    description: row.description || "",
    story: row.story || "",
    sku: row.sku,
    subtitle: row.subtitle || "",
    images: parseJson<string[]>(row.images, [FALLBACK_IMAGE]),
    variants: parseJson<ProductVariant[]>(row.variants, []),
    totalStock: Number(row.total_stock || 0),
    rating: Number(row.rating || 5),
    reviewCount: Number(row.review_count || 0),
    reviews: parseJson<ProductReview[]>(row.reviews, []),
    badge: row.badge || undefined,
    isFeatured: Boolean(row.is_featured),
    createdAt: toIso(row.created_at),
  };
}

function mapOrder(row: any, normalizedItems?: Order["items"]): Order {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    items: normalizedItems?.length ? normalizedItems : parseJson(row.items, []),
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    shippingFee: Number(row.shipping_fee || 0),
    totalAmount: Number(row.total_amount || 0),
    couponCode: row.coupon_code || undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: parseJson(row.shipping_address, {
      fullName: "",
      phone: "",
      email: "",
      addressLine: "",
      district: "",
      province: "",
      postalCode: "",
    }),
    trackingNumber: row.tracking_number || undefined,
    carrier: row.carrier || undefined,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    statusHistory: parseJson(row.status_history, []),
  };
}

function mapJob(row: any): QueueJob {
  return {
    id: row.id,
    queueName: row.queue_name,
    jobName: row.job_name,
    data: parseJson(row.data, {}),
    status: row.status,
    progress: Number(row.progress || 0),
    attempts: Number(row.attempts || 1),
    maxAttempts: Number(row.max_attempts || 3),
    logs: parseJson<string[]>(row.logs, []),
    createdAt: toIso(row.created_at),
    finishedAt: row.finished_at ? toIso(row.finished_at) : undefined,
    errorMessage: row.error_message || undefined,
  };
}

function sanitizeVariants(variants: Partial<ProductVariant>[] | undefined): ProductVariant[] {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [{ label: "Standard", stock: 10 }];
  }
  return variants.map((variant) => ({
    label: String(variant.label || "Standard").trim() || "Standard",
    stock: Math.max(0, Number(variant.stock) || 0),
  }));
}

function sanitizeImages(images: string[] | undefined): string[] {
  const cleaned = (images || []).map((image) => String(image).trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [FALLBACK_IMAGE];
}

const PRODUCT_SORT: Record<string, string> = {
  featured: "is_featured DESC, created_at DESC",
  "price-asc": "price ASC",
  "price-desc": "price DESC",
  newest: "created_at DESC",
  rating: "rating DESC, review_count DESC",
};

export interface ProductQuery {
  search?: string;
  brands?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: string;
}

export async function listProducts(params: ProductQuery = {}): Promise<Product[]> {
  const where: string[] = [];
  const values: unknown[] = [];
  const placeholder = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (params.search?.trim()) {
    const value = `%${params.search.trim().toLowerCase()}%`;
    const p = placeholder(value);
    where.push(
      `(LOWER(name) LIKE ${p} OR LOWER(brand) LIKE ${p} OR LOWER(category) LIKE ${p} OR LOWER(sku) LIKE ${p})`
    );
  }

  if (params.brands?.length) {
    const placeholders = params.brands.map((brand) => placeholder(brand));
    where.push(`brand IN (${placeholders.join(", ")})`);
  }

  if (params.categories?.length) {
    const placeholders = params.categories.map((category) => placeholder(category));
    where.push(`category IN (${placeholders.join(", ")})`);
  }

  if (params.minPrice != null && Number.isFinite(params.minPrice)) {
    where.push(`price >= ${placeholder(params.minPrice)}`);
  }

  if (params.maxPrice != null && Number.isFinite(params.maxPrice)) {
    where.push(`price <= ${placeholder(params.maxPrice)}`);
  }

  if (params.inStockOnly) {
    where.push("total_stock > 0");
  }

  const orderBy = PRODUCT_SORT[params.sortBy || "featured"] || PRODUCT_SORT.featured;
  const sql = `SELECT * FROM products${
    where.length ? ` WHERE ${where.join(" AND ")}` : ""
  } ORDER BY ${orderBy}`;

  const result = await query(sql, values);
  return result.rows.map(mapProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const result = await query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

export async function createProduct(input: Partial<Product>): Promise<Product> {
  if (!input.name?.trim()) throw new AppError("กรุณากรอกชื่อสินค้า");
  if (!input.price || Number(input.price) <= 0) throw new AppError("กรุณากรอกราคาสินค้าให้ถูกต้อง");

  const id = input.id || `p-${crypto.randomUUID().slice(0, 8)}`;
  const variants = sanitizeVariants(input.variants);
  const images = sanitizeImages(input.images);
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

  await query(
    `INSERT INTO products (
      id, name, brand, category, price, original_price, description, story,
      sku, subtitle, images, variants, total_stock, rating, review_count,
      reviews, badge, is_featured, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
    [
      id,
      input.name.trim(),
      input.brand?.trim() || "Patsakorn Studio",
      input.category || "Sneakers",
      Number(input.price),
      input.originalPrice ? Number(input.originalPrice) : null,
      input.description || "",
      input.story || "",
      input.sku?.trim() || `SKU-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      input.subtitle || "",
      JSON.stringify(images),
      JSON.stringify(variants),
      totalStock,
      Number(input.rating || 5),
      Number(input.reviewCount || 0),
      JSON.stringify(input.reviews || []),
      input.badge || null,
      Boolean(input.isFeatured),
      input.createdAt || new Date().toISOString(),
    ]
  );

  const product = await getProduct(id);
  if (!product) throw new AppError("ไม่สามารถสร้างสินค้าได้", 500);
  return product;
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product> {
  const existing = await getProduct(id);
  if (!existing) throw new AppError("ไม่พบสินค้าที่ต้องการแก้ไข", 404);

  const merged: Product = {
    ...existing,
    ...input,
    id,
    variants: input.variants ? sanitizeVariants(input.variants) : existing.variants,
    images: input.images ? sanitizeImages(input.images) : existing.images,
  };
  const totalStock = merged.variants.reduce((sum, variant) => sum + variant.stock, 0);

  await query(
    `UPDATE products SET
      name = $2, brand = $3, category = $4, price = $5, original_price = $6,
      description = $7, story = $8, sku = $9, subtitle = $10, images = $11,
      variants = $12, total_stock = $13, rating = $14, review_count = $15,
      reviews = $16, badge = $17, is_featured = $18
    WHERE id = $1`,
    [
      id,
      merged.name,
      merged.brand,
      merged.category,
      merged.price,
      merged.originalPrice ?? null,
      merged.description,
      merged.story,
      merged.sku,
      merged.subtitle,
      JSON.stringify(merged.images),
      JSON.stringify(merged.variants),
      totalStock,
      merged.rating,
      merged.reviewCount,
      JSON.stringify(merged.reviews),
      merged.badge ?? null,
      Boolean(merged.isFeatured),
    ]
  );

  const product = await getProduct(id);
  if (!product) throw new AppError("ไม่สามารถอัปเดตสินค้าได้", 500);
  return product;
}

export async function deleteProduct(id: string): Promise<Product> {
  const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
  if (!result.rows[0]) throw new AppError("ไม่พบสินค้าที่ต้องการลบ", 404);
  return mapProduct(result.rows[0]);
}

export async function findUserByEmail(
  email: string
): Promise<{ user: User; passwordHash: string } | null> {
  const result = await query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email.trim()]);
  if (!result.rows[0]) return null;
  return {
    user: mapUser(result.rows[0]),
    passwordHash: result.rows[0].password_hash,
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
}): Promise<User> {
  const id = `user-${crypto.randomUUID().slice(0, 8)}`;
  await query(
    `INSERT INTO users (id, name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, 'CUSTOMER', $5)`,
    [
      id,
      input.name.trim(),
      input.email.trim().toLowerCase(),
      input.passwordHash,
      input.phone || null,
    ]
  );
  const user = await findUserById(id);
  if (!user) throw new AppError("ไม่สามารถสร้างบัญชีผู้ใช้ได้", 500);
  return user;
}

export async function listOrders(
  params: { userId?: string; status?: string } = {}
): Promise<Order[]> {
  const where: string[] = [];
  const values: unknown[] = [];
  const placeholder = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (params.userId) where.push(`user_id = ${placeholder(params.userId)}`);
  if (params.status && params.status !== "ALL") {
    where.push(`order_status = ${placeholder(params.status)}`);
  }

  const result = await query(
    `SELECT * FROM orders${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC`,
    values
  );
  const itemRows = await loadOrderItems(result.rows.map((row) => row.id));
  return result.rows.map((row) => mapOrder(row, itemRows.get(row.id)));
}

async function loadOrderItems(orderIds: string[]): Promise<Map<string, Order["items"]>> {
  if (orderIds.length === 0) return new Map();

  const placeholders = orderIds.map((_, index) => `$${index + 1}`);
  const result = await query(
    `SELECT order_id, product_id, product_name, brand, category, image,
      selected_variant, unit_price, quantity
     FROM order_items
     WHERE order_id IN (${placeholders.join(", ")})
     ORDER BY order_id, line_number`,
    orderIds
  );

  const itemsByOrder = new Map<string, Order["items"]>();
  for (const row of result.rows) {
    const items = itemsByOrder.get(row.order_id) || [];
    items.push({
      productId: row.product_id || "",
      productName: row.product_name,
      brand: row.brand,
      category: row.category,
      image: row.image || "",
      selectedVariant: row.selected_variant,
      unitPrice: Number(row.unit_price),
      quantity: Number(row.quantity),
    });
    itemsByOrder.set(row.order_id, items);
  }
  return itemsByOrder;
}

export async function getOrder(id: string): Promise<Order | null> {
  const result = await query("SELECT * FROM orders WHERE id = $1", [id]);
  if (!result.rows[0]) return null;
  const itemRows = await loadOrderItems([id]);
  return mapOrder(result.rows[0], itemRows.get(id));
}

export interface CreateOrderInput {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { productId: string; selectedVariant: string; quantity: number }[];
  couponCode?: string;
  paymentMethod: "PromptPay" | "CreditCard" | "COD";
  shippingAddress: Order["shippingAddress"];
}

const COUPON_VALUES: Record<string, number> = {
  MIX300: 300,
  MIX500: 500,
  MIX800: 800,
  MIX1000: 1000,
};

function calculateDiscount(couponCode: string | undefined, subtotal: number): number {
  if (!couponCode) return 0;
  const code = couponCode.toUpperCase();
  if (code === "MIX10") return Math.round(subtotal * 0.1);
  return Math.min(subtotal, COUPON_VALUES[code] || 0);
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new AppError("ตะกร้าสินค้าว่างเปล่า");
  }
  if (!input.customerName?.trim() || !input.customerEmail?.trim() || !input.customerPhone?.trim()) {
    throw new AppError("กรุณากรอกข้อมูลผู้รับให้ครบถ้วน");
  }

  const created = await withTransaction(async (client) => {
    const orderItems: Order["items"] = [];
    let subtotal = 0;

    for (const item of input.items) {
      const productResult = await client.query("SELECT * FROM products WHERE id = $1", [
        item.productId,
      ]);
      if (!productResult.rows[0]) {
        throw new AppError(`ไม่พบสินค้า ${item.productId}`, 404);
      }
      const product = mapProduct(productResult.rows[0]);
      const variant = product.variants.find((entry) => entry.label === item.selectedVariant);
      if (!variant) {
        throw new AppError(`ไม่พบตัวเลือก ${item.selectedVariant} ของ ${product.name}`, 400);
      }
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      if (variant.stock < quantity) {
        throw new AppError(`สต็อก ${product.name} (${variant.label}) ไม่เพียงพอ`, 409);
      }

      variant.stock -= quantity;
      const totalStock = product.variants.reduce((sum, entry) => sum + entry.stock, 0);
      await client.query("UPDATE products SET variants = $2, total_stock = $3 WHERE id = $1", [
        product.id,
        JSON.stringify(product.variants),
        totalStock,
      ]);

      subtotal += product.price * quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        image: product.images[0],
        selectedVariant: variant.label,
        unitPrice: product.price,
        quantity,
      });
    }

    const discount = calculateDiscount(input.couponCode, subtotal);
    const shippingFee =
      input.couponCode?.trim().toUpperCase() === "FREESHIP" || subtotal >= 1500 ? 0 : 80;
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const orderId = `ORD-${datePart}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const statusHistory = [
      {
        status: "PENDING" as OrderStatus,
        timestamp: now.toISOString(),
        note: `สร้างคำสั่งซื้อผ่าน ${input.paymentMethod} และรอตรวจสอบสต็อก`,
      },
    ];

    const result = await client.query(
      `INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone, items,
        subtotal, discount, shipping_fee, total_amount, coupon_code,
        payment_method, payment_status, order_status, shipping_address,
        tracking_number, carrier, status_history, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $19
      ) RETURNING *`,
      [
        orderId,
        input.userId || "guest",
        input.customerName.trim(),
        input.customerEmail.trim(),
        input.customerPhone.trim(),
        JSON.stringify(orderItems),
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        input.couponCode || null,
        input.paymentMethod,
        input.paymentMethod === "COD" ? "PENDING" : "PAID",
        "PENDING",
        JSON.stringify(input.shippingAddress),
        null,
        input.paymentMethod === "COD" ? "Kerry Express Thailand" : "Flash Express",
        JSON.stringify(statusHistory),
        now.toISOString(),
      ]
    );

    for (const [index, item] of orderItems.entries()) {
      await client.query(
        `INSERT INTO order_items (
          order_id, line_number, product_id, product_name, brand, category,
          image, selected_variant, unit_price, quantity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          orderId,
          index + 1,
          item.productId,
          item.productName,
          item.brand,
          item.category,
          item.image || null,
          item.selectedVariant,
          item.unitPrice,
          item.quantity,
        ]
      );
    }

    return mapOrder(result.rows[0], orderItems);
  });

  return created;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string
): Promise<Order> {
  const existing = await getOrder(id);
  if (!existing) throw new AppError("ไม่พบคำสั่งซื้อ", 404);

  const history = [
    ...existing.statusHistory,
    {
      status,
      timestamp: new Date().toISOString(),
      note: note || `เปลี่ยนสถานะเป็น ${status} โดยผู้ดูแลร้าน`,
    },
  ];

  await query(
    `UPDATE orders SET order_status = $2, status_history = $3, updated_at = $4 WHERE id = $1`,
    [id, status, JSON.stringify(history), new Date().toISOString()]
  );

  const order = await getOrder(id);
  if (!order) throw new AppError("ไม่สามารถอัปเดตคำสั่งซื้อได้", 500);
  return order;
}

export async function listJobs(limit = 50): Promise<QueueJob[]> {
  const result = await query("SELECT * FROM queue_jobs ORDER BY created_at DESC LIMIT $1", [limit]);
  return result.rows.map(mapJob);
}

export async function getJob(id: string): Promise<QueueJob | null> {
  const result = await query("SELECT * FROM queue_jobs WHERE id = $1", [id]);
  return result.rows[0] ? mapJob(result.rows[0]) : null;
}

export async function createJob(input: {
  queueName: QueueJob["queueName"];
  jobName: string;
  data: Record<string, any>;
  logs?: string[];
}): Promise<QueueJob> {
  const id = `job-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const now = new Date().toISOString();
  await query(
    `INSERT INTO queue_jobs (
      id, queue_name, job_name, data, status, progress, attempts,
      max_attempts, logs, created_at
    ) VALUES ($1, $2, $3, $4, 'waiting', 0, 1, 3, $5, $6)`,
    [
      id,
      input.queueName,
      input.jobName,
      JSON.stringify(input.data),
      JSON.stringify(input.logs || [`[Queue] Job submitted at ${now}`]),
      now,
    ]
  );
  const job = await getJob(id);
  if (!job) throw new AppError("ไม่สามารถสร้างงานในคิวได้", 500);
  return job;
}

export async function updateJob(
  id: string,
  patch: Partial<
    Pick<QueueJob, "status" | "progress" | "logs" | "finishedAt" | "errorMessage" | "attempts">
  >
): Promise<QueueJob> {
  const existing = await getJob(id);
  if (!existing) throw new AppError("ไม่พบงานในคิว", 404);
  const merged = { ...existing, ...patch };
  await query(
    `UPDATE queue_jobs SET status = $2, progress = $3, attempts = $4,
      logs = $5, finished_at = $6, error_message = $7 WHERE id = $1`,
    [
      id,
      merged.status,
      merged.progress,
      merged.attempts,
      JSON.stringify(merged.logs),
      merged.finishedAt ?? null,
      merged.errorMessage ?? null,
    ]
  );
  const job = await getJob(id);
  if (!job) throw new AppError("ไม่สามารถอัปเดตงานในคิวได้", 500);
  return job;
}

export async function getQueueMetrics() {
  const jobs = await listJobs(100);
  return {
    waiting: jobs.filter((job) => job.status === "waiting").length,
    active: jobs.filter((job) => job.status === "active").length,
    completed: jobs.filter((job) => job.status === "completed").length,
    failed: jobs.filter((job) => job.status === "failed").length,
  };
}

export async function getAnalytics(): Promise<AdminAnalytics> {
  const [productsResult, ordersResult, customerResult, jobsResult] = await Promise.all([
    query("SELECT * FROM products"),
    query("SELECT * FROM orders ORDER BY created_at DESC"),
    query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'CUSTOMER'"),
    query("SELECT COUNT(*)::int AS count FROM queue_jobs WHERE status IN ('waiting', 'active')"),
  ]);

  const products = productsResult.rows.map(mapProduct);
  const orders = ordersResult.rows.map((row) => mapOrder(row));
  const validOrders = orders.filter((order) => order.orderStatus !== "CANCELLED");

  const totalRevenue = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "PENDING" || order.orderStatus === "PROCESSING"
  ).length;

  const categoryMap = new Map<string, { sales: number; revenue: number }>();
  for (const order of validOrders) {
    for (const item of order.items) {
      const current = categoryMap.get(item.category) || { sales: 0, revenue: 0 };
      current.sales += item.quantity;
      current.revenue += item.unitPrice * item.quantity;
      categoryMap.set(item.category, current);
    }
  }

  const salesByCategory = Array.from(categoryMap.entries())
    .map(([category, value]) => ({
      category: category as ProductCategory,
      sales: value.sales,
      revenue: value.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const recentSales: AdminAnalytics["recentSales"] = [];
  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);
    const key = date.toISOString().slice(0, 10);
    const dayOrders = validOrders.filter((order) => order.createdAt.slice(0, 10) === key);
    recentSales.push({
      date: key,
      label: date.toLocaleDateString("th-TH", { weekday: "short" }),
      revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      orders: dayOrders.length,
    });
  }

  const lowStockProducts = products
    .filter((product) => product.totalStock < 15)
    .sort((a, b) => a.totalStock - b.totalStock);

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: Number(customerResult.rows[0]?.count || 0),
    pendingOrders,
    lowStockCount: lowStockProducts.length,
    activeJobsCount: Number(jobsResult.rows[0]?.count || 0),
    recentSales,
    salesByCategory,
    lowStockProducts,
    recentOrders: orders.slice(0, 6),
  };
}

const DB_TABLE_DEFINITIONS: Omit<DbTableInfo, "rowCount">[] = [
  {
    name: "products",
    label: "สินค้า",
    description: "แคตตาล็อกสินค้า mixed shop พร้อม variants และรีวิวแบบ JSONB",
    columns: [
      "id",
      "name",
      "brand",
      "category",
      "price",
      "original_price",
      "sku",
      "subtitle",
      "images",
      "variants",
      "total_stock",
      "rating",
      "review_count",
      "reviews",
      "badge",
      "is_featured",
      "created_at",
    ],
  },
  {
    name: "orders",
    label: "คำสั่งซื้อ",
    description: "ออเดอร์ลูกค้า พร้อม snapshots ของสินค้า ที่อยู่ และ timeline",
    columns: [
      "id",
      "user_id",
      "customer_name",
      "customer_email",
      "items",
      "subtotal",
      "discount",
      "shipping_fee",
      "total_amount",
      "coupon_code",
      "payment_method",
      "payment_status",
      "order_status",
      "shipping_address",
      "tracking_number",
      "status_history",
      "created_at",
      "updated_at",
    ],
  },
  {
    name: "order_items",
    label: "รายการสินค้าในคำสั่งซื้อ",
    description: "รายการสินค้าแบบ relational พร้อม snapshot ชื่อ ราคา และตัวเลือก ณ เวลาสั่งซื้อ",
    columns: [
      "order_id",
      "line_number",
      "product_id",
      "product_name",
      "brand",
      "category",
      "image",
      "selected_variant",
      "unit_price",
      "quantity",
    ],
  },
  {
    name: "users",
    label: "ผู้ใช้",
    description: "บัญชีลูกค้าและผู้ดูแลร้าน พร้อม password hash จาก scrypt",
    columns: ["id", "name", "email", "password_hash", "role", "phone", "avatar", "created_at"],
  },
  {
    name: "queue_jobs",
    label: "งานเบื้องหลัง",
    description: "คิวงาน asynchronous สำหรับ order processing, email และ inventory sync",
    columns: [
      "id",
      "queue_name",
      "job_name",
      "data",
      "status",
      "progress",
      "attempts",
      "max_attempts",
      "logs",
      "created_at",
      "finished_at",
    ],
  },
  {
    name: "newsletter_subscribers",
    label: "ผู้รับข่าวสาร",
    description: "อีเมลที่สมัครรับข่าวสารจากหน้าเว็บ",
    columns: ["id", "email", "created_at"],
  },
];

export async function getDbStatus(): Promise<DbStatus> {
  const tables: DbTableInfo[] = [];
  for (const table of DB_TABLE_DEFINITIONS) {
    const result = await query(`SELECT COUNT(*)::int AS count FROM ${table.name}`);
    tables.push({ ...table, rowCount: Number(result.rows[0]?.count || 0) });
  }

  const mode = getDbMode();
  return {
    mode,
    label: mode === "postgres" ? "PostgreSQL" : "PostgreSQL (pg-mem)",
    target: getDbTarget(),
    tables,
  };
}

export async function runReadOnlySql(sql: string): Promise<SqlQueryResult> {
  const cleaned = sql.trim().replace(/;+\s*$/, "");
  if (!cleaned) throw new AppError("กรุณาพิมพ์คำสั่ง SQL");
  if (!/^(select|with)\b/i.test(cleaned)) {
    throw new AppError("SQL Console อนุญาตเฉพาะ SELECT หรือ WITH ... SELECT เท่านั้น");
  }
  if (cleaned.includes(";")) {
    throw new AppError("อนุญาตให้รันได้ครั้งละหนึ่งคำสั่งเท่านั้น");
  }
  if (
    /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|do|vacuum|reindex|refresh|merge)\b/i.test(
      cleaned
    )
  ) {
    throw new AppError("ตรวจพบคำสั่งที่ไม่อนุญาต ในโหมดนี้เปิดให้อ่านข้อมูลเท่านั้น");
  }

  const startedAt = Date.now();
  const result = await query(`SELECT * FROM (${cleaned}) AS _sql_result LIMIT 200`);
  const sqlDurationMs = Date.now() - startedAt;
  const fields = result.fields?.map((field) => field.name).filter(Boolean) || [];
  const columns = fields.length > 0 ? fields : result.rows[0] ? Object.keys(result.rows[0]) : [];

  return {
    columns,
    rows: result.rows,
    rowCount: result.rows.length,
    durationMs: sqlDurationMs,
    truncated: result.rows.length >= 200,
  };
}

export async function subscribeToNewsletter(email: string): Promise<{ created: boolean }> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new AppError("กรุณากรอกอีเมลให้ถูกต้อง");
  }
  const existing = await query("SELECT id FROM newsletter_subscribers WHERE LOWER(email) = $1", [
    normalized,
  ]);
  if (existing.rows[0]) return { created: false };

  await query("INSERT INTO newsletter_subscribers (id, email) VALUES ($1, $2)", [
    `sub-${crypto.randomUUID().slice(0, 8)}`,
    normalized,
  ]);
  return { created: true };
}
