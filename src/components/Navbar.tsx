import { useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  UserRound,
  X
} from 'lucide-react';
import { User } from '../types';
import { initials } from '../lib/utils';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  cartCount: number;
  user: User | null;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
  onSearch: (value: string) => void;
  onLogout: () => void;
}

const NAV_LINKS = [
  { label: 'สินค้าทั้งหมด', href: '#catalog' },
  { label: 'หมวดหมู่', href: '#categories' },
  { label: 'เรื่องราว', href: '#story' },
  { label: 'ติดต่อ', href: '#footer' }
];

export function Navbar({
  cartCount,
  user,
  onOpenCart,
  onOpenAuth,
  onOpenOrders,
  onOpenAdmin,
  onSearch,
  onLogout
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(search.trim());
    setMobileOpen(false);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 md:px-8 lg:px-12">
        <a
          href="#top"
          onClick={() => setMobileOpen(false)}
          className="shrink-0"
          aria-label="patsakorn. mix shop"
        >
          <BrandLogo />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="link-underline text-[12px] font-semibold tracking-[0.01em] text-ink/75 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="link-underline flex items-center gap-1.5 text-[12px] font-semibold text-ink/75 transition-colors hover:text-ink"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            หลังบ้าน
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <form
            onSubmit={submitSearch}
            className="hidden h-10 w-[220px] items-center gap-2 rounded-full border border-line bg-cream-soft px-4 transition-colors focus-within:border-ink/45 xl:flex"
          >
            <Search className="h-3.5 w-3.5 text-muted" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full bg-transparent text-[11px] text-ink outline-none placeholder:text-muted/75"
              aria-label="ค้นหาสินค้า"
            />
          </form>

          <button
            type="button"
            onClick={() => setMobileOpen(open => !open)}
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-sand/60 lg:hidden"
            aria-label="เปิดเมนู"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="group relative hidden lg:block">
              <button
                type="button"
                className="flex h-10 items-center gap-2 rounded-full border border-line bg-cream-soft pl-1.5 pr-3.5 transition-colors hover:border-ink/40"
                aria-label="บัญชีของฉัน"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-[9px] font-bold text-cream">
                    {initials(user.name)}
                  </span>
                )}
                <span className="max-w-[88px] truncate text-[11px] font-semibold">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              <div className="pointer-events-none absolute right-0 top-full w-60 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="rounded-2xl border border-line bg-cream-soft p-2 shadow-[0_24px_60px_-22px_rgba(23,21,18,0.35)]">
                  <div className="px-3 py-2">
                    <p className="text-[11px] font-bold">{user.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted">{user.email}</p>
                    <span className="mt-2 inline-flex rounded-full bg-sand px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-ink/70">
                      {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenOrders}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium hover:bg-sand/60"
                  >
                    <Package className="h-3.5 w-3.5 text-muted" /> คำสั่งซื้อของฉัน
                  </button>
                  {user.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={onOpenAdmin}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium hover:bg-sand/60"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-muted" /> หลังบ้าน
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-clay hover:bg-clay-soft/40"
                  >
                    <LogOut className="h-3.5 w-3.5" /> ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden h-10 items-center gap-2 rounded-full border border-line px-4 text-[11px] font-semibold transition-colors hover:bg-sand/60 lg:flex"
            >
              <UserRound className="h-3.5 w-3.5" /> เข้าสู่ระบบ
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-ink text-cream transition-transform hover:scale-[1.04]"
            aria-label="เปิดตะกร้าสินค้า"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-[19px] min-w-[19px] place-items-center rounded-full border-2 border-cream bg-clay px-1 text-[8px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-cream px-5 pb-6 pt-4 lg:hidden">
          <form
            onSubmit={submitSearch}
            className="mb-4 flex h-11 items-center gap-2 rounded-full border border-line bg-cream-soft px-4"
          >
            <Search className="h-4 w-4 text-muted" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted/75"
              aria-label="ค้นหาสินค้า"
            />
          </form>

          <div className="flex flex-col">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="border-b border-line/60 py-3 text-left text-sm font-semibold"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAdmin();
              }}
              className="border-b border-line/60 py-3 text-left text-sm font-semibold"
            >
              หลังบ้าน
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-sand/45 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-[10px] font-bold text-cream">
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{user.name}</p>
                    <p className="truncate text-[10px] text-muted">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenOrders();
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-line text-xs font-semibold"
                >
                  <Package className="h-4 w-4" /> คำสั่งซื้อของฉัน
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-clay/25 text-xs font-semibold text-clay"
                >
                  <LogOut className="h-4 w-4" /> ออกจากระบบ
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                className="h-11 rounded-full bg-ink text-xs font-semibold text-cream"
              >
                เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
