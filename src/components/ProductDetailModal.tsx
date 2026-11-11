import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  X
} from 'lucide-react';
import { Product } from '../types';
import {
  CATEGORY_META,
  FREE_SHIPPING_THRESHOLD,
  cx,
  formatDate,
  formatPrice
} from '../lib/utils';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, variant: string, quantity: number) => void;
}

export function ProductDetailModal({ product, onClose, onAdd }: ProductDetailModalProps) {
  const firstAvailable = useMemo(
    () => product?.variants.find(variant => variant.stock > 0)?.label || product?.variants[0]?.label || '',
    [product]
  );
  const [variant, setVariant] = useState(firstAvailable);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setVariant(firstAvailable);
    setQuantity(1);
  }, [firstAvailable, product?.id]);

  useEffect(() => {
    if (!product) return;
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
  }, [product, onClose]);

  if (!product) return null;

  const selected = product.variants.find(entry => entry.label === variant);
  const maxQuantity = Math.max(1, selected?.stock || 0);
  const soldOut = !selected || selected.stock <= 0;
  const meta = CATEGORY_META[product.category];
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="ปิดรายละเอียดสินค้า"
      />
      <div className="animate-scale-in relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:max-h-[90vh] sm:rounded-[30px]">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-3.5 sm:px-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
            {meta.en} / {product.brand}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:bg-sand/60"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 overflow-y-auto md:grid-cols-[1.02fr_1fr]">
          <div className="relative p-4 sm:p-6 md:sticky md:top-0 md:self-start">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[22px] sm:rounded-[26px]"
              style={{ backgroundColor: meta.accent }}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {product.badge && (
                  <span className="w-fit rounded-full bg-ink px-3 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-cream">
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="w-fit rounded-full bg-clay px-3 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                    Save {discount}%
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { icon: Truck, label: 'ส่งฟรี', sub: `ขั้นต่ำ ฿${FREE_SHIPPING_THRESHOLD.toLocaleString()}` },
                { icon: ShieldCheck, label: 'ของแท้ 100%', sub: 'รับประกันจากร้าน' },
                { icon: PackageCheck, label: 'พร้อมส่ง', sub: `${product.totalStock} ชิ้น` }
              ].map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-line/80 bg-cream-soft/60 p-3"
                >
                  <item.icon className="h-4 w-4 text-clay" strokeWidth={1.7} />
                  <p className="mt-2 text-[9px] font-bold">{item.label}</p>
                  <p className="mt-0.5 text-[8px] leading-snug text-muted">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-line/70 p-5 sm:p-7 md:border-l md:border-t-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-clay">
              {product.brand}
            </p>
            <h2 className="mt-2 text-[clamp(1.45rem,3vw,2.1rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
              {product.name}
            </h2>
            <p className="mt-1.5 text-[11px] font-medium text-muted">{product.subtitle}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={cx(
                      'h-3.5 w-3.5',
                      star <= Math.round(product.rating)
                        ? 'fill-amber text-amber'
                        : 'fill-transparent text-line'
                    )}
                  />
                ))}
                <span className="ml-1 text-[10px] font-bold">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-muted">({product.reviewCount} รีวิว)</span>
              <span className="h-3 w-px bg-line" />
              <span className="text-[10px] text-muted">SKU {product.sku}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-[26px] font-extrabold tracking-[-0.04em]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[13px] text-muted line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="mt-4 text-[12px] leading-[1.85] text-ink/70">{product.description}</p>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  ตัวเลือก / ไซส์
                </p>
                {selected && (
                  <span className="text-[9px] text-muted">
                    เหลือ {selected.stock} ชิ้น
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {product.variants.map(entry => {
                  const active = entry.label === variant;
                  const unavailable = entry.stock <= 0;
                  return (
                    <button
                      key={entry.label}
                      type="button"
                      disabled={unavailable}
                      onClick={() => {
                        setVariant(entry.label);
                        setQuantity(1);
                      }}
                      className={cx(
                        'min-w-[54px] rounded-xl border px-3 py-2 text-[10px] font-semibold transition-colors',
                        active
                          ? 'border-ink bg-ink text-cream'
                          : 'border-line bg-white/65 text-ink hover:border-ink/40',
                        unavailable && 'cursor-not-allowed opacity-35 line-through'
                      )}
                    >
                      {entry.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-[46px] items-center rounded-full border border-line bg-white/65">
                <button
                  type="button"
                  onClick={() => setQuantity(value => Math.max(1, value - 1))}
                  className="grid h-full w-11 place-items-center text-ink/60 disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="ลดจำนวน"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-7 text-center text-[12px] font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(value => Math.min(maxQuantity, value + 1))}
                  className="grid h-full w-11 place-items-center text-ink/60 disabled:opacity-30"
                  disabled={quantity >= maxQuantity}
                  aria-label="เพิ่มจำนวน"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={soldOut}
                onClick={() => onAdd(product, variant, quantity)}
                className="flex h-[46px] flex-1 items-center justify-center gap-2 rounded-full bg-ink text-[11px] font-bold tracking-[0.02em] text-cream transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-sand-deep disabled:text-muted"
              >
                {soldOut ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
                {!soldOut && <ArrowUpRight className="h-4 w-4" />}
              </button>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[9px] text-muted">
              <Check className="h-3 w-3 text-sage" /> จัดส่งภายใน 1–2 วันทำการ · เปลี่ยนคืนได้ภายใน 7 วัน
            </p>

            <div className="mt-6 divide-y divide-line/70 border-y border-line/70">
              <details className="group py-4" open>
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold">
                  เรื่องราวของสินค้า
                  <ChevronDown className="h-3.5 w-3.5 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[11px] leading-[1.85] text-ink/65">{product.story}</p>
              </details>

              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold">
                  รีวิวจากลูกค้า ({product.reviews.length})
                  <ChevronDown className="h-3.5 w-3.5 text-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-3">
                  {product.reviews.length === 0 && (
                    <p className="text-[10px] text-muted">ยังไม่มีรีวิวสำหรับสินค้าชิ้นนี้</p>
                  )}
                  {product.reviews.map(review => (
                    <div key={review.id} className="rounded-2xl bg-sand/35 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold">{review.userName}</p>
                        <span className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={cx(
                                'h-2.5 w-2.5',
                                star <= review.rating
                                  ? 'fill-amber text-amber'
                                  : 'fill-transparent text-line'
                              )}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[10px] leading-relaxed text-ink/70">
                        {review.comment}
                      </p>
                      <p className="mt-1.5 text-[8px] text-muted">{formatDate(review.date)}</p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
