import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
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
  const [username, setUsername] = useState('');
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
        setError('ยูสเซอร์เนมต้องยาว 3–24 ตัว ใช้ได้เฉพาะ a-z, 0-9 และ _');
        return;
      }
      if (password.length < 8 || password.length > 128) {
        setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และไม่เกิน 128 ตัว');
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
          ? await api.login(username, password)
          : await api.register({ name, username, email, phone, password });
      storeToken();
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
      <div className="animate-scale-in relative flex max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:max-h-[92vh] sm:rounded-[30px]">
        <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink p-8 text-cream lg:flex xl:p-10">
          <div className="auth-promo-orbit pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-cream/10" />
          <div className="auth-promo-glow pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-clay/20 blur-3xl" />
          <BrandLogo light />
          <div key={`promo-${mode}`} className="auth-content-enter relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-cream/60">
              <Sparkles className="auth-promo-sparkle h-3 w-3 text-amber" />
              {mode === 'login' ? 'ยินดีที่ได้พบกันอีกครั้ง' : 'เริ่มต้นสมาชิกใหม่'}
            </span>
            <h2 className="mt-5 max-w-md text-[clamp(1.9rem,3.2vw,2.7rem)] font-extrabold leading-[1.12] tracking-[-0.045em]">
              {mode === 'login' ? 'ชิ้นที่ใช่' : 'เริ่มเจอของที่ใช่'}
              <br />
              <span className="text-amber">ในทุกวันของคุณ</span>
            </h2>
            <p className="mt-4 max-w-sm text-[11px] leading-[1.9] text-cream/65">
              {mode === 'login'
                ? 'กลับมาดูคำสั่งซื้อและติดตามสถานะการจัดส่งของคุณได้ต่อเนื่อง'
                : 'สมัครสมาชิกเพื่อดูประวัติคำสั่งซื้อและติดตามพัสดุได้สะดวกในที่เดียว'}
            </p>
            <ul className="mt-6 space-y-2.5">
              {['ดูประวัติคำสั่งซื้อได้ทุกเมื่อ', 'ติดตามสถานะจัดส่งได้ง่าย', 'ช้อปครั้งต่อไปได้สะดวกขึ้น'].map(
                (item, index) => (
                  <li key={item} className="auth-feature-enter flex items-center gap-2 text-[10px] text-cream/75" style={{ animationDelay: `${index * 90}ms` }}>
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

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
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

          <div key={`form-heading-${mode}`} className="auth-content-enter mt-6 md:mt-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-clay">
              {mode === 'login' ? 'Welcome back' : 'Join the shop'}
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-[-0.03em]">
              {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
            </h2>
            <p className="mt-1 text-[11px] text-muted">
              {mode === 'login'
                ? 'เข้าสู่ระบบเพื่อกลับไปช้อปและติดตามคำสั่งซื้อของคุณ'
                : 'สร้างบัญชีของคุณ แล้วจัดการคำสั่งซื้อได้ง่ายขึ้น'}
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

          <form onSubmit={handleSubmit} onChange={() => error && setError('')} className="mt-5 space-y-4">
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
                    className="field auth-field"
                  />
                </div>
                <div>
                  <label className="label-xs" htmlFor="auth-username">ยูสเซอร์เนม</label>
                  <input
                    id="auth-username"
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                    required
                    minLength={3}
                    maxLength={24}
                    pattern="[A-Za-z0-9_]{3,24}"
                    autoComplete="username"
                    placeholder="เช่น mixshop_01"
                    className="field auth-field"
                  />
                  <p className="mt-1 text-[9px] text-muted">ใช้ตัวอักษรอังกฤษ ตัวเลข หรือ _ (3–24 ตัว)</p>
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
                    className="field auth-field"
                  />
                </div>
              </>
            )}

            {mode === 'register' ? (
              <div>
                <label className="label-xs" htmlFor="auth-email">อีเมลสำหรับติดต่อและคำสั่งซื้อ</label>
                <input id="auth-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@example.com" className="field auth-field" autoComplete="email" />
              </div>
            ) : (
              <div>
                <label className="label-xs" htmlFor="auth-login-username">ยูสเซอร์เนม</label>
                <input id="auth-login-username" value={username} onChange={event => setUsername(event.target.value)} required autoComplete="username" placeholder="ยูสเซอร์เนมของคุณ" className="field auth-field" />
              </div>
            )}

            <div>
              <label className="label-xs" htmlFor="auth-password">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  maxLength={128}
                  placeholder={mode === 'register' ? 'อย่างน้อย 8 ตัวอักษร' : 'รหัสผ่านของคุณ'}
                  className="field auth-field auth-field-with-action"
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
                  maxLength={128}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  className="field auth-field"
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

        </div>
      </div>
    </div>
  );
}
