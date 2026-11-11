import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { getAuth, hashPassword, optionalAuth, requireAdmin, requireAuth, signToken, verifyPassword } from './server/auth';
import { initDb } from './server/db';
import {
  AppError,
  createOrder,
  createProduct,
  createUser,
  deleteProduct,
  findUserByEmail,
  findUserById,
  getAnalytics,
  getDbStatus,
  getOrder,
  getProduct,
  getQueueMetrics,
  listJobs,
  listOrders,
  listProducts,
  runReadOnlySql,
  subscribeToNewsletter,
  updateOrderStatus,
  updateProduct
} from './server/repository';
import {
  dispatchJob,
  dispatchOrderJobs,
  dispatchShippingNotification,
  retryQueueJob,
  triggerInventorySync
} from './server/jobs';
import { OrderStatus } from './src/types';

const PORT = Number(process.env.PORT) || 3000;
// `npm start` runs the bundled dist/server.cjs file. Treat that as production
// even when NODE_ENV is not set, so static assets are served instead of Vite.
const isProduction =
  process.env.NODE_ENV === 'production' || /dist[\\/]server\.cjs$/.test(process.argv[1] || '');

function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error('[server] Unhandled error:', error);
  const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';
  return res.status(500).json({ success: false, message });
}

function parseCsv(value: unknown): string[] {
  if (typeof value !== 'string' || !value.trim()) return [];
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

async function startServer() {
  await initDb();

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', async (_req, res) => {
    const db = await getDbStatus();
    res.json({
      status: 'ok',
      service: 'patsakorn. mix shop',
      database: db.mode,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // ------------------------------------------------------------------
  // Products
  // ------------------------------------------------------------------
  app.get('/api/products', async (req, res, next) => {
    try {
      const products = await listProducts({
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        brands: parseCsv(req.query.brand),
        categories: parseCsv(req.query.category),
        minPrice: req.query.minPrice != null ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice != null ? Number(req.query.maxPrice) : undefined,
        inStockOnly: req.query.inStock === 'true',
        sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined
      });
      res.json({ success: true, count: products.length, data: products });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/products/:id', async (req, res, next) => {
    try {
      const product = await getProduct(req.params.id);
      if (!product) throw new AppError('ไม่พบสินค้าที่ต้องการ', 404);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/products', requireAdmin, async (req, res, next) => {
    try {
      const product = await createProduct(req.body);
      await dispatchJob('inventory-sync', 'index-new-product-sku', {
        productId: product.id,
        sku: product.sku,
        target: 'แคตตาล็อกสินค้า'
      });
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/products/:id', requireAdmin, async (req, res, next) => {
    try {
      const product = await updateProduct(req.params.id, req.body);
      await dispatchJob('inventory-sync', 'refresh-product-index', {
        productId: product.id,
        sku: product.sku,
        target: 'แคตตาล็อกสินค้า'
      });
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/products/:id', requireAdmin, async (req, res, next) => {
    try {
      const product = await deleteProduct(req.params.id);
      res.json({ success: true, message: 'ลบสินค้าเรียบร้อย', data: product });
    } catch (error) {
      next(error);
    }
  });

  // ------------------------------------------------------------------
  // Authentication
  // ------------------------------------------------------------------
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const email = String(req.body?.email || '').trim();
      const password = String(req.body?.password || '');
      if (!email || !password) throw new AppError('กรุณากรอกอีเมลและรหัสผ่าน');

      const record = await findUserByEmail(email);
      if (!record || !verifyPassword(password, record.passwordHash)) {
        throw new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
      }

      const token = signToken({
        sub: record.user.id,
        role: record.user.role,
        name: record.user.name,
        email: record.user.email
      });
      res.json({ success: true, token, user: record.user });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const name = String(req.body?.name || '').trim();
      const email = String(req.body?.email || '').trim().toLowerCase();
      const phone = String(req.body?.phone || '').trim();
      const password = String(req.body?.password || '');

      if (!name) throw new AppError('กรุณากรอกชื่อของคุณ');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('กรุณากรอกอีเมลให้ถูกต้อง');
      if (password.length < 8) throw new AppError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');

      const existing = await findUserByEmail(email);
      if (existing) throw new AppError('อีเมลนี้ถูกใช้งานแล้ว', 409);

      const user = await createUser({ name, email, phone, passwordHash: hashPassword(password) });
      const token = signToken({
        sub: user.id,
        role: user.role,
        name: user.name,
        email: user.email
      });
      res.status(201).json({ success: true, token, user });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/me', requireAuth, async (req, res, next) => {
    try {
      const auth = getAuth(req);
      if (!auth) throw new AppError('กรุณาเข้าสู่ระบบ', 401);
      const user = await findUserById(auth.sub);
      if (!user) throw new AppError('ไม่พบข้อมูลผู้ใช้', 404);
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  });

  // ------------------------------------------------------------------
  // Orders
  // ------------------------------------------------------------------
  app.get('/api/orders', requireAuth, async (req, res, next) => {
    try {
      const auth = getAuth(req)!;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const userId =
        auth.role === 'ADMIN' && typeof req.query.userId === 'string' && req.query.userId
          ? req.query.userId
          : auth.role === 'ADMIN'
            ? undefined
            : auth.sub;

      const orders = await listOrders({ userId, status });
      res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/orders/:id', requireAuth, async (req, res, next) => {
    try {
      const auth = getAuth(req)!;
      const order = await getOrder(req.params.id);
      if (!order) throw new AppError('ไม่พบคำสั่งซื้อ', 404);
      if (auth.role !== 'ADMIN' && order.userId !== auth.sub) {
        throw new AppError('คุณไม่มีสิทธิ์ดูคำสั่งซื้อนี้', 403);
      }
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/orders', optionalAuth, async (req, res, next) => {
    try {
      const auth = getAuth(req);
      const order = await createOrder({
        userId: auth?.role === 'CUSTOMER' ? auth.sub : undefined,
        customerName: req.body?.customerName,
        customerEmail: req.body?.customerEmail,
        customerPhone: req.body?.customerPhone,
        items: req.body?.items,
        couponCode: req.body?.couponCode,
        paymentMethod: req.body?.paymentMethod || 'PromptPay',
        shippingAddress: req.body?.shippingAddress
      });

      await dispatchOrderJobs({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        items: order.items
      });

      res.status(201).json({
        success: true,
        message: 'สร้างคำสั่งซื้อและส่งงานเข้าคิวเรียบร้อย',
        data: order
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/orders/:id/status', requireAdmin, async (req, res, next) => {
    try {
      const status = String(req.body?.status || '') as OrderStatus;
      const allowed: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!allowed.includes(status)) throw new AppError('สถานะคำสั่งซื้อไม่ถูกต้อง');

      const order = await updateOrderStatus(req.params.id, status, req.body?.note);
      if (status === 'SHIPPED') {
        await dispatchShippingNotification(order);
      }
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  });

  // ------------------------------------------------------------------
  // Admin analytics
  // ------------------------------------------------------------------
  app.get('/api/analytics/dashboard', requireAdmin, async (_req, res, next) => {
    try {
      const analytics = await getAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  });

  // ------------------------------------------------------------------
  // Queue / automation
  // ------------------------------------------------------------------
  app.get('/api/queue/jobs', requireAdmin, async (_req, res, next) => {
    try {
      const [jobs, metrics] = await Promise.all([listJobs(60), getQueueMetrics()]);
      res.json({ success: true, totalJobs: jobs.length, metrics, jobs });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/queue/trigger-sync', requireAdmin, async (req, res, next) => {
    try {
      const auth = getAuth(req)!;
      const job = await triggerInventorySync(req.body?.adminUser || auth.name);
      res.json({ success: true, message: 'ส่งงานซิงก์สต็อกเข้าคิวแล้ว', job });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/queue/jobs/retry/:id', requireAdmin, async (req, res, next) => {
    try {
      const job = await retryQueueJob(req.params.id);
      res.json({ success: true, message: 'สั่งรันงานอีกครั้งแล้ว', data: job });
    } catch (error) {
      if (error instanceof Error && error.message === 'ไม่พบงานในคิว') {
        return next(new AppError(error.message, 404));
      }
      next(error);
    }
  });

  // ------------------------------------------------------------------
  // Database back office (read-only SQL console)
  // ------------------------------------------------------------------
  app.get('/api/admin/db/status', requireAdmin, async (_req, res, next) => {
    try {
      const status = await getDbStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/admin/db/query', requireAdmin, async (req, res, next) => {
    try {
      const result = await runReadOnlySql(String(req.body?.sql || ''));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });

  // ------------------------------------------------------------------
  // Newsletter
  // ------------------------------------------------------------------
  app.post('/api/newsletter', async (req, res, next) => {
    try {
      const result = await subscribeToNewsletter(String(req.body?.email || ''));
      res.json({
        success: true,
        created: result.created,
        message: result.created ? 'สมัครรับข่าวสารเรียบร้อยแล้ว' : 'อีเมลนี้สมัครรับข่าวสารอยู่แล้ว'
      });
    } catch (error) {
      next(error);
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, message: 'ไม่พบ API ที่ร้องขอ' });
  });

  // ------------------------------------------------------------------
  // Vite middleware / static build
  // ------------------------------------------------------------------
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[patsakorn.] shop ready at http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('[server] Failed to start:', error);
  process.exit(1);
});
