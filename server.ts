import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_JOBS } from './src/data/mockProducts';
import { ShoeProduct, Order, QueueJob, User, OrderStatus } from './src/types';

// In-Memory Database State for Live Server
let products: ShoeProduct[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let jobs: QueueJob[] = JSON.parse(JSON.stringify(INITIAL_JOBS));

// Default demo users
const users: User[] = [
  {
    id: 'user-customer-1',
    name: 'Somchai Prasert',
    email: 'customer@kickslab.com',
    role: 'CUSTOMER',
    phone: '081-234-5678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    address: {
      fullName: 'Somchai Prasert',
      phone: '081-234-5678',
      email: 'customer@kickslab.com',
      addressLine: '99/12 Sukhumvit Soi 21 (Asoke)',
      district: 'Watthana',
      province: 'Bangkok',
      postalCode: '10110',
      notes: 'ฝากไว้ที่นิติบุคคลคอนโด'
    }
  },
  {
    id: 'user-admin-1',
    name: 'Admin Supakit (1Moby Dev)',
    email: 'admin@kickslab.com',
    role: 'ADMIN',
    phone: '089-888-9999',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
  }
];

// Asynchronous BullMQ Background Worker Simulator
function dispatchJob(
  queueName: QueueJob['queueName'],
  jobName: string,
  data: Record<string, any>,
  callback?: () => void
): QueueJob {
  const newJob: QueueJob = {
    id: `job-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 900 + 100)}`,
    queueName,
    jobName,
    data,
    status: 'waiting',
    progress: 0,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      `[BullMQ:Worker] Job submitted to Redis queue "${queueName}" at ${new Date().toLocaleTimeString('th-TH')}`,
    ],
    createdAt: new Date().toISOString()
  };

  jobs.unshift(newJob);

  // Simulate async worker pickup after 500ms
  setTimeout(() => {
    newJob.status = 'active';
    newJob.progress = 35;
    newJob.logs.push(`[BullMQ:Worker] Worker picked up job #${newJob.id} on process thread.`);

    setTimeout(() => {
      newJob.progress = 75;
      if (queueName === 'order-processing') {
        newJob.logs.push(`[InventoryService] Verified stock lock & generated barcode for ${data.orderId}`);
      } else if (queueName === 'email-notification') {
        newJob.logs.push(`[MailerGateway] SMTP Handshake OK. Dispatched confirmation HTML to ${data.email || 'customer'}`);
      } else if (queueName === 'inventory-sync') {
        newJob.logs.push(`[MySQL:Sync] Multi-warehouse inventory stock verified across all branches.`);
      }

      setTimeout(() => {
        newJob.status = 'completed';
        newJob.progress = 100;
        newJob.finishedAt = new Date().toISOString();
        newJob.logs.push(`[BullMQ:Worker] Successfully executed job #${newJob.id} in ${(Math.random() * 0.4 + 0.6).toFixed(2)}s`);
        if (callback) callback();
      }, 800);
    }, 700);
  }, 500);

  return newJob;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // REST API ENDPOINTS
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'KicksLab NestJS/Express REST Gateway',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // GET Products (with search, filter, sort)
  app.get('/api/products', (req, res) => {
    let result = [...products];
    const { search, brand, category, minPrice, maxPrice, inStock, sortBy, gender } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (brand && typeof brand === 'string') {
      const brands = brand.split(',');
      result = result.filter(p => brands.includes(p.brand));
    }

    if (category && typeof category === 'string') {
      const categories = category.split(',');
      result = result.filter(p => categories.includes(p.category));
    }

    if (gender && typeof gender === 'string' && gender !== 'All') {
      result = result.filter(p => p.gender === gender || p.gender === 'Unisex');
    }

    if (minPrice) {
      result = result.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      result = result.filter(p => p.price <= Number(maxPrice));
    }

    if (inStock === 'true') {
      result = result.filter(p => p.totalStock > 0);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  });

  // GET Single Product
  app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  });

  // POST Create Product (Admin)
  app.post('/api/products', (req, res) => {
    const newProduct: ShoeProduct = {
      id: `shoe-${Date.now()}`,
      name: req.body.name,
      brand: req.body.brand || 'Nike',
      category: req.body.category || 'Lifestyle',
      price: Number(req.body.price),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      description: req.body.description || '',
      story: req.body.story || '',
      sku: req.body.sku || `SKU-${Math.floor(Math.random() * 90000 + 10000)}`,
      colorway: req.body.colorway || 'Original',
      images: req.body.images && req.body.images.length > 0 ? req.body.images : [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
      ],
      sizes: req.body.sizes || [
        { size: 'US 8', stock: 5 },
        { size: 'US 8.5', stock: 5 },
        { size: 'US 9', stock: 5 },
        { size: 'US 9.5', stock: 5 },
        { size: 'US 10', stock: 5 }
      ],
      totalStock: 0,
      rating: 5.0,
      reviewCount: 0,
      reviews: [],
      badge: req.body.badge || 'NEW',
      gender: req.body.gender || 'Unisex',
      isFeatured: req.body.isFeatured || false,
      createdAt: new Date().toISOString()
    };

    newProduct.totalStock = newProduct.sizes.reduce((acc, s) => acc + s.stock, 0);
    products.unshift(newProduct);

    // Dispatch background inventory indexing job
    dispatchJob('inventory-sync', 'index-new-product-sku', { productId: newProduct.id, sku: newProduct.sku });

    res.status(201).json({ success: true, data: newProduct });
  });

  // PUT Update Product (Admin)
  app.put('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updated = { ...products[idx], ...req.body };
    if (updated.sizes) {
      updated.totalStock = updated.sizes.reduce((acc: number, s: any) => acc + (Number(s.stock) || 0), 0);
    }

    products[idx] = updated;
    res.json({ success: true, data: updated });
  });

  // DELETE Product (Admin)
  app.delete('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const deleted = products.splice(idx, 1)[0];
    res.json({ success: true, message: 'Product deleted', data: deleted });
  });

  // POST Auth Login
  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    const user = users.find(u => u.email === email) || {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: role || (email.includes('admin') ? 'ADMIN' : 'CUSTOMER'),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };

    res.json({
      success: true,
      token: `jwt_token_${user.id}_${Date.now()}`,
      user
    });
  });

  // POST Auth Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone } = req.body;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };
    users.push(newUser);
    res.status(201).json({
      success: true,
      token: `jwt_token_${newUser.id}_${Date.now()}`,
      user: newUser
    });
  });

  // GET Orders
  app.get('/api/orders', (req, res) => {
    const { userId, status } = req.query;
    let result = [...orders];

    if (userId && typeof userId === 'string') {
      result = result.filter(o => o.userId === userId);
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      result = result.filter(o => o.orderStatus === status);
    }

    res.json({
      success: true,
      count: result.length,
      data: result
    });
  });

  // GET Single Order
  app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  });

  // POST Create Order (Checkout) -> Triggers BullMQ background queue!
  app.post('/api/orders', (req, res) => {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      discount,
      shippingFee,
      totalAmount,
      couponCode,
      paymentMethod,
      shippingAddress
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    // 1. Check stock & decrement
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const sizeObj = product.sizes.find(s => s.size === item.selectedSize);
        if (sizeObj) {
          sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);
        }
        product.totalStock = product.sizes.reduce((acc, s) => acc + s.stock, 0);
      }
    }

    // 2. Generate Order ID
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderId = `ORD-${today}-${Math.floor(Math.random() * 900 + 100)}`;

    const newOrder: Order = {
      id: orderId,
      userId: userId || 'user-customer-1',
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal: Number(subtotal),
      discount: Number(discount || 0),
      shippingFee: Number(shippingFee || 0),
      totalAmount: Number(totalAmount),
      couponCode,
      paymentMethod: paymentMethod || 'PromptPay',
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'PENDING',
      shippingAddress,
      trackingNumber: `TH-KEX-${Math.floor(Math.random() * 90000000 + 10000000)}`,
      carrier: 'Kerry Express Thailand',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          note: `Order placed via ${paymentMethod}. Queued for BullMQ asynchronous processing.`
        }
      ]
    };

    orders.unshift(newOrder);

    // 3. Dispatch BullMQ Background Jobs
    // Job 1: Process order workflow
    dispatchJob('order-processing', 'process-new-order', {
      orderId: newOrder.id,
      customer: customerName,
      amount: totalAmount,
      itemCount: items.length
    }, () => {
      // Auto-progress order to PROCESSING once worker finishes
      const target = orders.find(o => o.id === newOrder.id);
      if (target && target.orderStatus === 'PENDING') {
        target.orderStatus = 'PROCESSING';
        target.updatedAt = new Date().toISOString();
        target.statusHistory.push({
          status: 'PROCESSING',
          timestamp: new Date().toISOString(),
          note: 'BullMQ Background Worker verified inventory & sent to warehouse fulfillment.'
        });
      }
    });

    // Job 2: Send confirmation email
    dispatchJob('email-notification', 'send-order-confirmation-email', {
      orderId: newOrder.id,
      recipient: customerEmail,
      name: customerName,
      total: totalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Order created and queued successfully',
      data: newOrder
    });
  });

  // PATCH Order Status (Admin)
  app.patch('/api/orders/:id/status', (req, res) => {
    const { status, note } = req.body;
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status as OrderStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: status as OrderStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${status} by Admin.`
    });

    if (status === 'SHIPPED') {
      // Dispatch background notification job
      dispatchJob('email-notification', 'send-shipping-tracking-sms', {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        recipient: order.customerEmail
      });
    }

    res.json({ success: true, data: order });
  });

  // GET Analytics (Admin Dashboard)
  app.get('/api/analytics/dashboard', (req, res) => {
    const totalRevenue = orders
      .filter(o => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING').length;
    const lowStockCount = products.filter(p => p.totalStock < 15).length;

    // Aggregate by brand
    const brandMap: Record<string, { sales: number; revenue: number }> = {};
    for (const o of orders) {
      if (o.orderStatus === 'CANCELLED') continue;
      for (const item of o.items) {
        if (!brandMap[item.brand]) {
          brandMap[item.brand] = { sales: 0, revenue: 0 };
        }
        brandMap[item.brand].sales += item.quantity;
        brandMap[item.brand].revenue += item.unitPrice * item.quantity;
      }
    }

    const salesByBrand = Object.entries(brandMap).map(([brand, val]) => ({
      brand: brand as any,
      sales: val.sales,
      revenue: val.revenue
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: users.filter(u => u.role === 'CUSTOMER').length + 5,
        pendingOrders,
        lowStockCount,
        activeJobsCount: jobs.filter(j => j.status === 'active' || j.status === 'waiting').length,
        salesByBrand
      }
    });
  });

  // GET Queue Jobs (BullMQ Monitor)
  app.get('/api/queue/jobs', (req, res) => {
    res.json({
      success: true,
      totalJobs: jobs.length,
      metrics: {
        waiting: jobs.filter(j => j.status === 'waiting').length,
        active: jobs.filter(j => j.status === 'active').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length
      },
      jobs: jobs.slice(0, 30)
    });
  });

  // POST Trigger Sync
  app.post('/api/queue/trigger-sync', (req, res) => {
    const job = dispatchJob('inventory-sync', 'manual-warehouse-sync', {
      adminUser: 'Admin Supakit',
      target: 'All 8 SKUs & 45 Size Variants'
    });
    res.json({ success: true, message: 'Sync job queued in BullMQ', job });
  });

  // POST Retry Job
  app.post('/api/queue/jobs/retry/:id', (req, res) => {
    const job = jobs.find(j => j.id === req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.status = 'waiting';
    job.progress = 0;
    job.attempts += 1;
    job.logs.push(`[BullMQ:Admin] Retrying job #${job.id} (Attempt ${job.attempts}/${job.maxAttempts})`);

    setTimeout(() => {
      job.status = 'active';
      job.progress = 50;
      setTimeout(() => {
        job.status = 'completed';
        job.progress = 100;
        job.finishedAt = new Date().toISOString();
        job.logs.push(`[BullMQ:Worker] Job recovered and completed successfully.`);
      }, 800);
    }, 500);

    res.json({ success: true, message: 'Job retried', data: job });
  });

  // ----------------------------------------------------
  // Vite Middleware Setup
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`👟 KicksLab Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
