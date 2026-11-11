import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Database,
  LayoutDashboard,
  Loader2,
  Minus,
  Package,
  Pencil,
  Play,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingCart,
  Table2,
  Terminal,
  Trash2,
  TrendingUp,
  Users,
  Workflow,
  X,
  Zap
} from 'lucide-react';
import {
  AdminAnalytics,
  DbStatus,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  PRODUCT_CATEGORIES,
  QueueJob,
  SqlQueryResult,
  User
} from '../types';
import { api } from '../services/api';
import { BrandLogo } from './BrandLogo';
import {
  CATEGORY_META,
  ORDER_STATUS_META,
  PAYMENT_LABELS,
  cx,
  formatDate,
  formatPrice
} from '../lib/utils';

type AdminTab = 'overview' | 'products' | 'orders' | 'inventory' | 'database' | 'automation';

interface AdminDashboardProps {
  user: User;
  onExit: () => void;
  onStoreRefresh: () => void;
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

const TABS: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'ภาพรวม', icon: LayoutDashboard },
  { id: 'products', label: 'สินค้า', icon: Package },
  { id: 'orders', label: 'คำสั่งซื้อ', icon: ShoppingCart },
  { id: 'inventory', label: 'สต็อก', icon: Boxes },
  { id: 'database', label: 'ฐานข้อมูล', icon: Database },
  { id: 'automation', label: 'คิวงาน', icon: Workflow }
];

const ORDER_FILTERS: Array<{ value: 'ALL' | OrderStatus; label: string }> = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'PENDING', label: 'รอดำเนินการ' },
  { value: 'PROCESSING', label: 'กำลังเตรียม' },
  { value: 'SHIPPED', label: 'จัดส่งแล้ว' },
  { value: 'DELIVERED', label: 'สำเร็จ' },
  { value: 'CANCELLED', label: 'ยกเลิก' }
];

const SAMPLE_QUERIES = [
  {
    label: 'สินค้าราคาสูงสุด',
    sql: 'SELECT id, name, category, price, total_stock\nFROM products\nORDER BY price DESC\nLIMIT 10;'
  },
  {
    label: 'ยอดขายตามสถานะ',
    sql: 'SELECT order_status, COUNT(*) AS orders, SUM(total_amount) AS revenue\nFROM orders\nGROUP BY order_status\nORDER BY revenue DESC;'
  },
  {
    label: 'งานในคิวล่าสุด',
    sql: 'SELECT id, queue_name, job_name, status, progress, created_at\nFROM queue_jobs\nORDER BY created_at DESC\nLIMIT 8;'
  },
  {
    label: 'สินค้าใกล้หมด',
    sql: 'SELECT name, brand, total_stock\nFROM products\nWHERE total_stock < 15\nORDER BY total_stock ASC;'
  }
];

function StatCard({
  label,
  value,
  hint,
  icon: Icon
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof LayoutDashboard;
}) {
  return (
    <div className="rounded-[22px] border border-line/80 bg-cream-soft/70 p-4">
      <div className="flex items-start justify-between">
        <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">{label}</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-sand/80 text-ink/60">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-2 text-[clamp(1.3rem,2.2vw,1.75rem)] font-extrabold tracking-[-0.045em]">
        {value}
      </p>
      <p className="mt-1 text-[8px] leading-snug text-muted">{hint}</p>
    </div>
  );
}

