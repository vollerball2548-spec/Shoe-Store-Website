import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Banknote, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, ShippingAddress, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedCoupon?: string;
  discountAmount?: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedCoupon,
  discountAmount = 0,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: 'Somchai Prasert',
    phone: '081-234-5678',
    email: 'somchai@gmail.com',
    addressLine: '99/12 Sukhumvit Soi 21 (Asoke), Floor 15',
    district: 'Watthana',
    province: 'Bangkok',
    postalCode: '10110',
    notes: 'ฝากไว้ที่นิติบุคคลคอนโด'
  });

  const [paymentMethod, setPaymentMethod] = useState<'PromptPay' | 'CreditCard' | 'COD'>('PromptPay');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('321');

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal === 0 ? 0 : (appliedCoupon === 'FREESHIP' || subtotal >= 3000 ? 0 : 100);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleAutofillDemo = () => {
    setShippingAddress({
      fullName: 'Apinya Wongsuwan',
      phone: '089-987-6543',
      email: 'apinya.w@hotmail.com',
      addressLine: '452 Phahonyothin Rd, Samsen Nai',
      district: 'Phaya Thai',
      province: 'Bangkok',
      postalCode: '10400',
      notes: 'โทรแจ้งก่อนส่ง 15 นาที'
    });
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      const orderPayload = {
        userId: 'user-customer-1',
        customerName: shippingAddress.fullName,
        customerEmail: shippingAddress.email,
        customerPhone: shippingAddress.phone,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.product.name,
          brand: i.product.brand,
          image: i.product.images[0],
          selectedSize: i.selectedSize,
          unitPrice: i.product.price,
          quantity: i.quantity
        })),
        subtotal,
        discount: discountAmount,
        shippingFee,
        totalAmount,
        couponCode: appliedCoupon,
        paymentMethod,
        shippingAddress
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const json = await res.json();
      if (json.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        onOrderSuccess(json.data);
      }
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="checkout-modal-container"
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
              SECURE CHECKOUT
            </span>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" />
              <span>ชำระเงินและสั่งซื้อสินค้า</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-950/30 text-xs font-bold">
          <div className={`p-3 text-center border-r border-zinc-800 ${step === 1 ? 'text-sky-400 bg-blue-600/10' : 'text-zinc-500'}`}>
            1. ที่อยู่จัดส่ง
          </div>
          <div className={`p-3 text-center border-r border-zinc-800 ${step === 2 ? 'text-sky-400 bg-blue-600/10' : 'text-zinc-500'}`}>
            2. วิธีการชำระเงิน
          </div>
          <div className={`p-3 text-center ${step === 3 ? 'text-sky-400 bg-blue-600/10' : 'text-zinc-500'}`}>
            3. สรุปคำสั่งซื้อ
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Shipping Address */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  ข้อมูลผู้รับและการจัดส่ง (Shipping Information)
                </h3>
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ใส่ข้อมูลทดสอบ (Demo Autofill)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">ชื่อ-นามสกุล ผู้รับ *</label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="นาย สมชาย ใจดี"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                  <input
                    type="text"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="081-234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">อีเมลสำหรับรับใบเสร็จ (Order Receipt Email) *</label>
                <input
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="somchai@gmail.com"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">ที่อยู่จัดส่ง (บ้านเลขที่, ซอย, ถนน) *</label>
                <textarea
                  rows={2}
                  value={shippingAddress.addressLine}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="99/12 ถนนสุขุมวิท ซอย 21..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">เขต/อำเภอ</label>
                  <input
                    type="text"
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-extrabold text-white">
                เลือกช่องทางการชำระเงิน (Payment Gateway)
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PromptPay')}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                    paymentMethod === 'PromptPay'
                      ? 'bg-blue-600/20 border-sky-500 text-sky-400 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-xs">PromptPay QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CreditCard')}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                    paymentMethod === 'CreditCard'
                      ? 'bg-blue-600/20 border-sky-500 text-sky-400 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs">บัตรเครดิต / เดบิต</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                    paymentMethod === 'COD'
                      ? 'bg-blue-600/20 border-sky-500 text-sky-400 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="text-xs">เก็บเงินปลายทาง (COD)</span>
                </button>
              </div>

              {/* Payment Details Container */}
              {paymentMethod === 'PromptPay' && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center text-center">
                  <div className="bg-white p-3 rounded-2xl shadow-lg mb-3">
                    {/* Simulated PromptPay QR */}
                    <div className="w-40 h-40 bg-zinc-900 rounded-xl p-2 flex flex-col items-center justify-between border-2 border-dashed border-sky-500">
                      <div className="w-full flex justify-between items-center text-[10px] text-white font-mono">
                        <span>PROMPTPAY</span>
                        <span className="text-sky-400 font-bold">TH-QR</span>
                      </div>
                      <QrCode className="w-24 h-24 text-sky-400" />
                      <span className="text-[10px] text-zinc-400 font-mono">REF: KICKS-{Date.now().toString().slice(-6)}</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white">สแกนชำระผ่าน Mobile Banking ทุกธนาคาร</p>
                  <p className="text-sm font-black text-sky-400 mt-1">
                    ยอดชำระ: ฿{totalAmount.toLocaleString('th-TH')}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    (ระบบจะตรวจจับการชำระเงินอัตโนมัติด้วย BullMQ Background Webhook)
                  </p>
                </div>
              )}

              {paymentMethod === 'CreditCard' && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">หมายเลขบัตร (Card Number)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">วันหมดอายุ (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
                  <Banknote className="w-10 h-10 text-sky-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">ชำระเงินสดกับพนักงานส่งสินค้าเมื่อได้รับพัสดุ</p>
                  <p className="text-xs text-zinc-400 mt-1">เตรียมเงินสดจำนวน ฿{totalAmount.toLocaleString('th-TH')}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Order Review */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-extrabold text-white">
                ตรวจสอบความถูกต้องก่อนยืนยันคำสั่งซื้อ
              </h3>

              {/* Items List */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.product.images[0]} alt="shoe" className="w-12 h-12 rounded-lg object-cover bg-zinc-900" />
                      <div>
                        <p className="text-xs font-bold text-white">{item.product.name}</p>
                        <p className="text-[11px] text-zinc-400">ไซส์: {item.selectedSize} • จำนวน: {item.quantity} คู่</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-white">
                      ฿{(item.product.price * item.quantity).toLocaleString('th-TH')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping & Payment Summary Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="font-bold text-zinc-300 block mb-1">📍 จัดส่งไปที่:</span>
                  <p className="text-white font-medium">{shippingAddress.fullName} ({shippingAddress.phone})</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{shippingAddress.addressLine}, {shippingAddress.district}, {shippingAddress.province} {shippingAddress.postalCode}</p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="font-bold text-zinc-300 block mb-1">💳 การชำระเงิน:</span>
                  <p className="text-white font-medium">{paymentMethod}</p>
                  <p className="text-sky-400 text-[11px] mt-0.5">รวมทั้งสิ้น: ฿{totalAmount.toLocaleString('th-TH')}</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span className="text-white">฿{subtotal.toLocaleString('th-TH')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sky-400">
                    <span>ส่วนลด ({appliedCoupon})</span>
                    <span>-฿{discountAmount.toLocaleString('th-TH')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ค่าจัดส่งด่วน (Kerry Express)</span>
                  <span className="text-white">{shippingFee === 0 ? 'ฟรี (0฿)' : `฿${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-sky-400 text-base">฿{totalAmount.toLocaleString('th-TH')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
            >
              ยกเลิก
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>ขั้นตอนถัดไป</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังประมวลผลคำสั่งซื้อ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันคำสั่งซื้อ (฿{totalAmount.toLocaleString('th-TH')})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
