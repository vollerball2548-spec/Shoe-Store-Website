import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  LockKeyhole,
  MapPin,
  QrCode,
  ShieldCheck,
  Tag,
  Truck,
  X
} from 'lucide-react';
import { CartItem, Order, User } from '../types';
import { ApiError, api } from '../services/api';
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  cx,
  discountForCoupon,
  formatPrice,
  shippingFor
} from '../lib/utils';

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  user: User | null;
  onClose: () => void;
  onSuccess: (order: Order) => void;
  onLogin: () => void;
  onViewOrders: () => void;
}

const VALID_COUPONS = ['MIX10', 'MIX300', 'MIX500', 'MIX800', 'MIX1000', 'FREESHIP'];
const THAI_PROVINCES = [
  'กรุงเทพมหานคร',
  'เชียงใหม่',
  'เชียงราย',
  'ขอนแก่น',
  'นครราชสีมา',
  'อุดรธานี',
  'อุบลราชธานี',
  'ชลบุรี',
  'ระยอง',
  'ภูเก็ต',
  'สุราษฎร์ธานี',
  'สงขลา',
  'นครศรีธรรมราช',
  'พิษณุโลก',
  'นครสวรรค์',
  'อื่น ๆ'
];

const PAYMENTS: Array<{
  value: Order['paymentMethod'];
  label: string;
  description: string;
  icon: typeof QrCode;
}> = [
  { value: 'PromptPay', label: 'พร้อมเพย์', description: 'สแกน QR ผ่านแอปธนาคาร', icon: QrCode },
  { value: 'CreditCard', label: 'บัตรเครดิต', description: 'Visa / Mastercard (จำลอง)', icon: CreditCard },
  { value: 'COD', label: 'เก็บเงินปลายทาง', description: 'ชำระเมื่อได้รับสินค้า', icon: Banknote }
];

