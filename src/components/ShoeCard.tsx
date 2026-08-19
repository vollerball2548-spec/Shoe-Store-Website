import React from 'react';
import { Star, ShoppingBag, Eye, Zap } from 'lucide-react';
import { ShoeProduct } from '../types';

interface ShoeCardProps {
  product: ShoeProduct;
  onSelect: (product: ShoeProduct) => void;
  onQuickAdd: (product: ShoeProduct, size: string) => void;
}

export const ShoeCard: React.FC<ShoeCardProps> = ({ product, onSelect, onQuickAdd }) => {
  const isOutOfStock = product.totalStock <= 0;
  const isLowStock = product.totalStock > 0 && product.totalStock < 10;
  const firstAvailableSize = product.sizes.find(s => s.stock > 0)?.size || product.sizes[0]?.size || 'US 9';

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-zinc-900/80 border border-zinc-800/80 hover:border-sky-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-sky-950/30 flex flex-col"
    >
      {/* Product Image Container */}
      <div 
        onClick={() => onSelect(product)}
        className="relative aspect-[4/3] bg-gradient-to-b from-zinc-800/40 to-zinc-900 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase backdrop-blur-md shadow-md ${
              product.badge === 'HOT'
                ? 'bg-rose-500/90 text-white'
                : product.badge === 'NEW'
                ? 'bg-sky-400 text-zinc-950 font-black'
                : product.badge === 'BESTSELLER'
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-indigo-600/90 text-white'
            }`}>
              {product.badge}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-950/80 text-zinc-300 backdrop-blur-md border border-zinc-800">
            {product.category}
          </span>
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2.5 rounded-xl bg-zinc-900/90 text-white hover:bg-blue-600 hover:text-white backdrop-blur-md shadow-lg transition-all transform translate-y-2 group-hover:translate-y-0"
            title="ดูรายละเอียดสินค้า"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Badge on image */}
        {isOutOfStock ? (
          <div className="absolute bottom-3 right-3 bg-rose-950/90 border border-rose-600/50 text-rose-300 text-[10px] font-bold px-2 py-1 rounded-lg">
            สินค้าหมด
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-3 right-3 bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>เหลือ {product.totalStock} คู่</span>
          </div>
        ) : null}
      </div>

      {/* Card Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-sky-400 tracking-wide uppercase">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-zinc-200">{product.rating}</span>
              <span className="text-[11px] text-zinc-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(product)}
            className="text-sm font-bold text-zinc-100 line-clamp-2 hover:text-sky-400 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          <p className="text-xs text-zinc-400 mt-1 truncate">
            {product.colorway}
          </p>

          {/* Size Pills Preview */}
          <div className="mt-3 flex flex-wrap gap-1">
            {product.sizes.slice(0, 5).map((s) => (
              <span
                key={s.size}
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  s.stock > 0
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700/50'
                    : 'bg-zinc-900/50 text-zinc-600 line-through'
                }`}
              >
                {s.size.replace('US ', '')}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-[10px] px-1 py-0.5 text-zinc-500 font-medium">
                +{product.sizes.length - 5}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-white">
                ฿{product.price.toLocaleString('th-TH')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-500 line-through">
                  ฿{product.originalPrice.toLocaleString('th-TH')}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-sky-400 font-semibold">
                ประหยัด ฿{(product.originalPrice - product.price).toLocaleString('th-TH')}
              </span>
            )}
          </div>

          <button
            onClick={() => onQuickAdd(product, firstAvailableSize)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isOutOfStock
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-600/30 active:scale-95'
            }`}
            title="เพิ่มลงตะกร้า"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'หมด' : 'ใส่ตะกร้า'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
