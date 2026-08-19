import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Mail, Phone, ShieldCheck, Sparkles, LogIn } from 'lucide-react';
import { User } from '../types';
import { SpeedStrideLogo } from './SpeedStrideLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'CUSTOMER' | 'ADMIN') => {
    const demoUser: User = role === 'ADMIN'
      ? {
          id: 'user-admin-1',
          name: 'พัสกร (Admin)',
          email: 'admin.passakorn@speedstride.com',
          role: 'ADMIN',
          phone: '089-888-9999',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
        }
      : {
          id: 'user-customer-1',
          name: 'พัสกร',
          email: 'passakorn@speedstride.com',
          role: 'CUSTOMER',
          phone: '081-234-5678',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
        };

    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="auth-modal"
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <SpeedStrideLogo size="sm" />

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switcher Banner */}
        <div className="p-4 bg-blue-950/40 border-b border-blue-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>เข้าสู่ระบบทดสอบ 1-Click Demo</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('CUSTOMER')}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-sky-500 text-left transition-all group"
            >
              <span className="text-[10px] font-bold uppercase text-sky-400 block">👤 ลูกค้า (Customer)</span>
              <span className="text-xs font-bold text-white group-hover:text-sky-400">พัสกร</span>
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-indigo-400 text-left transition-all group"
            >
              <span className="text-[10px] font-bold uppercase text-indigo-400 block">👨💻 แอดมิน (Admin)</span>
              <span className="text-xs font-bold text-white group-hover:text-indigo-400">พัสกร (Admin)</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-950/40 text-xs font-bold">
          <button
            onClick={() => setTab('login')}
            className={`p-3 text-center transition-all ${
              tab === 'login'
                ? 'border-b-2 border-sky-500 text-sky-400 bg-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            onClick={() => setTab('register')}
            className={`p-3 text-center transition-all ${
              tab === 'register'
                ? 'border-b-2 border-sky-500 text-sky-400 bg-zinc-900'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            สมัครสมาชิกใหม่ (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">อีเมลผู้ใช้ (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="passakorn@speedstride.com หรือ admin.passakorn@speedstride.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">รหัสผ่าน (Password)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ SpeedStride</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">ชื่อ-นามสกุล (Full Name) *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น พัสกร สุขเจริญ"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">อีเมล (Email) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="passakorn@speedstride.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">เบอร์โทรศัพท์ (Phone)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>สมัครสมาชิก SpeedStride</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