function OrderStatusPill({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold',
        meta.tone
      )}
    >
      <span className={cx('h-1 w-1 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

function formatCell(value: unknown): string {
  if (value == null) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

export function AdminDashboard({
  user,
  onExit,
  onStoreRefresh,
  showToast
}: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [queueMetrics, setQueueMetrics] = useState({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0
  });
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [orderQuery, setOrderQuery] = useState('');
  const [busyOrder, setBusyOrder] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editor, setEditor] = useState<{ mode: 'create' | 'edit'; product?: Product } | null>(null);
  const [inventoryQuery, setInventoryQuery] = useState('');
  const [stockBusy, setStockBusy] = useState('');
  const [sql, setSql] = useState(SAMPLE_QUERIES[0].sql);
  const [sqlResult, setSqlResult] = useState<SqlQueryResult | null>(null);
  const [sqlError, setSqlError] = useState('');
  const [runningSql, setRunningSql] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [retryingJob, setRetryingJob] = useState('');
  const [syncing, setSyncing] = useState(false);

  const loadEverything = async (spinner = false) => {
    if (spinner) setLoading(true);
    else setRefreshing(true);
    let failures = 0;

    try {
      const [analyticsResult, productsResult, ordersResult, queueResult, dbResult] =
        await Promise.allSettled([
          api.getAnalytics(),
          api.getProducts(),
          api.getOrders(),
          api.getQueueJobs(),
          api.getDbStatus()
        ]);

      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value);
      else failures += 1;

      if (productsResult.status === 'fulfilled') setProducts(productsResult.value);
      else failures += 1;

      if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value);
      else failures += 1;

      if (queueResult.status === 'fulfilled') {
        setQueueMetrics(queueResult.value.metrics);
        setJobs(queueResult.value.jobs);
      } else failures += 1;

      if (dbResult.status === 'fulfilled') setDbStatus(dbResult.value);
      else failures += 1;

      setLoadError(failures === 5 ? 'ไม่สามารถโหลดข้อมูลหลังบ้านได้ กรุณาตรวจสอบเซิร์ฟเวอร์' : '');
    } finally {
      if (spinner) setLoading(false);
      else setRefreshing(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setAnalytics(await api.getAnalytics());
    } catch {
      // The toast shown by the calling action is enough.
    }
  };

  const refreshProducts = async () => {
    try {
      setProducts(await api.getProducts());
    } catch {
      // Keep the current list.
    }
  };

  const refreshQueue = async () => {
    try {
      const result = await api.getQueueJobs();
      setQueueMetrics(result.metrics);
      setJobs(result.jobs);
    } catch {
      // Silent auto-refresh failure.
    }
  };

  useEffect(() => {
    void loadEverything(true);
  }, []);

  useEffect(() => {
    if (tab !== 'automation' || !autoRefresh) return;
    void refreshQueue();
    const interval = window.setInterval(() => void refreshQueue(), 3000);
    return () => window.clearInterval(interval);
  }, [tab, autoRefresh]);

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();
    return orders.filter(order => {
      const statusMatch = orderFilter === 'ALL' || order.orderStatus === orderFilter;
      const queryMatch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [orders, orderFilter, orderQuery]);

  const filteredInventory = useMemo(() => {
    const query = inventoryQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      product =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
    );
  }, [products, inventoryQuery]);

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    if (order.orderStatus === status) return;
    setBusyOrder(order.id);
    try {
      const updated = await api.updateOrderStatus(order.id, status);
      setOrders(current => current.map(item => (item.id === updated.id ? updated : item)));
      setSelectedOrder(current => (current?.id === updated.id ? updated : current));
      await refreshAnalytics();
      showToast(`อัปเดตคำสั่งซื้อ ${updated.id} เป็น “${ORDER_STATUS_META[status].label}” แล้ว`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'อัปเดตสถานะไม่สำเร็จ', 'error');
    } finally {
      setBusyOrder('');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`ยืนยันการลบ “${product.name}” ออกจากร้านหรือไม่?`)) return;
    try {
      await api.deleteProduct(product.id);
      setProducts(current => current.filter(item => item.id !== product.id));
      await refreshAnalytics();
      onStoreRefresh();
      showToast('ลบสินค้าเรียบร้อยแล้ว');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'ลบสินค้าไม่สำเร็จ', 'error');
    }
  };

  const adjustStock = async (product: Product, index: number, delta: number) => {
    const key = `${product.id}-${index}`;
    setStockBusy(key);
    try {
      const variants = product.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, stock: Math.max(0, variant.stock + delta) }
          : variant
      );
      const updated = await api.updateProduct(product.id, { variants });
      setProducts(current => current.map(item => (item.id === updated.id ? updated : item)));
      await refreshAnalytics();
      onStoreRefresh();
      showToast(`ปรับสต็อก ${updated.name} (${updated.variants[index]?.label}) เป็น ${updated.variants[index]?.stock} ชิ้น`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'ปรับสต็อกไม่สำเร็จ', 'error');
    } finally {
      setStockBusy('');
    }
  };

  const runSql = async (statement = sql) => {
    setRunningSql(true);
    setSqlError('');
    setSqlResult(null);
    try {
      const result = await api.runSql(statement);
      setSqlResult(result);
    } catch (error) {
      setSqlError(error instanceof Error ? error.message : 'รัน SQL ไม่สำเร็จ');
    } finally {
      setRunningSql(false);
    }
  };

  const retryJob = async (job: QueueJob) => {
    setRetryingJob(job.id);
    try {
      await api.retryJob(job.id);
      await refreshQueue();
      showToast(`ส่งงาน ${job.jobName} กลับเข้าคิวแล้ว`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Retry ไม่สำเร็จ', 'error');
    } finally {
      setRetryingJob('');
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await api.triggerInventorySync();
      await refreshQueue();
      showToast('ส่งงานซิงก์สต็อกเข้าคิวแล้ว');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'ส่งงานไม่สำเร็จ', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const lowStock = products.filter(product => product.totalStock < 15);
  const totalUnits = products.reduce((sum, product) => sum + product.totalStock, 0);
  const maxDayRevenue = Math.max(1, ...(analytics?.recentSales.map(day => day.revenue) || [1]));

  const title =
    tab === 'overview'
      ? 'ภาพรวมร้าน'
      : tab === 'products'
        ? 'จัดการสินค้า'
        : tab === 'orders'
          ? 'คำสั่งซื้อ'
          : tab === 'inventory'
            ? 'คลังสินค้า'
            : tab === 'database'
              ? 'ฐานข้อมูล PostgreSQL'
              : 'คิวงานเบื้องหลัง';

  const subtitle =
    tab === 'overview'
      ? 'สถานะร้านและผลประกอบการล่าสุด'
      : tab === 'products'
        ? 'เพิ่ม แก้ไข และจัดระเบียบแคตตาล็อก'
        : tab === 'orders'
          ? 'ตรวจสอบและอัปเดตสถานะการจัดส่ง'
          : tab === 'inventory'
            ? 'ตรวจนับและเติมสต็อกแต่ละตัวเลือก'
            : tab === 'database'
              ? 'สำรวจตารางและรันคำสั่ง SQL แบบอ่านอย่างเดียว'
              : 'ติดตามงาน asynchronous ของร้าน';

  return (
    <div className="min-h-screen bg-[#f3eee4] text-ink lg:flex">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-ink px-5 py-6 text-cream lg:flex">
        <BrandLogo light />
        <p className="mt-8 text-[8px] font-bold uppercase tracking-[0.26em] text-cream/35">
          Back office
        </p>
        <nav className="mt-3 flex flex-col gap-1">
          {TABS.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cx(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold transition-colors',
                tab === item.id
                  ? 'bg-cream/10 text-cream'
                  : 'text-cream/50 hover:bg-cream/5 hover:text-cream/80'
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.7} />
              {item.label}
              {tab === item.id && <span className="ml-auto h-1 w-1 rounded-full bg-clay" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          {dbStatus && (
            <div className="rounded-2xl border border-cream/10 bg-cream/[0.04] p-3">
              <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-cream/35">
                <Database className="h-3 w-3" /> Database
              </p>
              <p className="mt-1 text-[10px] font-semibold">{dbStatus.label}</p>
              <p className="mt-0.5 truncate text-[8px] text-cream/35">{dbStatus.target}</p>
            </div>
          )}

          <div className="flex items-center gap-2.5 rounded-2xl border border-cream/10 p-2.5">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cream/10 text-[9px] font-bold">
                {user.name.slice(0, 2)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold">{user.name}</p>
              <p className="truncate text-[8px] text-cream/35">Administrator</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-cream/15 py-2.5 text-[10px] font-semibold text-cream/70 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> กลับไปหน้าร้าน
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 border-b border-line/80 bg-[#f3eee4]/95 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-5 py-3">
            <BrandLogo compact />
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-ink px-2 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-cream">
                Admin
              </span>
              <button
                type="button"
                onClick={onExit}
                className="grid h-8 w-8 place-items-center rounded-full border border-line"
                aria-label="กลับไปหน้าร้าน"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {TABS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cx(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-semibold transition-colors',
                  tab === item.id ? 'bg-ink text-cream' : 'text-ink/55 hover:bg-sand/60'
                )}
              >
                <item.icon className="h-3 w-3" /> {item.label}
              </button>
            ))}
          </div>
        </div>

        <main className="mx-auto max-w-[1420px] px-5 py-6 sm:px-7 lg:px-10 lg:py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-clay">
                patsakorn. admin / {tab}
              </p>
              <h1 className="mt-1 text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold tracking-[-0.04em]">
                {title}
              </h1>
              <p className="mt-1 text-[10px] text-muted">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadEverything(false)}
                disabled={refreshing}
                className="flex h-9 items-center gap-1.5 rounded-full border border-line bg-cream-soft px-3.5 text-[9px] font-semibold transition-colors hover:border-ink/35 disabled:opacity-50"
              >
                <RefreshCw className={cx('h-3 w-3', refreshing && 'animate-spin')} />
                รีเฟรช
              </button>
              {tab === 'products' && (
                <button
                  type="button"
                  onClick={() => setEditor({ mode: 'create' })}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[9px] font-bold text-cream"
                >
                  <Plus className="h-3.5 w-3.5" /> เพิ่มสินค้า
                </button>
              )}
              {tab === 'automation' && (
                <button
                  type="button"
                  onClick={() => void triggerSync()}
                  disabled={syncing}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[9px] font-bold text-cream disabled:opacity-60"
                >
                  <Zap className="h-3.5 w-3.5" /> {syncing ? 'กำลังส่ง...' : 'ซิงก์สต็อก'}
                </button>
              )}
            </div>
          </div>

          {loadError && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-clay/25 bg-clay-soft/35 px-4 py-3 text-[10px] font-semibold text-clay">
              <AlertTriangle className="h-4 w-4" /> {loadError}
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                <div key={item} className="h-28 animate-pulse rounded-[22px] bg-sand/60" />
              ))}
            </div>
          ) : (
            <>
              {tab === 'overview' && analytics && (
                <div className="animate-fade-up mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="รายได้รวม"
                      value={formatPrice(analytics.totalRevenue)}
                      hint="ไม่รวมคำสั่งซื้อที่ยกเลิก"
                      icon={TrendingUp}
                    />
                    <StatCard
                      label="คำสั่งซื้อทั้งหมด"
                      value={analytics.totalOrders.toLocaleString('th-TH')}
                      hint={`${analytics.pendingOrders} รายการรอดำเนินการ`}
                      icon={ShoppingCart}
                    />
                    <StatCard
                      label="ลูกค้าสมาชิก"
                      value={analytics.totalCustomers.toLocaleString('th-TH')}
                      hint="บัญชีลูกค้าที่ลงทะเบียน"
                      icon={Users}
                    />
                    <StatCard
                      label="สินค้าในร้าน"
                      value={analytics.totalProducts.toLocaleString('th-TH')}
                      hint={`${analytics.lowStockCount} รายการสต็อกต่ำ`}
                      icon={Package}
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
                    <section className="rounded-[24px] border border-line/80 bg-cream-soft/70 p-4 sm:p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-[12px] font-bold">รายได้ 7 วันล่าสุด</h2>
                          <p className="mt-0.5 text-[9px] text-muted">
                            ยอดชำระรวมของแต่ละวัน
                          </p>
                        </div>
                        <span className="rounded-full bg-sage-soft/60 px-2.5 py-1 text-[8px] font-bold text-[#566448]">
                          THB
                        </span>
                      </div>
                      <div className="mt-5 flex h-48 items-end gap-2 sm:gap-3">
                        {analytics.recentSales.map(day => {
                          const height = Math.max(4, (day.revenue / maxDayRevenue) * 100);
                          return (
                            <div key={day.date} className="group flex flex-1 flex-col items-center gap-2">
                              <div className="relative flex h-36 w-full items-end">
                                <div
                                  className="w-full rounded-t-lg bg-ink/85 transition-colors group-hover:bg-clay"
                                  style={{ height: `${height}%` }}
                                  title={`${formatPrice(day.revenue)} · ${day.orders} ออเดอร์`}
                                />
                                {day.revenue > 0 && (
                                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-bold text-ink/45 opacity-0 transition-opacity group-hover:opacity-100">
                                    {formatPrice(day.revenue)}
                                  </span>
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] font-bold text-ink/65">{day.label}</p>
                                <p className="text-[7px] text-muted">{day.orders} ออเดอร์</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section className="rounded-[24px] border border-line/80 bg-cream-soft/70 p-4 sm:p-5">
                      <h2 className="text-[12px] font-bold">ยอดขายตามหมวดหมู่</h2>
                      <p className="mt-0.5 text-[9px] text-muted">เรียงตามรายได้สะสม</p>
                      <div className="mt-4 space-y-3">
                        {analytics.salesByCategory.length === 0 && (
                          <p className="text-[10px] text-muted">ยังไม่มีข้อมูลการขาย</p>
                        )}
                        {analytics.salesByCategory.slice(0, 6).map(item => {
                          const max = Math.max(
                            1,
                            ...analytics.salesByCategory.map(category => category.revenue)
                          );
                          return (
                            <div key={item.category}>
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="font-semibold">
                                  {CATEGORY_META[item.category].label}
                                  <span className="ml-1 font-normal text-muted">
                                    {item.sales} ชิ้น
                                  </span>
                                </span>
                                <span className="font-bold">{formatPrice(item.revenue)}</span>
                              </div>
                              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand-deep/45">
                                <div
                                  className="h-full rounded-full bg-clay"
                                  style={{ width: `${Math.max(3, (item.revenue / max) * 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                    <section className="overflow-hidden rounded-[24px] border border-line/80 bg-cream-soft/70">
                      <div className="flex items-center justify-between px-4 py-4 sm:px-5">
                        <div>
                          <h2 className="text-[12px] font-bold">คำสั่งซื้อล่าสุด</h2>
                          <p className="mt-0.5 text-[9px] text-muted">อัปเดตล่าสุดจากฐานข้อมูล</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTab('orders')}
                          className="flex items-center gap-1 text-[8px] font-bold text-clay"
                        >
                          ดูทั้งหมด <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[540px]">
                          <thead>
                            <tr className="border-y border-line/70 bg-sand/25 text-left text-[7px] font-bold uppercase tracking-[0.14em] text-muted">
                              <th className="px-4 py-2 sm:px-5">คำสั่งซื้อ</th>
                              <th className="px-3 py-2">ลูกค้า</th>
                              <th className="px-3 py-2">ยอด</th>
                              <th className="px-4 py-2 sm:px-5">สถานะ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.recentOrders.map(order => (
                              <tr key={order.id} className="border-b border-line/50 last:border-0">
                                <td className="px-4 py-2.5 font-mono text-[8px] font-bold sm:px-5">
                                  {order.id}
                                </td>
                                <td className="px-3 py-2.5 text-[9px]">{order.customerName}</td>
                                <td className="px-3 py-2.5 text-[9px] font-bold">
                                  {formatPrice(order.totalAmount)}
                                </td>
                                <td className="px-4 py-2.5 sm:px-5">
                                  <OrderStatusPill status={order.orderStatus} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="rounded-[24px] border border-line/80 bg-cream-soft/70 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[12px] font-bold">สต็อกต่ำ</h2>
                        <span className="rounded-full bg-clay-soft/60 px-2 py-0.5 text-[8px] font-bold text-clay">
                          {lowStock.length} รายการ
                        </span>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {lowStock.slice(0, 5).map(product => (
                          <div key={product.id} className="flex items-center gap-2.5">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[9px] font-semibold">{product.name}</p>
                              <p className="text-[7px] text-muted">{product.sku}</p>
                            </div>
                            <span
                              className={cx(
                                'text-[9px] font-bold',
                                product.totalStock === 0 ? 'text-clay' : 'text-ink/60'
                              )}
                            >
                              {product.totalStock}
                            </span>
                          </div>
                        ))}
                        {lowStock.length === 0 && (
                          <p className="text-[10px] text-muted">สต็อกทุกรายการอยู่ในระดับปกติ</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setTab('inventory')}
                        className="mt-4 w-full rounded-full border border-line py-2 text-[8px] font-bold text-ink/65 hover:border-ink/35"
                      >
                        ไปที่คลังสินค้า
                      </button>
                    </section>
                  </div>
                </div>
              )}

              {tab === 'products' && (
                <div className="animate-fade-up mt-5 overflow-hidden rounded-[24px] border border-line/80 bg-cream-soft/70">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-4 py-3.5 sm:px-5">
                    <div>
                      <p className="text-[11px] font-bold">แคตตาล็อกทั้งหมด</p>
                      <p className="mt-0.5 text-[9px] text-muted">
                        {products.length} รายการ ·{' '}
                        {products.reduce((sum, product) => sum + product.totalStock, 0)} หน่วย
                      </p>
                    </div>
                    <span className="rounded-full border border-line bg-white/60 px-3 py-1.5 font-mono text-[8px] text-muted">
                      products
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px]">
                      <thead>
                        <tr className="border-b border-line/70 bg-sand/25 text-left text-[7px] font-bold uppercase tracking-[0.14em] text-muted">
                          <th className="px-5 py-2.5">สินค้า</th>
                          <th className="px-3 py-2.5">หมวดหมู่</th>
                          <th className="px-3 py-2.5">ราคา</th>
                          <th className="px-3 py-2.5">สต็อก</th>
                          <th className="px-3 py-2.5">สถานะ</th>
                          <th className="px-5 py-2.5 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr
                            key={product.id}
                            className="border-b border-line/50 transition-colors last:border-0 hover:bg-sand/20"
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-9 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                  <p className="max-w-[280px] truncate text-[10px] font-semibold">
                                    {product.name}
                                  </p>
                                  <p className="text-[8px] text-muted">
                                    {product.brand} · {product.sku}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="rounded-full bg-sand/50 px-2 py-1 text-[8px] font-semibold">
                                {CATEGORY_META[product.category].label}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-[9px] font-bold">
                              {formatPrice(product.price)}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={cx(
                                  'text-[9px] font-bold',
                                  product.totalStock === 0
                                    ? 'text-clay'
                                    : product.totalStock < 15
                                      ? 'text-[#9a761e]'
                                      : 'text-ink/65'
                                )}
                              >
                                {product.totalStock}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1">
                                {product.isFeatured && (
                                  <span className="rounded-full bg-amber/20 px-2 py-0.5 text-[7px] font-bold text-[#856817]">
                                    FEATURED
                                  </span>
                                )}
                                {product.badge && (
                                  <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[7px] font-bold text-cream">
                                    {product.badge}
                                  </span>
                                )}
                                {!product.isFeatured && !product.badge && (
                                  <span className="text-[8px] text-muted">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditor({ mode: 'edit', product })}
                                  className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white/60 text-ink/60 transition-colors hover:border-ink/35 hover:text-ink"
                                  aria-label={`แก้ไข ${product.name}`}
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(product)}
                                  className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white/60 text-ink/45 transition-colors hover:border-clay/40 hover:text-clay"
                                  aria-label={`ลบ ${product.name}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'orders' && (
                <div className="animate-fade-up mt-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-line bg-cream-soft px-4 py-2.5">
                      <Search className="h-3.5 w-3.5 text-muted" />
                      <input
                        value={orderQuery}
                        onChange={event => setOrderQuery(event.target.value)}
                        placeholder="ค้นหารหัสคำสั่งซื้อ ชื่อ หรืออีเมล..."
                        className="w-full bg-transparent text-[10px] outline-none placeholder:text-muted/70"
                      />
                    </div>
                    <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                      {ORDER_FILTERS.map(item => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setOrderFilter(item.value)}
                          className={cx(
                            'shrink-0 rounded-full border px-3 py-1.5 text-[8px] font-semibold transition-colors',
                            orderFilter === item.value
                              ? 'border-ink bg-ink text-cream'
                              : 'border-line bg-cream-soft text-ink/60 hover:border-ink/30'
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[24px] border border-line/80 bg-cream-soft/70">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px]">
                        <thead>
                          <tr className="border-b border-line/70 bg-sand/25 text-left text-[7px] font-bold uppercase tracking-[0.14em] text-muted">
                            <th className="px-5 py-2.5">คำสั่งซื้อ</th>
                            <th className="px-3 py-2.5">ลูกค้า</th>
                            <th className="px-3 py-2.5">วันที่</th>
                            <th className="px-3 py-2.5">ยอดรวม</th>
                            <th className="px-3 py-2.5">ชำระเงิน</th>
                            <th className="px-5 py-2.5">สถานะ</th>
                            <th className="px-5 py-2.5" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map(order => (
                            <tr
                              key={order.id}
                              className="border-b border-line/50 last:border-0 hover:bg-sand/20"
                            >
                              <td className="px-5 py-3">
                                <p className="font-mono text-[8px] font-bold">{order.id}</p>
                                <p className="mt-0.5 text-[7px] text-muted">
                                  {order.items.length} รายการ
                                </p>
                              </td>
                              <td className="px-3 py-3">
                                <p className="text-[9px] font-semibold">{order.customerName}</p>
                                <p className="text-[7px] text-muted">{order.customerEmail}</p>
                              </td>
                              <td className="px-3 py-3 text-[8px] text-muted">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-3 py-3 text-[9px] font-bold">
                                {formatPrice(order.totalAmount)}
                              </td>
                              <td className="px-3 py-3 text-[8px]">
                                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                                <span
                                  className={cx(
                                    'mt-0.5 block text-[7px] font-semibold',
                                    order.paymentStatus === 'PAID' ? 'text-sage' : 'text-[#9a761e]'
                                  )}
                                >
                                  {order.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'รอชำระ'}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {busyOrder === order.id ? (
                                  <span className="flex items-center gap-1 text-[8px] text-muted">
                                    <Loader2 className="h-3 w-3 animate-spin" /> บันทึก...
                                  </span>
                                ) : (
                                  <select
                                    value={order.orderStatus}
                                    onChange={event =>
                                      void handleStatusChange(
                                        order,
                                        event.target.value as OrderStatus
                                      )
                                    }
                                    className="rounded-full border border-line bg-white/70 px-2 py-1 text-[8px] font-semibold outline-none"
                                  >
                                    {ORDER_FILTERS.filter(item => item.value !== 'ALL').map(item => (
                                      <option key={item.value} value={item.value}>
                                        {item.label}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-[8px] font-bold text-clay hover:underline"
                                >
                                  ดูรายละเอียด
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredOrders.length === 0 && (
                      <div className="py-14 text-center">
                        <ReceiptText className="mx-auto h-6 w-6 text-muted" />
                        <p className="mt-2 text-[10px] font-semibold">ไม่พบคำสั่งซื้อที่ตรงเงื่อนไข</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === 'inventory' && (
                <div className="animate-fade-up mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard
                      label="หน่วยในคลัง"
                      value={totalUnits.toLocaleString('th-TH')}
                      hint="รวมทุกตัวเลือกของทุกสินค้า"
                      icon={Boxes}
                    />
                    <StatCard
                      label="สต็อกต่ำ (<15)"
                      value={String(lowStock.length)}
                      hint="ควรเติมสินค้าเร็ว ๆ นี้"
                      icon={AlertTriangle}
                    />
                    <StatCard
                      label="สินค้าหมด"
                      value={String(products.filter(product => product.totalStock === 0).length)}
                      hint="รายการที่ไม่พร้อมจำหน่าย"
                      icon={Package}
                    />
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-line bg-cream-soft px-4 py-2.5">
                    <Search className="h-3.5 w-3.5 text-muted" />
                    <input
                      value={inventoryQuery}
                      onChange={event => setInventoryQuery(event.target.value)}
                      placeholder="ค้นหาสินค้า แบรนด์ หรือ SKU..."
                      className="w-full bg-transparent text-[10px] outline-none placeholder:text-muted/70"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredInventory.map(product => (
                      <div
                        key={product.id}
                        className="rounded-[22px] border border-line/80 bg-cream-soft/70 p-3.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-12 w-11 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[9px] font-semibold leading-snug">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-[7px] text-muted">{product.sku}</p>
                          </div>
                          <span
                            className={cx(
                              'rounded-full px-2 py-0.5 text-[8px] font-bold',
                              product.totalStock === 0
                                ? 'bg-clay-soft/60 text-clay'
                                : product.totalStock < 15
                                  ? 'bg-amber/20 text-[#856817]'
                                  : 'bg-sage-soft/60 text-[#566448]'
                            )}
                          >
                            {product.totalStock}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1">
                          {product.variants.map((variant, index) => {
                            const key = `${product.id}-${index}`;
                            return (
                              <div
                                key={variant.label}
                                className="flex items-center justify-between rounded-lg bg-white/45 px-2 py-1"
                              >
                                <span className="text-[8px] font-semibold">{variant.label}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => void adjustStock(product, index, -1)}
                                    disabled={stockBusy === key || variant.stock === 0}
                                    className="grid h-5 w-5 place-items-center rounded-full border border-line text-ink/50 disabled:opacity-30"
                                    aria-label="ลดสต็อก"
                                  >
                                    <Minus className="h-2.5 w-2.5" />
                                  </button>
                                  <span className="w-7 text-center text-[8px] font-bold">
                                    {stockBusy === key ? '...' : variant.stock}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => void adjustStock(product, index, 5)}
                                    disabled={stockBusy === key}
                                    className="grid h-5 w-5 place-items-center rounded-full border border-line text-ink/50 disabled:opacity-30"
                                    aria-label="เพิ่มสต็อก 5 ชิ้น"
                                    title="เพิ่ม 5 ชิ้น"
                                  >
                                    <Plus className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'database' && (
                <div className="animate-fade-up mt-5 space-y-4">
                  {dbStatus && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line/80 bg-cream-soft/70 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-cream">
                          <Database className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold">{dbStatus.label}</p>
                          <p className="mt-0.5 font-mono text-[8px] text-muted">{dbStatus.target}</p>
                        </div>
                      </div>
                      <span
                        className={cx(
                          'rounded-full border px-3 py-1 text-[8px] font-bold',
                          dbStatus.mode === 'postgres'
                            ? 'border-sage/40 bg-sage-soft/50 text-[#566448]'
                            : 'border-amber/30 bg-amber/15 text-[#856817]'
                        )}
                      >
                        {dbStatus.mode === 'postgres' ? 'เชื่อมต่อ PostgreSQL จริง' : 'โหมด pg-mem'}
                      </span>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {dbStatus?.tables.map(table => (
                      <div
                        key={table.name}
                        className="rounded-[20px] border border-line/80 bg-cream-soft/70 p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <Table2 className="h-3.5 w-3.5 text-clay" />
                          <span className="text-[9px] font-extrabold">{table.rowCount}</span>
                        </div>
                        <p className="mt-2 font-mono text-[10px] font-bold">{table.name}</p>
                        <p className="mt-0.5 text-[8px] font-semibold text-muted">{table.label}</p>
                        <p className="mt-1.5 text-[7px] leading-relaxed text-muted">
                          {table.columns.length} คอลัมน์
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[0.85fr_1.4fr]">
                    <section className="rounded-[24px] border border-line/80 bg-cream-soft/70 p-4 sm:p-5">
                      <h2 className="text-[12px] font-bold">โครงสร้างฐานข้อมูล</h2>
                      <p className="mt-0.5 text-[9px] text-muted">
                        ตารางและคอลัมน์ที่ใช้งานจริงในระบบ
                      </p>
                      <div className="mt-3 space-y-2">
                        {dbStatus?.tables.map(table => (
                          <details
                            key={table.name}
                            className="group rounded-xl border border-line/70 bg-white/45 px-3 py-2"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between text-[9px] font-bold">
                              <span className="font-mono">{table.name}</span>
                              <span className="flex items-center gap-1.5 text-[8px] font-normal text-muted">
                                {table.rowCount} แถว
                                <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                              </span>
                            </summary>
                            <p className="mt-1.5 text-[8px] leading-relaxed text-muted">
                              {table.description}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {table.columns.map(column => (
                                <span
                                  key={column}
                                  className="rounded bg-sand/55 px-1.5 py-0.5 font-mono text-[7px] text-ink/65"
                                >
                                  {column}
                                </span>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-[24px] border border-line/80 bg-[#1d1b18] text-cream">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream/10 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-3.5 w-3.5 text-amber" />
                          <p className="font-mono text-[9px] font-bold">SQL Console</p>
                          <span className="rounded-full border border-cream/15 px-2 py-0.5 text-[7px] uppercase tracking-[0.12em] text-cream/40">
                            read only
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void runSql()}
                          disabled={runningSql}
                          className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-[8px] font-bold text-ink disabled:opacity-60"
                        >
                          {runningSql ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          Run query
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 border-b border-cream/10 px-4 py-2">
                        {SAMPLE_QUERIES.map(sample => (
                          <button
                            key={sample.label}
                            type="button"
                            onClick={() => {
                              setSql(sample.sql);
                              setSqlResult(null);
                              setSqlError('');
                            }}
                            className="rounded-full border border-cream/15 px-2.5 py-1 text-[7px] font-semibold text-cream/55 hover:border-amber/40 hover:text-amber"
                          >
                            {sample.label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={sql}
                        onChange={event => setSql(event.target.value)}
                        spellCheck={false}
                        className="terminal-scroll h-36 w-full resize-y bg-transparent px-4 py-3 font-mono text-[10px] leading-relaxed text-[#d9d0c1] outline-none placeholder:text-cream/25"
                        placeholder="SELECT * FROM products LIMIT 10;"
                      />

                      <div className="border-t border-cream/10 px-4 py-3">
                        {sqlError && (
                          <p className="rounded-lg border border-clay/30 bg-clay/15 px-3 py-2 font-mono text-[9px] text-[#e9b7a3]">
                            {sqlError}
                          </p>
                        )}
                        {!sqlError && !sqlResult && (
                          <p className="font-mono text-[8px] text-cream/30">
                            อนุญาตเฉพาะ SELECT หรือ WITH ... SELECT · สูงสุด 200 แถว
                          </p>
                        )}
                        {sqlResult && (
                          <div>
                            <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[8px] text-cream/40">
                              <span className="text-sage">{sqlResult.rowCount} rows</span>
                              <span>· {sqlResult.durationMs} ms</span>
                              {sqlResult.truncated && <span>· truncated at 200</span>}
                            </p>
                            <div className="max-h-64 overflow-auto rounded-xl border border-cream/10">
                              <table className="w-full text-left">
                                <thead className="sticky top-0 bg-[#25221e]">
                                  <tr>
                                    {sqlResult.columns.map(column => (
                                      <th
                                        key={column}
                                        className="whitespace-nowrap border-b border-cream/10 px-2.5 py-2 font-mono text-[8px] font-bold text-amber/80"
                                      >
                                        {column}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sqlResult.rows.map((row, index) => (
                                    <tr key={index} className="border-b border-cream/5 last:border-0">
                                      {sqlResult.columns.map(column => (
                                        <td
                                          key={column}
                                          className="max-w-[260px] truncate whitespace-nowrap px-2.5 py-1.5 font-mono text-[8px] text-cream/65"
                                          title={formatCell(row[column])}
                                        >
                                          {formatCell(row[column])}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {tab === 'automation' && (
                <div className="animate-fade-up mt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <StatCard
                      label="Waiting"
                      value={String(queueMetrics.waiting)}
                      hint="รอ worker รับงาน"
                      icon={Clock3}
                    />
                    <StatCard
                      label="Active"
                      value={String(queueMetrics.active)}
                      hint="กำลังประมวลผล"
                      icon={Zap}
                    />
                    <StatCard
                      label="Completed"
                      value={String(queueMetrics.completed)}
                      hint="สำเร็จแล้ว"
                      icon={CheckCircle2}
                    />
                    <StatCard
                      label="Failed"
                      value={String(queueMetrics.failed)}
                      hint="ต้องตรวจสอบ"
                      icon={AlertTriangle}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line/80 bg-cream-soft/70 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream">
                        <Workflow className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold">Background Workers</p>
                        <p className="text-[8px] text-muted">
                          งานจะถูกประมวลผลอัตโนมัติภายในไม่กี่วินาที
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex cursor-pointer items-center gap-2 text-[8px] font-semibold text-muted">
                        <span className="relative inline-flex h-4 w-8 items-center">
                          <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={event => setAutoRefresh(event.target.checked)}
                            className="peer sr-only"
                          />
                          <span className="absolute inset-0 rounded-full bg-sand-deep transition-colors peer-checked:bg-ink" />
                          <span className="absolute left-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                        </span>
                        อัปเดตอัตโนมัติ
                      </label>
                      <button
                        type="button"
                        onClick={() => void refreshQueue()}
                        className="grid h-7 w-7 place-items-center rounded-full border border-line bg-white/60"
                        aria-label="รีเฟรชคิว"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {jobs.length === 0 && (
                      <div className="rounded-[22px] border border-dashed border-line bg-cream-soft/50 py-14 text-center">
                        <Workflow className="mx-auto h-6 w-6 text-muted" />
                        <p className="mt-2 text-[10px] font-semibold">ยังไม่มีงานในคิว</p>
                        <p className="mt-0.5 text-[8px] text-muted">
                          ลองสร้างคำสั่งซื้อหรือกดซิงก์สต็อกเพื่อทดสอบระบบ
                        </p>
                      </div>
                    )}

                    {jobs.map(job => {
                      const statusTone =
                        job.status === 'completed'
                          ? 'bg-sage-soft/60 text-[#566448] border-sage/40'
                          : job.status === 'active'
                            ? 'bg-clay-soft/60 text-clay border-clay/25'
                            : job.status === 'failed'
                              ? 'bg-[#efe6e2] text-[#8f5a4c] border-[#ddc8c1]'
                              : 'bg-amber/15 text-[#856817] border-amber/30';
                      return (
                        <div
                          key={job.id}
                          className="rounded-[20px] border border-line/80 bg-cream-soft/70 p-3.5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <span
                                className={cx(
                                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                                  job.status === 'completed'
                                    ? 'bg-sage'
                                    : job.status === 'active'
                                      ? 'animate-pulse bg-clay'
                                      : job.status === 'failed'
                                        ? 'bg-[#a76a5a]'
                                        : 'bg-amber'
                                )}
                              />
                              <div>
                                <p className="text-[10px] font-bold">{job.jobName}</p>
                                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono text-[7px] text-muted">
                                  <span>{job.id}</span>
                                  <span>·</span>
                                  <span>{job.queueName}</span>
                                  <span>·</span>
                                  <span>{formatDate(job.createdAt, true)}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cx(
                                  'rounded-full border px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em]',
                                  statusTone
                                )}
                              >
                                {job.status}
                              </span>
                              <span className="text-[8px] font-bold text-ink/55">
                                {job.progress}%
                              </span>
                              {job.status !== 'active' && job.status !== 'waiting' && (
                                <button
                                  type="button"
                                  onClick={() => void retryJob(job)}
                                  disabled={retryingJob === job.id}
                                  className="grid h-6 w-6 place-items-center rounded-full border border-line text-ink/45 hover:text-ink disabled:opacity-40"
                                  aria-label="รันงานอีกครั้ง"
                                >
                                  {retryingJob === job.id ? (
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-2.5 w-2.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand-deep/45">
                            <div
                              className={cx(
                                'h-full rounded-full transition-all duration-500',
                                job.status === 'failed' ? 'bg-[#a76a5a]' : 'bg-ink'
                              )}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedJob(current => (current === job.id ? null : job.id))
                            }
                            className="mt-2 flex items-center gap-1 text-[7px] font-semibold text-muted hover:text-ink"
                          >
                            <Terminal className="h-2.5 w-2.5" /> ดู log ({job.logs.length})
                            <ChevronDown
                              className={cx(
                                'h-2.5 w-2.5 transition-transform',
                                expandedJob === job.id && 'rotate-180'
                              )}
                            />
                          </button>

                          {expandedJob === job.id && (
                            <div className="animate-fade-up mt-2 max-h-44 space-y-1 overflow-y-auto rounded-xl bg-ink p-2.5 font-mono text-[7px] leading-relaxed text-cream/55">
                              {job.logs.map((log, index) => (
                                <p key={index}>
                                  <span className="mr-1 text-cream/25">
                                    {String(index + 1).padStart(2, '0')}
                                  </span>
                                  {log}
                                </p>
                              ))}
                              {job.errorMessage && (
                                <p className="text-[#e9b7a3]">error: {job.errorMessage}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {editor && (
        <ProductEditor
          mode={editor.mode}
          product={editor.product}
          onClose={() => setEditor(null)}
          onSaved={async () => {
            setEditor(null);
            await refreshProducts();
            await refreshAnalytics();
            onStoreRefresh();
          }}
          showToast={showToast}
        />
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-5">
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
            aria-label="ปิดรายละเอียดคำสั่งซื้อ"
          />
          <div className="animate-scale-in relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[26px] bg-cream p-5 shadow-2xl sm:rounded-[28px] sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-clay">
                  Order detail
                </p>
                <h2 className="mt-1 font-mono text-sm font-bold">{selectedOrder.id}</h2>
                <p className="mt-0.5 text-[9px] text-muted">
                  {formatDate(selectedOrder.createdAt, true)} ·{' '}
                  {selectedOrder.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="grid h-8 w-8 place-items-center rounded-full border border-line hover:bg-sand/60"
                aria-label="ปิด"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <OrderStatusPill status={selectedOrder.orderStatus} />
              <span className="rounded-full border border-line bg-cream-soft px-2 py-0.5 text-[8px] font-semibold">
                {PAYMENT_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}
              </span>
              <span className="rounded-full border border-line bg-cream-soft px-2 py-0.5 text-[8px] font-semibold">
                {selectedOrder.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'รอชำระ'}
              </span>
              {selectedOrder.couponCode && (
                <span className="rounded-full border border-clay/25 bg-clay-soft/35 px-2 py-0.5 text-[8px] font-bold text-clay">
                  {selectedOrder.couponCode}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-line bg-cream-soft/60 p-3">
              {selectedOrder.items.map(item => (
                <div
                  key={`${item.productId}-${item.selectedVariant}`}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-10 w-9 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-semibold">{item.productName}</p>
                    <p className="text-[7px] text-muted">
                      {item.selectedVariant} · {item.quantity} ชิ้น
                    </p>
                  </div>
                  <p className="text-[9px] font-bold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="flex justify-between border-t border-line/70 pt-2 text-[8px]">
                <span className="text-muted">
                  ยอดสินค้า {formatPrice(selectedOrder.subtotal)} · ส่ง{' '}
                  {selectedOrder.shippingFee === 0 ? 'ฟรี' : formatPrice(selectedOrder.shippingFee)}
                  {selectedOrder.discount > 0 &&
                    ` · ลด ${formatPrice(selectedOrder.discount)}`}
                </span>
                <span className="font-bold">รวม {formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-sand/35 p-3">
                <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-muted">
                  ที่อยู่จัดส่ง
                </p>
                <p className="mt-1 text-[9px] leading-relaxed">
                  {selectedOrder.shippingAddress.fullName} · {selectedOrder.shippingAddress.phone}
                  <br />
                  {selectedOrder.shippingAddress.addressLine}{' '}
                  {selectedOrder.shippingAddress.district}{' '}
                  {selectedOrder.shippingAddress.province}{' '}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>
              <div className="rounded-xl bg-sand/35 p-3">
                <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-muted">
                  ขนส่ง
                </p>
                <p className="mt-1 text-[9px] leading-relaxed">
                  {selectedOrder.carrier || 'รอเลือกขนส่ง'}
                  <br />
                  {selectedOrder.trackingNumber || 'ยังไม่มีเลขพัสดุ'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">
                อัปเดตสถานะ
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ORDER_FILTERS.filter(item => item.value !== 'ALL').map(item => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={busyOrder === selectedOrder.id}
                    onClick={() =>
                      void handleStatusChange(selectedOrder, item.value as OrderStatus)
                    }
                    className={cx(
                      'rounded-full border px-3 py-1.5 text-[8px] font-semibold transition-colors disabled:opacity-40',
                      selectedOrder.orderStatus === item.value
                        ? 'border-ink bg-ink text-cream'
                        : 'border-line bg-white/60 hover:border-ink/35'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-line/70 pt-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">
                ไทม์ไลน์
              </p>
              <div className="mt-2 space-y-2">
                {selectedOrder.statusHistory.map((entry, index) => (
                  <div key={`${entry.status}-${index}`} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                    <div>
                      <p className="text-[9px] font-semibold">
                        {ORDER_STATUS_META[entry.status].label}{' '}
                        <span className="font-normal text-muted">
                          · {formatDate(entry.timestamp, true)}
                        </span>
                      </p>
                      <p className="text-[8px] leading-relaxed text-muted">{entry.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductEditorProps {
  mode: 'create' | 'edit';
  product?: Product;
  onClose: () => void;
  onSaved: () => Promise<void>;
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void;
}

function ProductEditor({ mode, product, onClose, onSaved, showToast }: ProductEditorProps) {
  const [name, setName] = useState(product?.name || '');
  const [brand, setBrand] = useState(product?.brand || 'Patsakorn Studio');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Sneakers');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [originalPrice, setOriginalPrice] = useState(
    product?.originalPrice ? String(product.originalPrice) : ''
  );
  const [subtitle, setSubtitle] = useState(product?.subtitle || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [badge, setBadge] = useState(product?.badge || '');
  const [description, setDescription] = useState(product?.description || '');
  const [story, setStory] = useState(product?.story || '');
  const [images, setImages] = useState((product?.images || []).join('\n'));
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.isFeatured));
  const [variants, setVariants] = useState(
    product?.variants?.length ? product.variants : [{ label: 'Standard', stock: 10 }]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('กรุณากรอกชื่อสินค้า');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('กรุณากรอกราคาให้ถูกต้อง');
      return;
    }
    if (variants.length === 0) {
      setError('ต้องมีตัวเลือกสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const payload: Partial<Product> = {
      name: name.trim(),
      brand: brand.trim() || 'Patsakorn Studio',
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      subtitle: subtitle.trim(),
      sku: sku.trim(),
      badge: badge ? (badge as Product['badge']) : undefined,
      description: description.trim(),
      story: story.trim(),
      images: images
        .split(/[\n,]/)
        .map(item => item.trim())
        .filter(Boolean),
      variants: variants.map(variant => ({
        label: variant.label.trim() || 'Standard',
        stock: Math.max(0, Number(variant.stock) || 0)
      })),
      isFeatured
    };

    setBusy(true);
    try {
      if (mode === 'create') {
        await api.createProduct(payload);
        showToast('เพิ่มสินค้าใหม่เรียบร้อยแล้ว');
      } else if (product) {
        await api.updateProduct(product.id, payload);
        showToast('บันทึกการแก้ไขสินค้าแล้ว');
      }
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกสินค้าไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  const updateVariant = (index: number, patch: Partial<{ label: string; stock: number }>) => {
    setVariants(current =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      )
    );
  };

  return (
    <div className="fixed inset-0 z-[88] flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        aria-label="ปิดฟอร์มสินค้า"
      />
      <div className="animate-scale-in relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[26px] bg-cream p-5 shadow-2xl sm:rounded-[28px] sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-clay">
              Product editor
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em]">
              {mode === 'create' ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-line hover:bg-sand/60"
            aria-label="ปิด"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label-xs" htmlFor="product-name">
                ชื่อสินค้า
              </label>
              <input
                id="product-name"
                value={name}
                onChange={event => setName(event.target.value)}
                className="field"
                placeholder="เช่น New Balance 9060 Rain Cloud"
                required
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="product-brand">
                แบรนด์
              </label>
              <input
                id="product-brand"
                value={brand}
                onChange={event => setBrand(event.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="product-category">
                หมวดหมู่
              </label>
              <select
                id="product-category"
                value={category}
                onChange={event => setCategory(event.target.value as ProductCategory)}
                className="field"
              >
                {PRODUCT_CATEGORIES.map(item => (
                  <option key={item} value={item}>
                    {CATEGORY_META[item].label} / {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-xs" htmlFor="product-price">
                ราคา (บาท)
              </label>
              <input
                id="product-price"
                type="number"
                min="1"
                value={price}
                onChange={event => setPrice(event.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="product-original-price">
                ราคาก่อนลด (ไม่บังคับ)
              </label>
              <input
                id="product-original-price"
                type="number"
                min="0"
                value={originalPrice}
                onChange={event => setOriginalPrice(event.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="product-sku">
                SKU
              </label>
              <input
                id="product-sku"
                value={sku}
                onChange={event => setSku(event.target.value)}
                className="field"
                placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ"
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="product-badge">
                ป้ายสินค้า
              </label>
              <select
                id="product-badge"
                value={badge}
                onChange={event => setBadge(event.target.value)}
                className="field"
              >
                <option value="">ไม่มีป้าย</option>
                {['NEW', 'BESTSELLER', 'HOT', 'LIMITED', 'SALE'].map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label-xs" htmlFor="product-subtitle">
                คำอธิบายสั้น (สี / วัสดุ)
              </label>
              <input
                id="product-subtitle"
                value={subtitle}
                onChange={event => setSubtitle(event.target.value)}
                className="field"
                placeholder="เช่น Rain Cloud / Castlerock / White"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-xs" htmlFor="product-images">
                รูปภาพ (หนึ่ง URL ต่อบรรทัด)
              </label>
              <textarea
                id="product-images"
                value={images}
                onChange={event => setImages(event.target.value)}
                className="field h-20 resize-y font-mono text-[9px]"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-xs" htmlFor="product-description">
                คำอธิบายสินค้า
              </label>
              <textarea
                id="product-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                className="field h-20 resize-y"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-xs" htmlFor="product-story">
                เรื่องราวสินค้า
              </label>
              <textarea
                id="product-story"
                value={story}
                onChange={event => setStory(event.target.value)}
                className="field h-16 resize-y"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="label-xs mb-0">ตัวเลือกและสต็อก</label>
              <button
                type="button"
                onClick={() =>
                  setVariants(current => [...current, { label: '', stock: 5 }])
                }
                className="flex items-center gap-1 text-[8px] font-bold text-clay"
              >
                <Plus className="h-3 w-3" /> เพิ่มตัวเลือก
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={variant.label}
                    onChange={event => updateVariant(index, { label: event.target.value })}
                    placeholder="เช่น US 9 / M / Standard"
                    className="field h-9 flex-1 py-1.5 text-[10px]"
                    aria-label="ชื่อตัวเลือก"
                  />
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={event =>
                      updateVariant(index, { stock: Number(event.target.value) })
                    }
                    className="field h-9 w-20 py-1.5 text-[10px]"
                    aria-label="จำนวนสต็อก"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setVariants(current => current.filter((_, i) => i !== index))
                    }
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-ink/45 hover:text-clay"
                    aria-label="ลบตัวเลือก"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-[10px] font-semibold">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={event => setIsFeatured(event.target.checked)}
              className="h-3.5 w-3.5 accent-ink"
            />
            แสดงเป็นสินค้าแนะนำบนหน้าแรก
          </label>

          {error && (
            <p className="mt-3 rounded-xl border border-clay/25 bg-clay-soft/35 px-3 py-2 text-[10px] font-medium text-clay">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-full border border-line px-5 text-[10px] font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-[10px] font-bold text-cream disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3 w-3 animate-spin" />}
              {mode === 'create' ? 'สร้างสินค้า' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
