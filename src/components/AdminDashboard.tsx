import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Activity, 
  RotateCcw, 
  Check, 
  Truck, 
  Search, 
  ChevronRight,
  TrendingUp,
  X,
  ExternalLink
} from 'lucide-react';
import { ShoeProduct, Order, OrderStatus, AdminAnalytics, ShoeBrand, ShoeCategory } from '../types';

interface AdminDashboardProps {
  products: ShoeProduct[];
  orders: Order[];
  onRefresh: () => void;
  onAddProduct: (productData: Partial<ShoeProduct>) => void;
  onUpdateProduct: (id: string, productData: Partial<ShoeProduct>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onSwitchToQueue: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onRefresh,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onSwitchToQueue
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory'>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShoeProduct | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Nike' as ShoeBrand,
    category: 'Lifestyle' as ShoeCategory,
    price: 4500,
    originalPrice: 4900,
    sku: '',
    colorway: 'White / Black',
    description: '',
    story: '',
    badge: 'NEW' as any,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    sizes: [
      { size: 'US 8', stock: 5 },
      { size: 'US 8.5', stock: 5 },
      { size: 'US 9', stock: 5 },
      { size: 'US 9.5', stock: 5 },
      { size: 'US 10', stock: 5 }
    ]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [products, orders]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/dashboard');
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'Nike',
      category: 'Lifestyle',
      price: 4200,
      originalPrice: 4500,
      sku: `SKU-${Math.floor(Math.random() * 90000 + 10000)}`,
      colorway: 'Original Retro',
      description: 'รองเท้าผ้าใบรุ่นพรีเมียม สวมใส่สบายด้วยเทคโนโลยีลดแรงกระแทก',
      story: 'แรงบันดาลใจจากประวัติศาสตร์สตรีทแวร์ยุคคลาสสิก',
      badge: 'NEW',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      sizes: [
        { size: 'US 8', stock: 6 },
        { size: 'US 8.5', stock: 4 },
        { size: 'US 9', stock: 8 },
        { size: 'US 9.5', stock: 5 },
        { size: 'US 10', stock: 3 }
      ]
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (prod: ShoeProduct) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      sku: prod.sku,
      colorway: prod.colorway,
      description: prod.description,
      story: prod.story || '',
      badge: prod.badge || 'NEW',
      imageUrl: prod.images[0] || '',
      sizes: JSON.parse(JSON.stringify(prod.sizes))
    });
    setIsProductModalOpen(true);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      images: [productForm.imageUrl]
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, payload);
    } else {
      onAddProduct(payload);
    }
    setIsProductModalOpen(false);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">ระบบจัดการหลังบ้าน (Admin Control Panel)</h1>
              <p className="text-xs text-zinc-400">จัดการสินค้า สต็อก ออเดอร์ลูกค้า และติดตามงาน BullMQ Background Worker</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSwitchToQueue}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/50 text-xs font-bold text-zinc-200 transition-all"
          >
            <Activity className="w-4 h-4 text-sky-400" />
            <span>ตรวจดู BullMQ Worker</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่ (Add Product)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ยอดขายรวมทั้งหมด</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white">฿{totalRevenue.toLocaleString('th-TH')}</p>
          <p className="text-[11px] text-sky-400 mt-1 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>คำสั่งซื้อสำเร็จ {orders.filter(o => o.orderStatus !== 'CANCELLED').length} รายการ</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">จำนวนออเดอร์</span>
            <ShoppingBag className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white">{orders.length} ออเดอร์</p>
          <p className="text-[11px] text-zinc-400 mt-1">
            รอดำเนินการ {orders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING').length} รายการ
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">รองเท้าในระบบ</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{products.length} รุ่น</p>
          <p className="text-[11px] text-zinc-400 mt-1">
            สต็อกรวม {products.reduce((acc, p) => acc + p.totalStock, 0)} คู่
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">สต็อกเหลือน้อย</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            {products.filter(p => p.totalStock < 15).length} รายการ
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            ต่ำกว่าเกณฑ์ 15 คู่
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-800 mt-8 gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          📊 ภาพรวม & ยอดขาย (Analytics)
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          👟 จัดการสินค้า ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          📦 จัดการคำสั่งซื้อ ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          🏷️ ตารางสต็อกไซส์ (Stock Matrix)
        </button>
      </div>

      {/* TAB 1: Analytics Overview */}
      {activeTab === 'overview' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales By Brand */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-sm font-extrabold text-white mb-4 flex items-center justify-between">
                <span>ยอดขายแบ่งตามแบรนด์ (Sales by Brand)</span>
                <span className="text-xs text-zinc-500">Live MySQL Aggregation</span>
              </h3>
              <div className="space-y-3">
                {analytics?.salesByBrand && analytics.salesByBrand.length > 0 ? (
                  analytics.salesByBrand.map((sb) => (
                    <div key={sb.brand} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                      <div className="flex justify-between text-xs font-bold text-white mb-1.5">
                        <span className="text-sky-400">{sb.brand}</span>
                        <span>฿{sb.revenue.toLocaleString('th-TH')} ({sb.sales} คู่)</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (sb.revenue / (totalRevenue || 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400">ยังไม่มีข้อมูลยอดขายแบรนด์</p>
                )}
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-4">
                  คำสั่งซื้อล่าสุด (Recent Orders)
                </h3>
                <div className="space-y-2.5">
                  {orders.slice(0, 4).map((o) => (
                    <div key={o.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-white block">{o.id}</span>
                        <span className="text-zinc-400">{o.customerName} • ฿{o.totalAmount.toLocaleString('th-TH')}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.orderStatus === 'DELIVERED' ? 'bg-blue-500/20 text-sky-400' :
                        o.orderStatus === 'SHIPPED' ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-sky-400 hover:underline font-bold flex items-center gap-1"
                >
                  <span>ดูออเดอร์ทั้งหมด</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Products Management Table */}
      {activeTab === 'products' && (
        <div className="mt-6 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-4">รูปภาพ / ชื่อรองเท้า</th>
                  <th className="p-4">แบรนด์ & หมวดหมู่</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">ราคา (THB)</th>
                  <th className="p-4">สต็อกรวม</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-zinc-950" />
                      <div>
                        <p className="font-bold text-white line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-zinc-500">{p.colorway}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-sky-400 block">{p.brand}</span>
                      <span className="text-[11px] text-zinc-400">{p.category}</span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">{p.sku}</td>
                    <td className="p-4 font-black text-white">฿{p.price.toLocaleString('th-TH')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.totalStock === 0 ? 'bg-rose-500/20 text-rose-400' :
                        p.totalStock < 15 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-sky-400'
                      }`}>
                        {p.totalStock} คู่
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                          title="แก้ไขสินค้า"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ยืนยันการลบ "${p.name}" หรือไม่?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 3: Orders Management Table */}
      {activeTab === 'orders' && (
        <div className="mt-6 space-y-4">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="ค้นหา Order ID, ชื่อลูกค้า, อีเมล..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-zinc-400 font-medium">สถานะ:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                <option value="ALL">ทั้งหมด (All Orders)</option>
                <option value="PENDING">PENDING (รอดำเนินการ)</option>
                <option value="PROCESSING">PROCESSING (กำลังเตรียมส่ง)</option>
                <option value="SHIPPED">SHIPPED (จัดส่งแล้ว)</option>
                <option value="DELIVERED">DELIVERED (สำเร็จ)</option>
                <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-4">Order ID & วันที่</th>
                  <th className="p-4">ลูกค้า (Customer)</th>
                  <th className="p-4">รายการสินค้า</th>
                  <th className="p-4">ยอดรวม</th>
                  <th className="p-4">สถานะคำสั่งซื้อ</th>
                  <th className="p-4 text-right">เปลี่ยนสถานะ (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-white block">{o.id}</span>
                      <span className="text-[11px] text-zinc-500">
                        {new Date(o.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{o.customerName}</p>
                      <p className="text-[11px] text-zinc-400">{o.customerEmail}</p>
                    </td>
                    <td className="p-4">
                      {o.items.map((i, idx) => (
                        <p key={idx} className="text-[11px] text-zinc-300">
                          • {i.productName} ({i.selectedSize}) x{i.quantity}
                        </p>
                      ))}
                    </td>
                    <td className="p-4 font-black text-sky-400">
                      ฿{o.totalAmount.toLocaleString('th-TH')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        o.orderStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                        o.orderStatus === 'PROCESSING' ? 'bg-sky-500/20 text-sky-400' :
                        o.orderStatus === 'SHIPPED' ? 'bg-indigo-500/20 text-indigo-400' :
                        o.orderStatus === 'DELIVERED' ? 'bg-blue-500/20 text-sky-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-semibold focus:outline-none focus:border-sky-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Stock Matrix */}
      {activeTab === 'inventory' && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={prod.images[0]} alt="shoe" className="w-14 h-14 rounded-xl object-cover bg-zinc-950" />
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase">{prod.brand}</span>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{prod.name}</h4>
                    <p className="text-[11px] text-zinc-400">คงเหลือรวม: {prod.totalStock} คู่</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-800">
                  {prod.sizes.map((s, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                      <span className="text-[10px] text-zinc-400 block">{s.size}</span>
                      <span className={`text-xs font-black ${s.stock === 0 ? 'text-rose-500' : 'text-white'}`}>
                        {s.stock} คู่
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-black text-white">
                {editingProduct ? 'แก้ไขข้อมูลรองเท้า (Edit Product)' : 'เพิ่มรองเท้าคู่ใหม่เข้าระบบ (Add New Sneaker)'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">ชื่อรองเท้า (Product Name) *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="เช่น Nike Dunk Low Retro..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">แบรนด์ (Brand)</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Jordan">Jordan</option>
                    <option value="New Balance">New Balance</option>
                    <option value="Asics">Asics</option>
                    <option value="Puma">Puma</option>
                    <option value="Yeezy">Yeezy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">หมวดหมู่</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Running">Running</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Skateboarding">Skateboarding</option>
                    <option value="Retro">Retro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">ราคาขาย (THB) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">URL รูปภาพสินค้า (Image URL)</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
