import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onUpdateSize: (cartItemId: string, newSize: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedCheckout: (couponCode?: string, discountAmount?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onUpdateSize,
  onRemoveItem,
  onProceedCheckout
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Coupon Logic
  let discountAmount = 0;
  if (appliedCoupon === 'WELCOME10') {
    discountAmount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'KICKS2026' || appliedCoupon === 'SUMMER2026') {
    discountAmount = Math.min(subtotal, 500);
  } else if (appliedCoupon === 'FREESHIP') {
    discountAmount = 0; // Handled in shipping fee
  }

  const shippingFee = subtotal === 0 ? 0 : (appliedCoupon === 'FREESHIP' || subtotal >= 3000 ? 0 : 100);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (code === 'WELCOME10' || code === 'KICKS2026' || code === 'SUMMER2026' || code === 'FREESHIP') {
      setAppliedCoupon(code);
      setCouponInput('');
    } else {
      setCouponError('โค้ดไม่ถูกต้อง (ลองใช้ WELCOME10, KICKS2026, FREESHIP)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-zinc-100 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              <h2 className="font-extrabold text-base text-white">
                ตะกร้าสินค้า ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-white text-base">ตะกร้าของคุณยังว่างอยู่</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  เลือกชมรองเท้าผ้าใบระดับพรีเมียม และเพิ่มคู่โปรดลงในตะกร้าได้เลย
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
                >
                  เลือกซื้อรองเท้าเลย
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex gap-3.5 items-start group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                  />

                  {/* Info & Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                          {item.product.brand}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Size Selector in Cart */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-zinc-400">ไซส์:</span>
                      <select
                        value={item.selectedSize}
                        onChange={(e) => onUpdateSize(item.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700/80 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-zinc-200 focus:outline-none"
                      >
                        {item.product.sizes.map((s) => (
                          <option key={s.size} value={s.size} disabled={s.stock <= 0}>
                            {s.size} {s.stock <= 0 ? '(หมด)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price and Quantity row */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-black text-white">
                        ฿{(item.product.price * item.quantity).toLocaleString('th-TH')}
                      </span>

                      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 space-y-4">
              {/* Promo Code Input */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="ใส่โค้ดส่วนลด (เช่น WELCOME10)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
                  >
                    ใช้โค้ด
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg px-2.5 py-1.5 mt-2 text-xs text-sky-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>ใช้โค้ด {appliedCoupon} แล้ว</span>
                    </div>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-zinc-400 hover:text-white text-[10px] underline"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า (Subtotal)</span>
                  <span className="text-zinc-200 font-semibold">฿{subtotal.toLocaleString('th-TH')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sky-400 font-semibold">
                    <span>ส่วนลด ({appliedCoupon})</span>
                    <span>-฿{discountAmount.toLocaleString('th-TH')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-zinc-400" />
                    <span>ค่าจัดส่งด่วน</span>
                  </span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-sky-400 font-bold">ฟรี (Free)</span>
                    ) : (
                      <span className="text-zinc-200">฿{shippingFee}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                  <span>ยอดชำระสุทธิ (Total)</span>
                  <span className="text-sky-400 text-base">฿{totalAmount.toLocaleString('th-TH')}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                id="btn-proceed-checkout"
                onClick={() => onProceedCheckout(appliedCoupon || undefined, discountAmount)}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>ดำเนินการชำระเงิน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
