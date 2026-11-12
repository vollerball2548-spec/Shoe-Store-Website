import { Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { CATEGORY_META, cx, formatPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  className?: string;
}

const BADGE_TONE: Record<string, string> = {
  NEW: 'bg-ink text-cream',
  BESTSELLER: 'bg-cream/95 text-ink',
  HOT: 'bg-clay text-white',
  LIMITED: 'bg-amber text-ink',
  SALE: 'bg-clay text-white'
};

export function ProductCard({ product, onView, onQuickAdd, className }: ProductCardProps) {
  const soldOut = product.totalStock <= 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <article className={cx('group flex flex-col', className)}>
      <div className="relative overflow-hidden rounded-[22px] bg-sand/55 shadow-[0_1px_0_rgba(23,21,18,0.04)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_34px_rgba(23,21,18,0.11)]">
        <button
          type="button"
          onClick={() => onView(product)}
          className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-clay"
          aria-label={`ดูรายละเอียด ${product.name}`}
        >
          <div className="aspect-[4/5] w-full overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className={cx(
                'h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]',
                soldOut && 'opacity-55 grayscale'
              )}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </button>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badge && (
            <span
              className={cx(
                'rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] shadow-sm',
                BADGE_TONE[product.badge] || 'bg-cream text-ink'
              )}
            >
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-ink/85 px-2 py-1 text-[8px] font-bold tracking-[0.08em] text-cream backdrop-blur">
              -{discount}%
            </span>
          )}
        </div>

        {!soldOut ? (
          <button
            type="button"
            onClick={() => onQuickAdd(product)}
            className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-1 place-items-center rounded-full bg-cream/95 text-ink opacity-100 shadow-[0_8px_24px_rgba(23,21,18,0.18)] backdrop-blur transition-all duration-300 hover:bg-ink hover:text-cream sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
            title="เพิ่มลงตะกร้า"
          >
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-cream backdrop-blur">
            สินค้าหมด
          </span>
        )}

        <span className="absolute bottom-3 left-3 rounded-full bg-cream/80 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.13em] text-ink/70 backdrop-blur">
          {CATEGORY_META[product.category].en}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            {product.brand}
          </p>
          <span className="flex items-center gap-1 text-[9px] font-semibold text-muted">
            <span className="text-amber">★</span>
            {product.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onView(product)}
          className="mt-1.5 line-clamp-2 text-left text-[13px] font-semibold leading-snug tracking-[-0.01em] transition-colors hover:text-clay"
        >
          {product.name}
        </button>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-[13px] font-bold">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[10px] text-muted line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-[22px] bg-sand/70" />
      <div className="mt-4 h-2 w-16 rounded bg-sand-deep/60" />
      <div className="mt-2 h-3 w-4/5 rounded bg-sand-deep/50" />
      <div className="mt-2 h-3 w-1/3 rounded bg-sand-deep/40" />
    </div>
  );
}

export function EmptyProducts({ onReset }: { onReset: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-[28px] border border-dashed border-line bg-cream-soft/50 px-6 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-sand text-ink/60">
        <ShoppingBag className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-bold tracking-[-0.02em]">ยังไม่พบสินค้าที่ตรงเงื่อนไข</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
        ลองปรับหมวดหมู่ ช่วงราคา หรือคำค้นหาใหม่อีกครั้ง เราคัดของดีไว้ให้เลือกหลายแบบเลย
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[11px] font-semibold text-cream transition-transform hover:scale-[1.02]"
      >
        ล้างตัวกรองทั้งหมด
      </button>
    </div>
  );
}
