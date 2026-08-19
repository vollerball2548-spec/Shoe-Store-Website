import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Minus, 
  Plus, 
  Heart, 
  Sparkles, 
  Check, 
  MessageSquare,
  Flame
} from 'lucide-react';
import { ShoeProduct, ProductReview } from '../types';

interface ProductDetailModalProps {
  product: ShoeProduct | null;
  onClose: () => void;
  onAddToCart: (product: ShoeProduct, size: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return product.sizes.find(s => s.stock > 0)?.size || product.sizes[0]?.size || 'US 9';
  });
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>(product.reviews || []);

  const currentSizeStock = product.sizes.find(s => s.size === selectedSize)?.stock || 0;
  const isSizeOutOfStock = currentSizeStock <= 0;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      userName: 'ผู้ใช้ที่ตรวจสอบแล้ว (Verified Buyer)',
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toISOString().slice(0, 10)
    };

    setLocalReviews([newRev, ...localReviews]);
    setNewReviewComment('');
  };

  const handleAddToCart = () => {
    if (isSizeOutOfStock) return;
    onAddToCart(product, selectedSize, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="product-detail-modal"
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-950/60 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-700"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Gallery */}
          <div className="p-6 bg-gradient-to-b from-zinc-800/30 to-zinc-900 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
            <div>
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-950/50 border border-zinc-800 shadow-inner group">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />

                {product.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-black bg-sky-400 text-zinc-950 shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-sky-500 scale-105 shadow-md shadow-sky-500/20'
                          : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Badges / Guarantees */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400">
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-zinc-950/40">
                <ShieldCheck className="w-4 h-4 text-sky-400 mb-1" />
                <span className="font-semibold text-zinc-300">ของแท้ 100%</span>
                <span className="text-[10px] text-zinc-500">การันตีคืนเงิน 2 เท่า</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-zinc-950/40">
                <Truck className="w-4 h-4 text-sky-400 mb-1" />
                <span className="font-semibold text-zinc-300">ส่งด่วนฟรี</span>
                <span className="text-[10px] text-zinc-500">Kerry / Flash 1-2 วัน</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-zinc-950/40">
                <RotateCcw className="w-4 h-4 text-sky-400 mb-1" />
                <span className="font-semibold text-zinc-300">เปลี่ยนไซส์ได้</span>
                <span className="text-[10px] text-zinc-500">ภายใน 7 วันทำการ</span>
              </div>
            </div>
          </div>

          {/* Right: Content & Controls */}
          <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
            <div>
              {/* Brand & Category */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-sky-400 tracking-wider uppercase">
                  {product.brand} • {product.category}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  SKU: {product.sku}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {product.name}
              </h1>

              {/* Colorway & Ratings */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-md">
                  🎨 {product.colorway}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-white ml-1">{product.rating}</span>
                  <span className="text-zinc-400">({localReviews.length} รีวิว)</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block mb-0.5">ราคาพิเศษ (Special Price)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      ฿{product.price.toLocaleString('th-TH')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-zinc-500 line-through">
                        ฿{product.originalPrice.toLocaleString('th-TH')}
                      </span>
                    )}
                  </div>
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-500/20 text-sky-400 border border-sky-500/30">
                    ลด {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Tabs: Details vs Reviews */}
              <div className="flex border-b border-zinc-800 mt-6 gap-6 text-xs font-bold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 border-b-2 transition-all ${
                    activeTab === 'details'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ข้อมูลสินค้า & สต็อก
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>รีวิวจากลูกค้า ({localReviews.length})</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'details' ? (
                <div className="mt-4 space-y-4">
                  {/* Size Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                        เลือกขนาดไซส์ (Select Size - US Men/Unisex)
                      </label>
                      <span className={`text-xs font-semibold ${isSizeOutOfStock ? 'text-rose-400' : 'text-sky-400'}`}>
                        {isSizeOutOfStock ? '❌ ขนาดนี้หมด' : `✔️ มีสต็อกพร้อมส่ง ${currentSizeStock} คู่`}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map((s) => {
                        const isSelected = selectedSize === s.size;
                        const isOutOfStock = s.stock <= 0;
                        return (
                          <button
                            key={s.size}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => {
                              setSelectedSize(s.size);
                              setQuantity(1);
                            }}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center relative ${
                              isOutOfStock
                                ? 'bg-zinc-950/40 border-zinc-800/40 text-zinc-600 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md font-extrabold'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            <span>{s.size}</span>
                            <span className={`text-[9px] mt-0.5 font-normal ${
                              isSelected ? 'text-blue-100 font-semibold' : 'text-zinc-500'
                            }`}>
                              {isOutOfStock ? 'หมด' : `${s.stock} คู่`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-2">
                      จำนวน (Quantity)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                        <button
                          type="button"
                          disabled={quantity <= 1 || isSizeOutOfStock}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= currentSizeStock || isSizeOutOfStock}
                          onClick={() => setQuantity(Math.min(currentSizeStock, quantity + 1))}
                          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-zinc-400">
                        (สูงสุด {currentSizeStock} คู่ตามสต็อก)
                      </span>
                    </div>
                  </div>

                  {/* Description & Story */}
                  <div className="pt-2 text-xs text-zinc-300 space-y-2 leading-relaxed">
                    <p>{product.description}</p>
                    {product.story && (
                      <p className="text-zinc-400 italic bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/60">
                        "{product.story}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Reviews Tab */
                <div className="mt-4 space-y-4">
                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-xs font-bold text-zinc-200 block mb-2">
                      เขียนรีวิวรองเท้ารุ่นนี้
                    </span>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="text-amber-400 p-0.5"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= newReviewRating ? 'fill-amber-400' : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="เล่าความรู้สึก ความกระชับ หรือความสวยงามของรองเท้าคู่นี้..."
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newReviewComment.trim()}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-40"
                      >
                        ส่งรีวิว
                      </button>
                    </div>
                  </form>

                  {/* Review List */}
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {localReviews.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-zinc-200">{r.userName}</span>
                          <span className="text-[10px] text-zinc-500">{r.date}</span>
                        </div>
                        <div className="flex text-amber-400 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400' : 'text-zinc-700'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-300">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center gap-3">
              <button
                id="btn-add-to-cart-modal"
                disabled={isSizeOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-extrabold text-sm shadow-xl transition-all ${
                  isSizeOutOfStock
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-[0.98]'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {isSizeOutOfStock
                    ? 'ไซส์นี้สินค้าหมด'
                    : `ใส่ตะกร้า (฿${(product.price * quantity).toLocaleString('th-TH')})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
