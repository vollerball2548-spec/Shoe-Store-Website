import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Check,
  Facebook,
  Instagram,
  LockKeyhole,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserRound
} from 'lucide-react';
import { CartItem, FilterState, Order, Product, PRODUCT_CATEGORIES, User } from './types';
import { api, clearStoredToken, getStoredToken } from './services/api';
import {
  CATEGORY_META,
  FREE_SHIPPING_THRESHOLD,
  cx,
  formatPrice
} from './lib/utils';
import { BrandLogo } from './components/BrandLogo';
import { Navbar } from './components/Navbar';
import { ProductCard, ProductCardSkeleton, EmptyProducts } from './components/ProductCard';
import { ProductFilter } from './components/ProductFilter';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { Toast, ToastMessage } from './components/Toast';
import { AdminDashboard } from './components/AdminDashboard';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  categories: [],
  brands: [],
  maxPrice: 8000,
  inStockOnly: false,
  sortBy: 'featured'
};

const CART_KEY = 'patsakorn.cart';

const MARQUEE_MESSAGES = [
  'ส่งฟรีเมื่อซื้อครบ ฿1,500',
  'NEW SEASON · CURATED MIX 2026',
  'สมาชิกใหม่รับโค้ด MIX10 ลด 10%',
  'SNEAKERS · APPAREL · BAGS · TECH · HOME'
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [pendingAction, setPendingAction] = useState<'admin' | 'orders' | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const showToast = (message: string, tone: ToastMessage['tone'] = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 3800);
  };

  const loadProducts = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'ไม่สามารถโหลดสินค้าได้');
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts(true);
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    api
      .me()
      .then(setUser)
      .catch(() => clearStoredToken());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Storage may be unavailable in private mode.
    }
  }, [cart]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const result = products.filter(product => {
      if (search) {
        const haystack = `${product.name} ${product.brand} ${product.category} ${product.sku}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (filters.categories.length && !filters.categories.includes(product.category)) {
        return false;
      }
      if (filters.brands.length && !filters.brands.includes(product.brand)) {
        return false;
      }
      if (product.price > filters.maxPrice) return false;
      if (filters.inStockOnly && product.totalStock <= 0) return false;
      return true;
    });

    const sorted = [...result];
    if (filters.sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (filters.sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else {
      sorted.sort(
        (a, b) =>
          Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [products, filters]);

  const brands = useMemo(
    () => Array.from(new Set(products.map(product => product.brand))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of products) {
      counts[product.category] = (counts[product.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  const featuredProducts = useMemo(() => {
    const featured = products.filter(product => product.isFeatured);
    return (featured.length >= 4 ? featured : products).slice(0, 8);
  }, [products]);

  const heroProduct = useMemo(
    () => products.find(product => product.id === 'p-001') || featuredProducts[0] || products[0],
    [products, featuredProducts]
  );

  const categoryImages = useMemo(() => {
    const images: Partial<Record<(typeof PRODUCT_CATEGORIES)[number], string>> = {};
    for (const product of products) {
      if (!images[product.category]) images[product.category] = product.images[0];
    }
    return images;
  }, [products]);

  const storyImages = useMemo(() => {
    const home = products.find(product => product.category === 'Home');
    const tech = products.find(product => product.category === 'Tech');
    return {
      main: home?.images[0] || FALLBACK_IMAGE,
      small: tech?.images[0] || featuredProducts[1]?.images[0] || FALLBACK_IMAGE
    };
  }, [products, featuredProducts]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const updateFilters = (patch: Partial<FilterState>) =>
    setFilters(current => ({ ...current, ...patch }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectCategory = (category: (typeof PRODUCT_CATEGORIES)[number]) => {
    updateFilters({ categories: [category] });
    window.setTimeout(scrollToCatalog, 60);
  };

  const searchFromNavbar = (value: string) => {
    updateFilters({ search: value, categories: [] });
    if (value) showToast(`กำลังค้นหา “${value}”`, 'info');
  };

  const addToCart = (product: Product, variantLabel: string, quantity: number) => {
    const variant = product.variants.find(entry => entry.label === variantLabel);
    if (!variant || variant.stock <= 0) {
      showToast('ตัวเลือกนี้สินค้าหมดแล้ว', 'error');
      return;
    }

    const id = `${product.id}::${variantLabel}`;
    let capped = false;
    setCart(current => {
      const existing = current.find(item => item.id === id);
      if (existing) {
        const nextQuantity = Math.min(variant.stock, existing.quantity + quantity);
        capped = nextQuantity < existing.quantity + quantity;
        return current.map(item =>
          item.id === id ? { ...item, quantity: nextQuantity, product } : item
        );
      }
      return [
        ...current,
        {
          id,
          productId: product.id,
          product,
          selectedVariant: variantLabel,
          quantity: Math.min(variant.stock, quantity)
        }
      ];
    });

    setSelectedProduct(null);
    showToast(
      capped
        ? `เพิ่มได้สูงสุด ${variant.stock} ชิ้นตามสต็อกที่มี`
        : `เพิ่ม “${product.name}” ลงตะกร้าแล้ว`,
      capped ? 'info' : 'success'
    );
  };

  const quickAdd = (product: Product) => {
    const variant = product.variants.find(entry => entry.stock > 0);
    if (!variant) {
      showToast('สินค้าชิ้นนี้หมดแล้ว', 'error');
      return;
    }
    addToCart(product, variant.label, 1);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(current =>
      current.map(item => {
        if (item.id !== id) return item;
        const stock =
          item.product.variants.find(variant => variant.label === item.selectedVariant)?.stock || 0;
        const next = Math.max(1, Math.min(stock, item.quantity + delta));
        if (delta > 0 && next === item.quantity) {
          showToast(`สต็อกมีเพียง ${stock} ชิ้น`, 'info');
        }
        return { ...item, quantity: next };
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(current => current.filter(item => item.id !== id));
    showToast('นำสินค้าออกจากตะกร้าแล้ว', 'info');
  };

  const openCheckout = () => {
    if (cart.length === 0) {
      showToast('ตะกร้าของคุณยังว่างอยู่', 'info');
      return;
    }
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (order: Order) => {
    setCart([]);
    showToast(`สร้างคำสั่งซื้อ ${order.id} สำเร็จ`);
    void loadProducts();
  };

  const openAdmin = () => {
    if (!user) {
      setPendingAction('admin');
      setAuthOpen(true);
      showToast('เข้าสู่ระบบด้วยบัญชีผู้ดูแลเพื่อเปิดหลังบ้าน', 'info');
      return;
    }
    if (user.role !== 'ADMIN') {
      showToast('บัญชีนี้ไม่มีสิทธิ์เข้าถึงหลังบ้าน', 'error');
      return;
    }
    setView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (nextUser: User) => {
    setUser(nextUser);
    setAuthOpen(false);
    showToast(`ยินดีต้อนรับ ${nextUser.name}`);

    if (pendingAction === 'admin') {
      if (nextUser.role === 'ADMIN') {
        setView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast('บัญชีนี้เป็นลูกค้า ไม่สามารถเข้าหลังบ้านได้', 'error');
      }
    }
    if (pendingAction === 'orders') {
      setOrdersOpen(true);
    }
    setPendingAction(null);
  };

  const handleLogout = () => {
    clearStoredToken();
    setUser(null);
    setView('store');
    setOrdersOpen(false);
    setCheckoutOpen(false);
    showToast('ออกจากระบบแล้ว', 'info');
  };

  const openOrders = () => {
    setOrdersOpen(true);
    setCartOpen(false);
  };

  const handleNewsletter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterBusy(true);
    try {
      const result = await api.subscribeNewsletter(newsletterEmail);
      setNewsletterDone(true);
      setNewsletterEmail('');
      showToast(result.message);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'สมัครรับข่าวสารไม่สำเร็จ', 'error');
    } finally {
      setNewsletterBusy(false);
    }
  };

  if (view === 'admin' && user?.role === 'ADMIN') {
    return (
      <>
        <AdminDashboard
          user={user}
          onExit={() => {
            setView('store');
            void loadProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onStoreRefresh={() => void loadProducts()}
          showToast={showToast}
        />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-cream text-ink">
      <div className="overflow-hidden bg-ink text-cream">
        <div className="marquee py-2">
          <div className="marquee-track">
            {[0, 1].map(copy => (
              <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
                {MARQUEE_MESSAGES.map(message => (
                  <span
                    key={`${copy}-${message}`}
                    className="flex items-center text-[8px] font-bold uppercase tracking-[0.2em] text-cream/80"
                  >
                    <span className="px-6">{message}</span>
                    <Asterisk className="h-3 w-3 text-clay" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Navbar
        cartCount={cartCount}
        user={user}
        onOpenCart={() => setCartOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenOrders={openOrders}
        onOpenAdmin={openAdmin}
        onSearch={searchFromNavbar}
        onLogout={handleLogout}
      />

      <main>
        <section className="hero-wash relative overflow-hidden border-b border-line/70">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-10 md:px-8 lg:min-h-[660px] lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:px-12 lg:py-14">
            <div className="animate-fade-up relative z-10">
              <p className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.24em] text-clay">
                <span className="h-px w-8 bg-clay/60" />
                Curated mix shop · Bangkok
              </p>

              <h1 className="mt-5 text-[clamp(3.4rem,6.3vw,6.2rem)] font-extrabold leading-[1.02] tracking-[-0.065em]">
                <span className="block">ของดี</span>
                <span className="block">ที่คัดมา</span>
                <span className="block text-clay">เพื่อทุกวัน</span>
              </h1>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-10 bg-ink/25" />
                <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-muted">
                  Everyday essentials, edited.
                </p>
              </div>

              <p className="mt-5 max-w-[430px] text-[12px] leading-[1.95] text-ink/65">
                รวมสนีกเกอร์ เสื้อผ้า กระเป๋า แกดเจ็ต และของใช้แต่งบ้านที่เราคัดสรรแล้ว
                ว่าใส่จริง ใช้จริง และอยู่กับคุณได้ทุกวัน
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="flex h-12 items-center gap-3 rounded-full bg-ink px-6 text-[11px] font-bold text-cream transition-transform hover:scale-[1.015]"
                >
                  เลือกซื้อคอลเลกชัน
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#story"
                  className="flex h-12 items-center gap-2 rounded-full border border-ink/20 px-6 text-[11px] font-semibold text-ink/75 transition-colors hover:border-ink/45 hover:text-ink"
                >
                  เรื่องราวของเรา
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ink/10 pt-5">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {products.slice(0, 3).map(product => (
                      <img
                        key={product.id}
                        src={product.images[0]}
                        alt=""
                        className="h-7 w-7 rounded-full border-2 border-cream object-cover"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className="h-2.5 w-2.5 fill-amber text-amber" />
                      ))}
                      <span className="ml-1 text-[9px] font-bold">4.9</span>
                    </div>
                    <p className="mt-0.5 text-[8px] text-muted">จากรีวิวลูกค้าจริงกว่า 1,200 ราย</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-ink/10" />
                <div>
                  <p className="text-[13px] font-extrabold">{products.length || 26}+</p>
                  <p className="text-[8px] text-muted">ของดีในร้าน</p>
                </div>
                <div>
                  <p className="text-[13px] font-extrabold">6</p>
                  <p className="text-[8px] text-muted">หมวดหมู่</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
              <div
                className="relative overflow-hidden rounded-[32px] lg:rounded-[40px]"
                style={{
                  backgroundColor: heroProduct
                    ? CATEGORY_META[heroProduct.category].accent
                    : '#e7ddcb'
                }}
              >
                <div className="aspect-[4/5] w-full sm:aspect-[5/5.2] lg:aspect-[4/4.9]">
                  <img
                    src={heroProduct?.images[0] || FALLBACK_IMAGE}
                    alt={heroProduct?.name || 'patsakorn. mix shop selection'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/20 to-transparent" />

                <div className="absolute right-4 top-4 rounded-full border border-white/40 bg-cream/90 px-3.5 py-2 text-center backdrop-blur sm:right-5 sm:top-5">
                  <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-ink/45">
                    Curated
                  </p>
                  <p className="text-[12px] font-extrabold leading-tight tracking-[-0.04em]">
                    2026
                  </p>
                </div>

                <div className="absolute left-4 top-4 hidden -rotate-90 origin-left items-center gap-2 text-[7px] font-bold uppercase tracking-[0.24em] text-ink/45 sm:flex lg:left-5 lg:top-28">
                  <span>New season</span>
                  <span className="h-px w-6 bg-ink/25" />
                </div>
              </div>

              <div className="absolute -right-6 -top-6 hidden h-36 w-36 rounded-full border border-ink/10 sm:block" />
              <div className="absolute -bottom-5 -left-3 w-[250px] rounded-[22px] border border-white/60 bg-cream/95 p-3.5 shadow-[0_28px_70px_-26px_rgba(23,21,18,0.45)] backdrop-blur-xl sm:-left-7 sm:w-[286px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-clay">
                      {heroProduct?.brand || 'Patsakorn Studio'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-snug">
                      {heroProduct?.name || 'Everyday essentials, edited.'}
                    </p>
                  </div>
                  {heroProduct?.badge && (
                    <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-cream">
                      {heroProduct.badge}
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-end justify-between">
                  <div>
                    <p className="text-[15px] font-extrabold tracking-[-0.03em]">
                      {formatPrice(heroProduct?.price || 0)}
                    </p>
                    {heroProduct?.originalPrice && (
                      <p className="text-[8px] text-muted line-through">
                        {formatPrice(heroProduct.originalPrice)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => heroProduct && quickAdd(heroProduct)}
                    className="flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[8px] font-bold text-cream transition-transform hover:scale-[1.03]"
                  >
                    เพิ่มลงตะกร้า <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="absolute -bottom-8 right-2 hidden items-center gap-2 rounded-full border border-line bg-cream-soft/95 px-3.5 py-2 shadow-sm sm:flex">
                <Truck className="h-3.5 w-3.5 text-clay" />
                <span className="text-[8px] font-semibold text-ink/65">
                  ส่งฟรีขั้นต่ำ {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line/70 bg-cream-soft py-4">
          <div className="marquee">
            <div className="marquee-track" style={{ animationDuration: '58s' }}>
              {[0, 1].map(copy => (
                <div key={copy} className="flex shrink-0 items-center">
                  {brands.map(brand => (
                    <span
                      key={`${copy}-${brand}`}
                      className="flex items-center px-7 text-[11px] font-extrabold uppercase tracking-[0.15em] text-ink/25"
                    >
                      {brand}
                      <span className="ml-7 h-1 w-1 rounded-full bg-clay/40" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="categories" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 md:px-8 lg:px-12 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-clay">
                Shop by category
              </p>
              <h2 className="mt-2 text-[clamp(1.9rem,3.8vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.045em]">
                เลือกตามหมวดหมู่
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                resetFilters();
                scrollToCatalog();
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold text-ink/65 hover:text-ink"
            >
              ดูสินค้าทั้งหมด <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:gap-3.5">
            {PRODUCT_CATEGORIES.map((category, index) => {
              const meta = CATEGORY_META[category];
              const image = categoryImages[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={cx(
                    'group relative overflow-hidden rounded-[22px] text-left transition-transform duration-300 hover:-translate-y-0.5',
                    index === 0 ? 'lg:col-span-1' : ''
                  )}
                  style={{ backgroundColor: meta.accent }}
                >
                  <div className="aspect-[1.3/1] w-full overflow-hidden sm:aspect-[1.55/1]">
                    {image ? (
                      <img
                        src={image}
                        alt={meta.label}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="h-full w-full" style={{ backgroundColor: meta.accent }} />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5 sm:p-4">
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-cream/60">
                        {meta.en}
                      </p>
                      <p className="mt-0.5 text-[14px] font-bold text-cream sm:text-[16px]">
                        {meta.label}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full border border-cream/35 bg-cream/15 px-2.5 py-1 text-[8px] font-semibold text-cream backdrop-blur">
                      {categoryCounts[category] || 0}
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="border-y border-line/70 bg-cream-soft/55">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 lg:px-12 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-clay">
                  The edit · selected by us
                </p>
                <h2 className="mt-2 text-[clamp(1.9rem,3.8vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.045em]">
                  คัดมาแล้วสำหรับคุณ
                </h2>
                <p className="mt-2 max-w-md text-[11px] leading-relaxed text-muted">
                  ชิ้นที่เราหยิบมาใช้เองแล้วชอบ และคิดว่าจะเข้ากับชีวิตประจำวันของคุณได้เหมือนกัน
                </p>
              </div>
              <button
                type="button"
                onClick={scrollToCatalog}
                className="flex items-center gap-1.5 text-[10px] font-bold text-ink/65 hover:text-ink"
              >
                ดูทั้งหมด {products.length} ชิ้น <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-4">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
                : featuredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onView={setSelectedProduct}
                      onQuickAdd={quickAdd}
                    />
                  ))}
            </div>
          </div>
        </section>

        <section id="story" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 md:px-8 lg:px-12 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="relative">
              <div className="overflow-hidden rounded-[26px] bg-sand lg:rounded-[34px]">
                <div className="aspect-[4/4.6] w-full">
                  <img
                    src={storyImages.main}
                    alt="มุมของใช้ในร้าน patsakorn."
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-8 -right-2 w-36 overflow-hidden rounded-[18px] border-4 border-cream bg-sand shadow-xl sm:-right-5 sm:w-44 lg:w-48">
                <div className="aspect-square w-full">
                  <img
                    src={storyImages.small}
                    alt="ของใช้คัดสรร"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -left-2 top-5 rounded-2xl border border-line bg-cream/95 px-4 py-3 shadow-sm backdrop-blur sm:left-5">
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                  Our promise
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold">
                  <ShieldCheck className="h-3.5 w-3.5 text-sage" /> คัดแล้วว่าใช้จริง
                </p>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-clay">
                Our point of view
              </p>
              <h2 className="mt-2 text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold leading-[1.1] tracking-[-0.05em]">
                ของดีไม่จำเป็น
                <br />
                ต้องมีเยอะ
                <span className="text-clay"> แค่ต้องใช่</span>
              </h2>
              <p className="mt-4 max-w-lg text-[12px] leading-[1.95] text-ink/65">
                เราเริ่มจากคำถามง่าย ๆ ว่า “ของชิ้นนี้จะถูกหยิบใช้บ่อยแค่ไหน”
                แล้วค่อยเลือกสิ่งที่ตอบโจทย์ทั้งความสบาย ความทน และความสวยที่อยู่ได้นาน
                นี่คือร้านรวมของที่เราอยากแนะนำให้เพื่อนจริง ๆ
              </p>

              <div className="mt-6 divide-y divide-line/80 border-y border-line/80">
                {[
                  {
                    title: 'คัดจากของที่เราใช้เอง',
                    text: 'ทุกชิ้นผ่านการลองใช้จริงก่อนถูกเลือกมาวางบนชั้นของร้าน'
                  },
                  {
                    title: 'คุณภาพที่จับต้องได้',
                    text: 'วัสดุ งานตัดเย็บ และรายละเอียดเล็ก ๆ ที่ทำให้ของอยู่กับคุณได้นาน'
                  },
                  {
                    title: 'ราคาที่สมเหตุสมผล',
                    text: 'ของดีไม่จำเป็นต้องแพงเสมอ เราจึงเลือกช่วงราคาที่หลากหลาย'
                  }
                ].map((item, index) => (
                  <div key={item.title} className="flex gap-4 py-4">
                    <span className="font-display text-[11px] font-extrabold text-clay/65">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-[12px] font-bold">{item.title}</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-muted">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {[
                  { icon: Truck, label: 'จัดส่งไว 1–2 วัน' },
                  { icon: RefreshCw, label: 'เปลี่ยนคืนได้ 7 วัน' },
                  { icon: ShieldCheck, label: 'ของแท้รับประกัน' }
                ].map(item => (
                  <span
                    key={item.label}
                    className="flex items-center gap-1.5 text-[9px] font-semibold text-ink/55"
                  >
                    <item.icon className="h-3.5 w-3.5 text-sage" /> {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="catalog" className="scroll-mt-24 border-t border-line/70 bg-cream-soft/40">
          <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 lg:px-12 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-clay">
                  All products
                </p>
                <h2 className="mt-2 text-[clamp(1.9rem,3.8vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.045em]">
                  สินค้าทั้งหมด
                </h2>
                <p className="mt-2 text-[10px] text-muted">
                  แสดง {filteredProducts.length} จาก {products.length} รายการ
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-line bg-cream px-3 py-1.5">
                <Sparkles className="h-3 w-3 text-clay" />
                <span className="text-[8px] font-semibold text-muted">คัดสรรใหม่ทุกสัปดาห์</span>
              </div>
            </div>

            <div className="mt-5">
              <ProductFilter
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                brands={brands}
                counts={categoryCounts}
                total={products.length}
                resultCount={filteredProducts.length}
              />
            </div>

            {loadError && (
              <div className="mt-5 rounded-2xl border border-clay/25 bg-clay-soft/35 px-4 py-3 text-[10px] font-semibold text-clay">
                {loadError}
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-10">
              {loading &&
                Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}

              {!loading &&
                filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={setSelectedProduct}
                    onQuickAdd={quickAdd}
                  />
                ))}

              {!loading && filteredProducts.length === 0 && <EmptyProducts onReset={resetFilters} />}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-14 md:px-8 lg:px-12 lg:py-20">
          <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-9 text-cream sm:px-10 lg:rounded-[36px] lg:px-14 lg:py-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-cream/10" />
            <div className="pointer-events-none absolute -bottom-28 right-16 h-64 w-64 rounded-full bg-clay/20 blur-3xl" />
            <div className="pointer-events-none absolute right-10 top-8 hidden text-[100px] font-extrabold leading-none text-cream/[0.03] lg:block">
              p.
            </div>

            <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.24em] text-amber">
                  <Mail className="h-3 w-3" /> Newsletter
                </p>
                <h2 className="mt-3 text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.045em]">
                  รับของใหม่และโค้ดพิเศษ
                  <br />
                  ก่อนใคร
                </h2>
                <p className="mt-3 max-w-md text-[10px] leading-relaxed text-cream/50">
                  เดือนละไม่เกินสองฉบับเท่านั้น — ของดีที่เพิ่งมาถึง ไอเดียแต่งบ้าน
                  และส่วนลดสำหรับสมาชิก
                </p>
              </div>

              <div>
                {newsletterDone ? (
                  <div className="rounded-2xl border border-sage/30 bg-sage/10 p-5 text-center">
                    <Check className="mx-auto h-5 w-5 text-sage" />
                    <p className="mt-2 text-[12px] font-bold">สมัครรับข่าวสารเรียบร้อย</p>
                    <p className="mt-1 text-[9px] text-cream/45">
                      เราจะส่งเฉพาะเรื่องที่ดีจริง ๆ ไปให้คุณ
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletter}>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={event => setNewsletterEmail(event.target.value)}
                        required
                        placeholder="อีเมลของคุณ"
                        className="h-11 flex-1 rounded-full border border-cream/15 bg-cream/[0.06] px-4 text-[11px] text-cream outline-none placeholder:text-cream/35 focus:border-cream/35"
                        aria-label="อีเมลสำหรับรับข่าวสาร"
                      />
                      <button
                        type="submit"
                        disabled={newsletterBusy}
                        className="flex h-11 items-center justify-center gap-2 rounded-full bg-cream px-5 text-[10px] font-bold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
                      >
                        {newsletterBusy ? 'กำลังสมัคร...' : 'สมัครรับข่าวสาร'}
                        {!newsletterBusy && <ArrowRight className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="mt-2 text-[8px] leading-relaxed text-cream/35">
                      ใช้โค้ด <span className="font-bold text-amber">MIX10</span>{' '}
                      รับส่วนลด 10% สำหรับคำสั่งซื้อแรก · ยกเลิกได้ทุกเมื่อ
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="scroll-mt-24 border-t border-line/80 bg-cream-soft">
        <div className="mx-auto max-w-[1440px] px-5 pb-6 pt-12 md:px-8 lg:px-12 lg:pt-16">
          <div className="grid gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr]">
            <div>
              <BrandLogo />
              <p className="mt-4 max-w-[290px] text-[10px] leading-[1.9] text-muted">
                ร้านรวมของคัดสรรสำหรับทุกวัน — สนีกเกอร์ เสื้อผ้า กระเป๋า แกดเจ็ต
                และของใช้ที่ทำให้บ้านน่าอยู่ขึ้น
              </p>
              <div className="mt-4 space-y-1.5 text-[9px] text-muted">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-clay" /> กรุงเทพมหานคร ประเทศไทย
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-clay" /> hello@patsakorn.shop
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink/55 transition-colors hover:border-ink/35 hover:text-ink"
                  aria-label="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink/55 transition-colors hover:border-ink/35 hover:text-ink"
                  aria-label="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Shop</p>
              <div className="mt-3 flex flex-col items-start gap-2">
                {PRODUCT_CATEGORIES.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className="text-[10px] font-medium text-ink/65 transition-colors hover:text-clay"
                  >
                    {CATEGORY_META[category].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Help</p>
              <div className="mt-3 flex flex-col items-start gap-2 text-[10px] font-medium text-ink/65">
                <button type="button" onClick={openOrders} className="hover:text-clay">
                  คำสั่งซื้อของฉัน
                </button>
                <button type="button" onClick={() => showToast('นโยบายการเปลี่ยนคืน: ภายใน 7 วันหลังได้รับสินค้า', 'info')} className="hover:text-clay">
                  การเปลี่ยนคืนสินค้า
                </button>
                <button type="button" onClick={() => showToast('จัดส่งฟรีเมื่อซื้อครบ ฿1,500 ทั่วประเทศ', 'info')} className="hover:text-clay">
                  การจัดส่ง
                </button>
                <button type="button" onClick={() => showToast('ติดต่อเราได้ที่ hello@patsakorn.shop ทุกวัน 10:00–19:00', 'info')} className="hover:text-clay">
                  ติดต่อร้านค้า
                </button>
              </div>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">For the shop</p>
              <div className="mt-3 flex flex-col items-start gap-2 text-[10px] font-medium text-ink/65">
                <button
                  type="button"
                  onClick={openAdmin}
                  className="flex items-center gap-1.5 hover:text-clay"
                >
                  <LockKeyhole className="h-3 w-3" /> หลังบ้าน / Admin
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={openOrders}
                    className="flex items-center gap-1.5 hover:text-clay"
                  >
                    <UserRound className="h-3 w-3" /> {user.name.split(' ')[0]}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="flex items-center gap-1.5 hover:text-clay"
                  >
                    <UserRound className="h-3 w-3" /> เข้าสู่ระบบสมาชิก
                  </button>
                )}
                <div className="mt-2 rounded-xl border border-line bg-cream px-3 py-2">
                  <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-muted">
                    Demo admin
                  </p>
                  <p className="mt-0.5 text-[8px]">admin@patsakorn.shop</p>
                  <p className="text-[8px] text-muted">admin1234</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden border-t border-line/80 pt-8">
            <p className="select-none text-center font-display text-[clamp(3.5rem,13vw,11.5rem)] font-extrabold leading-[0.8] tracking-[-0.08em] text-ink/[0.07]">
              patsakorn<span className="text-clay/30">.</span>
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-line/80 pt-5 text-[8px] text-muted sm:flex-row">
            <p>© 2026 patsakorn. mix shop — curated everyday goods.</p>
            <p className="flex items-center gap-1.5">
              Made with care in Bangkok <span className="h-1 w-1 rounded-full bg-clay/50" />{' '}
              PostgreSQL back office
            </p>
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={addToCart}
      />
      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={openCheckout}
        onContinue={() => {
          setCartOpen(false);
          window.setTimeout(scrollToCatalog, 60);
        }}
      />
      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        user={user}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        onLogin={() => setAuthOpen(true)}
        onViewOrders={() => {
          setCheckoutOpen(false);
          setOrdersOpen(true);
        }}
      />
      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
      />
      <OrderHistoryModal
        open={ordersOpen}
        user={user}
        onClose={() => setOrdersOpen(false)}
        onLogin={() => setAuthOpen(true)}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
