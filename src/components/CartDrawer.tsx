import { useEffect } from 'react';
import {
  ArrowRight,
  Minus,
  PackageOpen,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X
} from 'lucide-react';
import { CartItem } from '../types';
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  cx,
  formatPrice,
  shippingFor
} from '../lib/utils';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  onContinue: () => void;
}

export function CartDrawer({
  open,
  items,
  onClose,
  onQuantity,
  onRemove,
  onCheckout,
  onContinue
}: CartDrawerProps) {
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

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = shippingFor(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-[75]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        aria-label="ปิดตะกร้า"
      />
      <aside className="animate-scale-in absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4" />
            <h2 className="text-sm font-bold tracking-[-0.01em]">ตะกร้าของคุณ</h2>
            <span className="rounded-full bg-sand px-2 py-0.5 text-[9px] font-bold text-ink/60">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
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

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-sand/70">
              <PackageOpen className="h-7 w-7 text-ink/45" />
            </span>
            <h3 className="mt-4 text-lg font-bold tracking-[-0.02em]">ตะกร้ายังว่างอยู่</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              เลือกของดีที่ใช่สำหรับคุณ แล้วกลับมาเติมตะกร้าได้เลย
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="mt-5 flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[11px] font-semibold text-cream"
            >
              เลือกซื้อสินค้า <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-line/70 px-5 py-3">
              <div className="flex items-center justify-between text-[9px] font-semibold">
                <span className="flex items-center gap-1.5 text-ink/70">
                  <Truck className="h-3.5 w-3.5 text-clay" />
                  {remaining > 0 ? (
                    <>เพิ่มอีก <b className="text-clay">{formatPrice(remaining)}</b> เพื่อส่งฟรี</>
                  ) : (
                    <>คุณได้รับสิทธิ์ <b className="text-sage">ส่งฟรี</b> แล้ว</>
                  )}
                </span>
                <span className="text-muted">{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand-deep/50">
                <div
                  className={cx(
                    'h-full rounded-full transition-all duration-500',
                    remaining === 0 ? 'bg-sage' : 'bg-clay'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map(item => (
                  <li key={item.id} className="flex gap-3.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-[84px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-sand/55"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                            {item.product.brand}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug">
                            {item.product.name}
                          </p>
                          <p className="mt-1 text-[9px] text-muted">
                            ตัวเลือก: {item.selectedVariant}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          className="text-muted transition-colors hover:text-clay"
                          aria-label="ลบสินค้าออกจากตะกร้า"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex h-7 items-center rounded-full border border-line bg-white/60">
                          <button
                            type="button"
                            onClick={() => onQuantity(item.id, -1)}
                            className="grid h-full w-7 place-items-center text-ink/55 disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            aria-label="ลดจำนวน"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-[10px] font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onQuantity(item.id, 1)}
                            className="grid h-full w-7 place-items-center text-ink/55 disabled:opacity-30"
                            disabled={item.quantity >= item.product.variants.find(v => v.label === item.selectedVariant)?.stock!}
                            aria-label="เพิ่มจำนวน"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[11px] font-bold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line bg-cream-soft/65 px-5 pb-5 pt-4">
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted">ยอดรวมสินค้า</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ค่าจัดส่ง</span>
                  <span className={cx('font-semibold', shipping === 0 && 'text-sage')}>
                    {shipping === 0 ? 'ฟรี' : formatPrice(SHIPPING_FEE)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t border-line/70 pt-3">
                <span className="text-[11px] font-bold">ยอดชำระทั้งหมด</span>
                <span className="text-xl font-extrabold tracking-[-0.03em]">
                  {formatPrice(subtotal + shipping)}
                </span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[11px] font-bold text-cream transition-transform hover:scale-[1.01]"
              >
                ดำเนินการชำระเงิน <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="mt-2 h-9 w-full text-[10px] font-semibold text-ink/60 hover:text-ink"
              >
                เลือกซื้อสินค้าต่อ
              </button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[8px] text-muted">
                <ShieldCheck className="h-3 w-3" /> ชำระเงินปลอดภัย · ข้อมูลของคุณถูกเข้ารหัส
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
