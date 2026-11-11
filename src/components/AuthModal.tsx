import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { User } from '../types';
import { api, storeToken } from '../services/api';
import { BrandLogo } from './BrandLogo';
import { cx } from '../lib/utils';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

type Mode = 'login' | 'register';

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setBusy(false);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const resetMessages = () => setError('');

  const fillDemo = (role: 'admin' | 'customer') => {
    setMode('login');
    setEmail(role === 'admin' ? 'admin@patsakorn.shop' : 'customer@patsakorn.shop');
    setPassword(role === 'admin' ? 'admin1234' : 'customer1234');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password.length < 8) {
        setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
        return;
      }
      if (password !== confirm) {
        setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
        return;
      }
    }

    setBusy(true);
    try {
      const result =
        mode === 'login'
          ? await api.login(email, password)
          : await api.register({ name, email, phone, password });
      storeToken(result.token);
      onSuccess(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
      />
      <div className="animate-scale-in relative flex max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:max-h-[90vh] sm:rounded-[30px]">
        <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink p-8 text-cream md:flex">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-cream/10" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-clay/20 blur-3xl" />
          <BrandLogo light />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-cream/60">
              <Sparkles className="h-3 w-3 text-amber" /> Members only
            </span>
            <h2 className="mt-5 text-[clamp(1.9rem,3.2vw,2.7rem)] font-extrabold leading-[1.06] tracking-[-0.045em]">
              ของดีที่คัดมา
              <br />
              ควรอยู่ในมือคุณ
            </h2>
            <p className="mt-4 max-w-[260px] text-[11px] leading-[1.9] text-cream/55">
              สมัครสมาชิกเพื่อเก็บประวัติคำสั่งซื้อ ติดตามสถานะ และรับสิทธิพิเศษก่อนใคร
            </p>
            <ul className="mt-6 space-y-2.5">
              {['ติดตามสถานะคำสั่งซื้อได้ทันที', 'เก็บที่อยู่จัดส่งไว้ใช้ครั้งต่อไป', 'รับโค้ดส่วนลดสำหรับสมาชิก'].map(
                item => (
                  <li key={item} className="flex items-center gap-2 text-[10px] text-cream/70">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-cream/10">
                      <Check className="h-2.5 w-2.5 text-sage" />
                    </span>
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>
          <p className="relative z-10 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] text-cream/35">
            <ShieldCheck className="h-3 w-3" /> Secured by patsakorn.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-9">
          <div className="flex items-start justify-between md:justify-end">
            <div className="md:hidden">
              <BrandLogo compact />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:bg-sand/60"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 md:mt-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-clay">
              {mode === 'login' ? 'Welcome back' : 'Join the shop'}
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-[-0.03em]">
              {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
            </h2>
            <p className="mt-1 text-[11px] text-muted">
              {mode === 'login'
                ? 'ใช้อีเมลและรหัสผ่านของคุณเพื่อดำเนินการต่อ'
                : 'กรอกข้อมูลสั้น ๆ เพื่อเริ่มช้อปกับเรา'}
            </p>
          </div>

          <div className="mt-4 flex rounded-full border border-line bg-cream-soft p-1">
            {(['login', 'register'] as Mode[]).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  resetMessages();
                }}
                className={cx(
                  'flex-1 rounded-full py-2 text-[10px] font-bold transition-colors',
                  mode === tab ? 'bg-ink text-cream' : 'text-muted hover:text-ink'
                )}
              >
                {tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="label-xs" htmlFor="auth-name">
                    ชื่อ–นามสกุล
                  </label>
                  <input
                    id="auth-name"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    required
                    placeholder="เช่น พัสกร สุขเจริญ"
                    className="field"
                  />
                </div>
                <div>
                  <label className="label-xs" htmlFor="auth-phone">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    id="auth-phone"
                    value={phone}
                    onChange={event => setPhone(event.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="field"
                  />
                </div>
              </>
            )}

            <div>
              <label className="label-xs" htmlFor="auth-email">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label-xs" htmlFor="auth-password">
                รหัสผ่าน
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  placeholder={mode === 'register' ? 'อย่างน้อย 8 ตัวอักษร' : 'รหัสผ่านของคุณ'}
                  className="field pl-10 pr-10"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(value => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="label-xs" htmlFor="auth-confirm">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  id="auth-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={event => setConfirm(event.target.value)}
                  required
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  className="field"
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-clay/25 bg-clay-soft/35 px-3 py-2 text-[10px] font-medium text-clay">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[11px] font-bold text-cream transition-transform hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-cream-soft/60 p-3.5">
              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                Demo accounts
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fillDemo('customer')}
                  className="rounded-xl border border-line bg-white/60 p-2.5 text-left transition-colors hover:border-ink/35"
                >
                  <p className="text-[9px] font-bold">ลูกค้าตัวอย่าง</p>
                  <p className="mt-0.5 truncate text-[8px] text-muted">customer@patsakorn.shop</p>
                  <p className="text-[8px] text-muted">customer1234</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="rounded-xl border border-line bg-white/60 p-2.5 text-left transition-colors hover:border-ink/35"
                >
                  <p className="text-[9px] font-bold">ผู้ดูแลร้าน</p>
                  <p className="mt-0.5 truncate text-[8px] text-muted">admin@patsakorn.shop</p>
                  <p className="text-[8px] text-muted">admin1234</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
