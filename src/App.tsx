import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ShoeCard } from './components/ShoeCard';
import { ProductFilter } from './components/ProductFilter';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { QueueMonitorView } from './components/QueueMonitorView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SpeedStrideLogo } from './components/SpeedStrideLogo';
import { 
  ShoeProduct, 
  CartItem, 
  Order, 
  User, 
  FilterState, 
  OrderStatus 
} from './types';
import { api } from './services/api';
import { 
  Sparkles, 
  ShoppingBag,
  ShieldCheck,
  Zap,
  Truck,
  RotateCcw
} from 'lucide-react';

const DEFAULT_FILTER: FilterState = {
  search: '',
  brands: [],
  categories: [],
  gender: 'All',
  minPrice: 0,
  maxPrice: 15000,
  selectedSize: '',
  inStockOnly: false,
  sortBy: 'featured'
};

export default function App() {
  // App View State: 'store' | 'admin' | 'queue'
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'queue'>('store');

  // Products and Data State
  const [products, setProducts] = useState<ShoeProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Cart & Orders State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ShoeProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Applied Coupon for Checkout
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState(0);

  // User Auth State (Default demo logged in as Customer: พัสกร)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-customer-1',
    name: 'พัสกร',
    email: 'passakorn@speedstride.com',
    role: 'CUSTOMER',
    phone: '081-234-5678',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
  });

  // Role guard: Ensure customers cannot stay on admin/queue views
  useEffect(() => {
    if (currentUser?.role !== 'ADMIN' && (currentView === 'admin' || currentView === 'queue')) {
      setCurrentView('store');
    }
  }, [currentUser, currentView]);

  // Toasts Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeJobCount, setActiveJobCount] = useState(0);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Products & Orders
  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await api.getProducts(filter);
      setProducts(data);
    } catch (e) {
      console.error('Load products error:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Load orders error:', e);
    }
  };

  const pollQueueStatus = async () => {
    try {
      const res = await api.getQueueJobs();
      if (res && res.metrics) {
        setActiveJobCount(res.metrics.active + res.metrics.waiting);
      }
    } catch (e) {
      // safe fallback
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filter]);

  useEffect(() => {
    loadOrders();
    pollQueueStatus();
    const interval = setInterval(pollQueueStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Cart Management Handlers
  const handleAddToCart = (product: ShoeProduct, size: string, quantity: number = 1) => {
    const sizeStock = product.sizes.find(s => s.size === size)?.stock || 0;
    if (sizeStock <= 0) {
      addToast('error', 'สินค้าหมด', `ขนาด ${size} ของรุ่นนี้หมดสต็อกแล้ว`);
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id && item.selectedSize === size);
      if (existing) {
        const newQty = Math.min(sizeStock, existing.quantity + quantity);
        return prev.map(item =>
          item.id === existing.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString().slice(-4)}`,
          productId: product.id,
          product,
          selectedSize: size,
          quantity: Math.min(sizeStock, quantity)
        };
        return [...prev, newItem];
      }
    });

    addToast(
      'success',
      'เพิ่มลงตะกร้าแล้ว',
      `${product.name} (${size}) จำนวน ${quantity} คู่ถูกเพิ่มลงในตะกร้า`
    );

    setSelectedProduct(null);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleUpdateCartSize = (cartItemId: string, newSize: string) => {
    setCartItems(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, selectedSize: newSize } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    addToast('info', 'นำสินค้าออกแล้ว', 'ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว');
  };

  const handleProceedCheckout = (coupon?: string, discount: number = 0) => {
    setAppliedCoupon(coupon);
    setDiscountAmount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsOrderHistoryOpen(true);

    addToast(
      'success',
      'สั่งซื้อสำเร็จ!',
      `ออเดอร์ #${newOrder.id} ได้รับการยืนยันและกำลังเตรียมจัดส่งแล้ว`
    );

    // Reload products to reflect stock decrement
    loadProducts();
  };

  // Admin Handlers
  const handleAdminAddProduct = async (productData: Partial<ShoeProduct>) => {
    try {
      const created = await api.createProduct(productData);
      setProducts(prev => [created, ...prev]);
      addToast('success', 'เพิ่มสินค้าสำเร็จ', `เพิ่ม "${created.name}" เข้าระบบและกระจาย SKU แล้ว`);
    } catch (e) {
      addToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มสินค้าได้');
    }
  };

  const handleAdminUpdateProduct = async (id: string, productData: Partial<ShoeProduct>) => {
    try {
      const updated = await api.updateProduct(id, productData);
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      addToast('success', 'อัปเดตสินค้าสำเร็จ', `แก้ไขข้อมูล "${updated.name}" เรียบร้อยแล้ว`);
    } catch (e) {
      addToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตสินค้าได้');
    }
  };

  const handleAdminDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast('info', 'ลบสินค้าสำเร็จ', 'ลบสินค้าออกจากฐานข้อมูลแล้ว');
    } catch (e) {
      addToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถลบสินค้าได้');
    }
  };

  const handleAdminUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status, note);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      addToast(
        'success',
        'อัปเดตสถานะออเดอร์แล้ว',
        `ออเดอร์ #${orderId} เปลี่ยนสถานะเป็น ${status}`
      );
    } catch (e) {
      addToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะออเดอร์ได้');
    }
  };

  const handleTriggerInventorySync = async () => {
    try {
      await api.triggerInventorySync();
      addToast('info', 'ส่งงาน BullMQ แล้ว', 'เริ่มกระบวนการคำนวณและ Sync สต็อกสินค้าในเบื้องหลัง');
      pollQueueStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await api.retryJob(jobId);
      addToast('info', 'สั่งรัน Job ใหม่อีกครั้ง', `Job #${jobId} ถูกส่งกลับเข้าคิวประมวลผล`);
      pollQueueStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const cartTotalCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Filter visible orders based on role:
  // Admin sees all orders, Customer sees only their own orders
  const visibleOrders = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') {
      return orders;
    }
    return orders.filter(
      o => o.userId === currentUser.id || o.customerEmail === currentUser.email || o.shippingAddress?.fullName.includes('พัสกร')
    );
  }, [orders, currentUser]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Navigation */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrderHistoryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView('store');
          addToast('info', 'ออกจากระบบ', 'คุณได้ออกจากระบบแล้ว');
        }}
        searchQuery={filter.search}
        onSearchChange={(q) => setFilter({ ...filter, search: q })}
        activeJobCount={activeJobCount}
      />

      {/* ========================================================
          VIEW 1: STOREFRONT (ฝั่งลูกค้า - สินค้าและการสั่งซื้อ)
         ======================================================== */}
      {currentView === 'store' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          {/* Hero Banner with SpeedStride Branding */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-blue-950/60 border border-zinc-800 p-6 sm:p-10 mb-8 shadow-2xl">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SPEEDSTRIDE • PREMIUM FOOTWEAR CO.</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3 italic">
                SPEED<span className="text-sky-400">STRIDE</span> COLLECTION
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6">
                ยินดีต้อนรับคุณ <span className="text-sky-400 font-bold">{currentUser?.name || 'ลูกค้า'}</span> สู่แหล่งรวมสนีกเกอร์และรองเท้าวิ่งระดับพรีเมียมของแท้ 100% พร้อมบริการจัดส่งด่วนฟรีทั่วประเทศ
              </p>

              {/* Quick Brand Badges */}
              <div className="flex flex-wrap gap-2">
                {['Nike', 'Adidas', 'Jordan', 'New Balance', 'Asics'].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setFilter(prev => ({
                        ...prev,
                        brands: prev.brands.includes(b as any) ? [] : [b as any]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      filter.brands.includes(b as any)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-zinc-900/80 border-zinc-700/80 text-zinc-300 hover:border-sky-500/50 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Decorative Accent */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden lg:block">
              <SpeedStrideLogo size="lg" showText={false} />
            </div>
          </div>

          {/* Value Props Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-sky-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">จัดส่งด่วนฟรีทั่วไทย</p>
                <p className="text-[11px] text-zinc-400">เมื่อสั่งซื้อสินค้าทุกออเดอร์</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">ของแท้ 100% Guarantee</p>
                <p className="text-[11px] text-zinc-400">การันตีสนีกเกอร์ของแท้ทุกคู่</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">เปลี่ยนไซส์ได้ใน 7 วัน</p>
                <p className="text-[11px] text-zinc-400">บริการหลังการขายแบบพรีเมียม</p>
              </div>
            </div>
          </div>

          {/* Main Store Layout (Filter + Product Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Filter Sidebar */}
            <div className="lg:col-span-1">
              <ProductFilter
                filter={filter}
                onChange={setFilter}
                onReset={() => setFilter(DEFAULT_FILTER)}
                totalProductsCount={products.length}
              />
            </div>

            {/* Right Product Grid */}
            <div className="lg:col-span-3">
              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 p-8">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">ไม่พบรองเท้าที่ตรงกับตัวกรอง</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    ลองปรับเปลี่ยนเงื่อนไขค้นหา แบรนด์ หรือช่วงราคาเพื่อดูรายการสินค้าอื่น
                  </p>
                  <button
                    onClick={() => setFilter(DEFAULT_FILTER)}
                    className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-sky-400"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ShoeCard
                      key={product.id}
                      product={product}
                      onSelect={setSelectedProduct}
                      onQuickAdd={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================
          VIEW 2: ADMIN DASHBOARD (เฉพาะ Admin: พัสกร เท่านั้น)
         ======================================================== */}
      {currentView === 'admin' && currentUser?.role === 'ADMIN' && (
        <main className="flex-1 w-full">
          <AdminDashboard
            products={products}
            orders={orders}
            onRefresh={() => {
              loadProducts();
              loadOrders();
            }}
            onAddProduct={handleAdminAddProduct}
            onUpdateProduct={handleAdminUpdateProduct}
            onDeleteProduct={handleAdminDeleteProduct}
            onUpdateOrderStatus={handleAdminUpdateOrderStatus}
            onSwitchToQueue={() => setCurrentView('queue')}
          />
        </main>
      )}

      {/* ========================================================
          VIEW 3: BULLMQ QUEUE LIVE MONITOR (เฉพาะ Admin: พัสกร เท่านั้น)
         ======================================================== */}
      {currentView === 'queue' && currentUser?.role === 'ADMIN' && (
        <main className="flex-1 w-full">
          <QueueMonitorView
            onTriggerSync={handleTriggerInventorySync}
            onRetryJob={handleRetryJob}
          />
        </main>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onUpdateSize={handleUpdateCartSize}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={handleProceedCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        appliedCoupon={appliedCoupon}
        discountAmount={discountAmount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order History Modal (Filtered for Customers vs Admins) */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={visibleOrders}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'ADMIN') {
            setCurrentView('admin');
          } else {
            setCurrentView('store');
          }
          addToast('success', 'เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับคุณ ${user.name} (${user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'})`);
        }}
      />

      {/* Bottom Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 mt-16 py-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SpeedStrideLogo size="sm" />
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {currentUser?.role === 'ADMIN' ? (
              <>
                <button onClick={() => setCurrentView('admin')} className="hover:text-sky-400">
                  Admin Dashboard
                </button>
                <span>•</span>
                <button onClick={() => setCurrentView('queue')} className="hover:text-sky-400">
                  BullMQ Worker Status
                </button>
              </>
            ) : (
              <span className="text-zinc-500">
                © 2026 SpeedStride Premium Footwear Co. All rights reserved.
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