export function CheckoutModal({
  open,
  items,
  user,
  onClose,
  onSuccess,
  onLogin,
  onViewOrders
}: CheckoutModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('กรุงเทพมหานคร');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('PromptPay');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponOpen, setCouponOpen] = useState(false);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset the form only when the modal opens (or the signed-in customer changes).
  // Keeping this separate from the dismissal effect prevents parent re-renders,
  // such as a toast disappearing, from wiping fields the customer is editing.
  useEffect(() => {
    if (!open) return;
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setEmail(user?.email || '');
    setError('');
    setCouponError('');
    setPlacedOrder(null);
    setCopied(false);
  }, [open, user?.id]);

  useEffect(() => {
    if (!open) return;
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

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );
  const discount = discountForCoupon(coupon, subtotal);
  const freeShipCoupon = coupon === 'FREESHIP';
  const shipping = freeShipCoupon ? 0 : shippingFor(subtotal);
  const total = Math.max(0, subtotal - discount + shipping);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (!open) return null;

  const applyCoupon = (value: string) => {
    const normalized = value.trim().toUpperCase();
    setCouponError('');
    if (!normalized) {
      setCoupon('');
      return;
    }
    if (!VALID_COUPONS.includes(normalized)) {
      setCouponError('โค้ดส่วนลดนี้ไม่ถูกต้องหรือหมดอายุแล้ว');
      setCoupon('');
      return;
    }
    setCoupon(normalized);
    setCouponInput(normalized);
  };

  const copyOrderId = async () => {
    if (!placedOrder) return;
    try {
      await navigator.clipboard.writeText(placedOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('ตะกร้าของคุณว่างเปล่า');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !email.trim() || !addressLine.trim() || !district.trim() || !postalCode.trim()) {
      setError('กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }
    if (!/^\d{5}$/.test(postalCode.trim())) {
      setError('รหัสไปรษณีย์ต้องมี 5 หลัก');
      return;
    }

    setPlacing(true);
    try {
      const order = await api.createOrder({
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        items: items.map(item => ({
          productId: item.productId,
          selectedVariant: item.selectedVariant,
          quantity: item.quantity
        })),
        couponCode: coupon || undefined,
        paymentMethod,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          addressLine: addressLine.trim(),
          district: district.trim(),
          province,
          postalCode: postalCode.trim(),
          notes: notes.trim() || undefined
        }
      });
      setPlacedOrder(order);
      onSuccess(order);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่';
      setError(message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[82] flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        aria-label="ปิดหน้าชำระเงิน"
      />
      <div className="animate-scale-in relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:max-h-[90vh] sm:rounded-[30px]">
        {placedOrder ? (
          <div className="relative overflow-y-auto px-6 py-10 sm:px-12 sm:py-14">
            <div className="mx-auto max-w-xl text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-sage-soft">
                <CheckCircle2 className="h-9 w-9 text-[#5f7351]" strokeWidth={1.5} />
              </span>
              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.24em] text-clay">
                Order confirmed
              </p>
              <h2 className="mt-1.5 text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.04em]">
                ขอบคุณสำหรับการสั่งซื้อ
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[11px] leading-[1.9] text-muted">
                เราได้รับคำสั่งซื้อของคุณแล้ว ระบบกำลังตรวจสอบสต็อกและส่งอีเมลยืนยันไปที่{' '}
                <span className="font-semibold text-ink">{placedOrder.customerEmail}</span>
              </p>

              <div className="mt-6 rounded-[24px] border border-line bg-cream-soft p-5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                      หมายเลขคำสั่งซื้อ
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold">{placedOrder.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyOrderId()}
                    className="flex items-center gap-1.5 rounded-full border border-line bg-white/60 px-3 py-1.5 text-[9px] font-semibold"
                  >
                    {copied ? <Check className="h-3 w-3 text-sage" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line/70 pt-3 text-[10px] sm:grid-cols-3">
                  <div>
                    <p className="text-muted">ยอดชำระ</p>
                    <p className="mt-1 text-sm font-extrabold">{formatPrice(placedOrder.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted">การชำระเงิน</p>
                    <p className="mt-1 font-semibold">
                      {PAYMENTS.find(item => item.value === placedOrder.paymentMethod)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">สถานะ</p>
                    <p className="mt-1 font-semibold">รอดำเนินการ</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-sand/45 p-3">
                  <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay" />
                  <p className="text-[9px] leading-relaxed text-ink/65">
                    ระบบได้ส่งงานเข้าคิวเบื้องหลังเพื่อตรวจสต็อก สร้างใบเสร็จ และส่งอีเมลยืนยันแล้ว
                    คุณสามารถติดตามความคืบหน้าได้ที่หน้าคำสั่งซื้อ
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={onViewOrders}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[11px] font-bold text-cream"
                >
                  ดูคำสั่งซื้อของฉัน <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 items-center justify-center rounded-full border border-line px-6 text-[11px] font-semibold"
                >
                  กลับไปเลือกซื้อต่อ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream">
                  <LockKeyhole className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
                    Secure checkout
                  </p>
                  <h2 className="text-sm font-bold">ชำระเงิน</h2>
                </div>
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

            <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.25fr_0.9fr]">
              <form onSubmit={handlePlaceOrder} className="p-5 sm:p-7">
                {!user && (
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-cream-soft px-4 py-3">
                    <p className="text-[10px] text-muted">
                      เข้าสู่ระบบเพื่อบันทึกคำสั่งซื้อในบัญชีของคุณ
                    </p>
                    <button
                      type="button"
                      onClick={onLogin}
                      className="shrink-0 text-[10px] font-bold text-clay hover:underline"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[9px] font-bold text-cream">
                    1
                  </span>
                  <h3 className="text-[12px] font-bold">ข้อมูลผู้รับและที่อยู่จัดส่ง</h3>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label-xs" htmlFor="checkout-name">
                      ชื่อ–นามสกุลผู้รับ
                    </label>
                    <input
                      id="checkout-name"
                      name="name"
                      autoComplete="name"
                      value={fullName}
                      onChange={event => setFullName(event.target.value)}
                      className="field"
                      placeholder="ชื่อ-นามสกุล"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-xs" htmlFor="checkout-phone">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      id="checkout-phone"
                      name="phone"
                      autoComplete="tel"
                      value={phone}
                      onChange={event => setPhone(event.target.value)}
                      className="field"
                      placeholder="08X-XXX-XXXX"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-xs" htmlFor="checkout-email">
                      อีเมล
                    </label>
                    <input
                      id="checkout-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      className="field"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-xs" htmlFor="checkout-address">
                      ที่อยู่ (บ้านเลขที่ / ถนน / ซอย)
                    </label>
                    <input
                      id="checkout-address"
                      name="address"
                      autoComplete="address-line1"
                      value={addressLine}
                      onChange={event => setAddressLine(event.target.value)}
                      className="field"
                      placeholder="เช่น 99/12 ซอยสุขุมวิท 21"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-xs" htmlFor="checkout-district">
                      เขต / อำเภอ
                    </label>
                    <input
                      id="checkout-district"
                      name="district"
                      autoComplete="address-level2"
                      value={district}
                      onChange={event => setDistrict(event.target.value)}
                      className="field"
                      placeholder="เช่น วัฒนา"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-xs" htmlFor="checkout-province">
                      จังหวัด
                    </label>
                    <select
                      id="checkout-province"
                      name="province"
                      autoComplete="address-level1"
                      value={province}
                      onChange={event => setProvince(event.target.value)}
                      className="field"
                    >
                      {THAI_PROVINCES.map(item => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-xs" htmlFor="checkout-postal">
                      รหัสไปรษณีย์
                    </label>
                    <input
                      id="checkout-postal"
                      name="postalCode"
                      autoComplete="postal-code"
                      value={postalCode}
                      onChange={event => setPostalCode(event.target.value)}
                      className="field"
                      placeholder="10110"
                      inputMode="numeric"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="label-xs" htmlFor="checkout-notes">
                      หมายเหตุ (ไม่บังคับ)
                    </label>
                    <input
                      id="checkout-notes"
                      name="notes"
                      value={notes}
                      onChange={event => setNotes(event.target.value)}
                      className="field"
                      placeholder="เช่น ฝากไว้ที่นิติบุคคล"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[9px] font-bold text-cream">
                    2
                  </span>
                  <h3 className="text-[12px] font-bold">ช่องทางการชำระเงิน</h3>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {PAYMENTS.map(method => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={cx(
                        'flex flex-col rounded-2xl border p-3 text-left transition-colors',
                        paymentMethod === method.value
                          ? 'border-ink bg-ink text-cream'
                          : 'border-line bg-white/55 hover:border-ink/35'
                      )}
                    >
                      <method.icon
                        className={cx(
                          'h-4 w-4',
                          paymentMethod === method.value ? 'text-amber' : 'text-clay'
                        )}
                        strokeWidth={1.7}
                      />
                      <p className="mt-2 text-[10px] font-bold">{method.label}</p>
                      <p
                        className={cx(
                          'mt-0.5 text-[8px] leading-snug',
                          paymentMethod === method.value ? 'text-cream/55' : 'text-muted'
                        )}
                      >
                        {method.description}
                      </p>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'CreditCard' && (
                  <div className="animate-fade-up mt-3 rounded-2xl border border-line bg-white/50 p-3">
                    <p className="text-[9px] text-muted">
                      โหมดสาธิต — ไม่มีการตัดเงินจริง ระบบจะบันทึกสถานะชำระเงินเป็นชำระแล้ว
                    </p>
                  </div>
                )}

                {error && (
                  <p className="mt-4 rounded-xl border border-clay/25 bg-clay-soft/35 px-3 py-2 text-[10px] font-medium text-clay">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={placing || items.length === 0}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-clay text-[11px] font-bold text-white transition-transform hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> กำลังสร้างคำสั่งซื้อ...
                    </>
                  ) : (
                    <>
                      ยืนยันคำสั่งซื้อ · {formatPrice(total)}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-[8px] text-muted">
                  <ShieldCheck className="h-3 w-3" /> ข้อมูลจัดส่งและรหัสผ่านของคุณถูกป้องกันอย่างปลอดภัย
                </p>
              </form>

              <aside className="border-t border-line bg-cream-soft/70 p-5 sm:p-7 lg:border-l lg:border-t-0">
                <div className="lg:sticky lg:top-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[12px] font-bold">สรุปคำสั่งซื้อ</h3>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[8px] font-bold text-ink/60">
                      {itemCount} ชิ้น
                    </span>
                  </div>

                  <div className="mt-3 max-h-52 space-y-3 overflow-y-auto pr-1">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-2.5">
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[7px] font-bold text-cream">
                            {item.quantity}
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[9px] font-semibold">{item.product.name}</p>
                          <p className="text-[8px] text-muted">{item.selectedVariant}</p>
                        </div>
                        <p className="text-[9px] font-bold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-line/70 pt-3">
                    <button
                      type="button"
                      onClick={() => setCouponOpen(value => !value)}
                      className="flex w-full items-center justify-between text-[10px] font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-clay" />
                        {coupon ? `ใช้โค้ด ${coupon}` : 'มีโค้ดส่วนลดไหม?'}
                      </span>
                      <span className="text-[9px] text-clay">{couponOpen ? 'ซ่อน' : 'ใส่โค้ด'}</span>
                    </button>
                    {couponOpen && (
                      <div className="animate-fade-up mt-2 flex gap-2">
                        <input
                          value={couponInput}
                          onChange={event => setCouponInput(event.target.value)}
                          onKeyDown={event => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              applyCoupon(couponInput);
                            }
                          }}
                          placeholder="MIX10"
                          className="field h-9 flex-1 py-1.5 text-[10px] uppercase"
                        />
                        <button
                          type="button"
                          onClick={() => applyCoupon(couponInput)}
                          className="h-9 rounded-full bg-ink px-4 text-[9px] font-bold text-cream"
                        >
                          ใช้โค้ด
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="mt-1.5 text-[8px] font-medium text-clay">{couponError}</p>
                    )}
                    {coupon && (
                      <p className="mt-1.5 flex items-center justify-between text-[8px] text-sage">
                        <span className="flex items-center gap-1">
                          <Check className="h-2.5 w-2.5" />{' '}
                          {freeShipCoupon ? 'ส่งฟรี' : `ลดทันที ${formatPrice(discount)}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCoupon('');
                            setCouponInput('');
                          }}
                          className="text-muted hover:text-clay"
                        >
                          ลบโค้ด
                        </button>
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {['MIX10', 'MIX300', 'FREESHIP'].map(code => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => applyCoupon(code)}
                          className="rounded-full border border-line bg-white/50 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-ink/55 hover:border-clay/40 hover:text-clay"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {remainingForFreeShip > 0 && !freeShipCoupon ? (
                    <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-sand/40 p-2 text-[8px] leading-relaxed text-ink/60">
                      <Truck className="mt-0.5 h-3 w-3 shrink-0 text-clay" />
                      เพิ่มอีก {formatPrice(remainingForFreeShip)} เพื่อรับสิทธิ์จัดส่งฟรี
                    </p>
                  ) : (
                    <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-sage-soft/40 p-2 text-[8px] font-semibold text-[#586849]">
                      <Truck className="h-3 w-3" /> คุณได้รับสิทธิ์จัดส่งฟรี
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 border-t border-line/70 pt-3 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted">ยอดสินค้า</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-clay">
                        <span>ส่วนลด ({coupon})</span>
                        <span className="font-semibold">−{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted">ค่าจัดส่ง</span>
                      <span className={cx('font-semibold', shipping === 0 && 'text-sage')}>
                        {shipping === 0 ? 'ฟรี' : formatPrice(SHIPPING_FEE)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-baseline justify-between border-t border-line/70 pt-3">
                    <span className="text-[11px] font-bold">ยอดชำระทั้งหมด</span>
                    <span className="text-xl font-extrabold tracking-[-0.03em]">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-[8px] leading-relaxed text-muted">
                    <MapPin className="h-3 w-3 shrink-0" />
                    จัดส่งโดย Flash Express / Kerry Express ภายใน 1–2 วันทำการ
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
