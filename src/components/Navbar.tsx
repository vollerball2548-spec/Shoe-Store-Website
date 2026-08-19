import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User as UserIcon, 
  ShieldCheck, 
  Activity, 
  Package, 
  LogOut, 
  Menu, 
  X, 
  Store,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';
import { SpeedStrideLogo } from './SpeedStrideLogo';

interface NavbarProps {
  currentView: 'store' | 'admin' | 'queue';
  onSelectView: (view: 'store' | 'admin' | 'queue') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
  currentUser: User | null;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeJobCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  cartCount,
  onOpenCart,
  onOpenOrders,
  onOpenAuth,
  currentUser,
  onLogout,
  searchQuery,
  onSearchChange,
  activeJobCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100 transition-all">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-600 px-4 py-1.5 text-xs text-white flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider">
              {isAdmin ? 'ADMIN CONSOLE' : 'SPEEDSTRIDE OFFICIAL'}
            </span>
            <span>
              {isAdmin 
                ? 'ระบบจัดการร้าน SpeedStride (Admin Panel) • ผู้ดูแลระบบ: คุณพัสกร' 
                : 'SpeedStride Premium Footwear Co. • รองเท้าสตรีทแวร์และสนีกเกอร์ของแท้ 100%'}
            </span>
          </div>

          {isAdmin && (
            <div className="hidden md:flex items-center gap-4 text-xs">
              <button 
                onClick={() => onSelectView('queue')}
                className="hover:underline flex items-center gap-1 font-semibold"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>BullMQ Queue Status</span>
                {activeJobCount > 0 && (
                  <span className="bg-amber-400 text-zinc-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold animate-pulse">
                    {activeJobCount} Active
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('store')}
              className="flex items-center text-left group focus:outline-none"
            >
              <SpeedStrideLogo />
            </button>
          </div>

          {/* Navigation View Switcher Tabs (Desktop) - Only show Admin & Queue tabs to Admin */}
          {isAdmin ? (
            <nav className="hidden lg:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                id="nav-store-btn"
                onClick={() => onSelectView('store')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'store'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>ร้านค้า (Storefront)</span>
              </button>

              <button
                id="nav-admin-btn"
                onClick={() => onSelectView('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </button>

              <button
                id="nav-queue-btn"
                onClick={() => onSelectView('queue')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'queue'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>BullMQ Queue</span>
                {activeJobCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                )}
              </button>
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Store className="w-4 h-4 text-sky-400" />
                <span>หน้าร้านค้า SpeedStride</span>
              </span>
            </div>
          )}

          {/* Search Bar (Store view) */}
          {currentView === 'store' && (
            <div className="hidden md:flex items-center flex-1 max-w-xs relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ค้นหารุ่นรองเท้า SpeedStride, Nike, Samba..."
                className="w-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Orders History Trigger */}
            <button
              id="btn-order-history"
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-xs font-medium transition-all"
              title={isAdmin ? 'คำสั่งซื้อทั้งหมด' : 'ประวัติคำสั่งซื้อของฉัน'}
            >
              <Package className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">
                {isAdmin ? 'คำสั่งซื้อทั้งหมด' : 'ประวัติคำสั่งซื้อ'}
              </span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              id="btn-cart-toggle"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 hover:border-sky-500/50 transition-all flex items-center justify-center"
              aria-label="ตะกร้าสินค้า"
            >
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-scale">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-all"
                  >
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                    <span className="hidden md:inline max-w-[120px] truncate font-semibold">{currentUser.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${currentUser.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-sky-500/20 text-sky-400'}`}>
                      {currentUser.role}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                          สิทธิ์: {currentUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ลูกค้า (Customer)'}
                        </span>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onSelectView('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          <span>เปิด Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectView('store');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Store className="w-3.5 h-3.5 text-sky-400" />
                        <span>หน้าร้านค้า (Storefront)</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenOrders();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isAdmin ? 'คำสั่งซื้อทั้งหมด' : 'คำสั่งซื้อของฉัน'}</span>
                      </button>

                      <div className="border-t border-zinc-800 my-1"></div>

                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>ออกจากระบบ (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-login-trigger"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>เข้าสู่ระบบ / สมัคร</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-2 animate-in slide-in-from-top-4">
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ค้นหารองเท้า..."
              className="w-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2"
            />
          </div>
          <button
            onClick={() => { onSelectView('store'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
              currentView === 'store' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Storefront (ร้านค้า SpeedStride)</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => { onSelectView('admin'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  currentView === 'admin' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard (จัดการสินค้า/ออเดอร์)</span>
              </button>
              <button
                onClick={() => { onSelectView('queue'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  currentView === 'queue' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>BullMQ Background Queue Live</span>
              </button>
            </>
          )}

          <button
            onClick={() => { onOpenOrders(); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
          >
            <Package className="w-4 h-4 text-sky-400" />
            <span>{isAdmin ? 'รายการคำสั่งซื้อทั้งหมด' : 'ประวัติคำสั่งซื้อของฉัน'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
