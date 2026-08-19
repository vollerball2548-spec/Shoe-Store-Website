import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  if (!isOpen) return null;

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">รอดำเนินการ (Pending)</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">กำลังจัดเตรียม (Processing)</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">ส่งมอบขนส่งแล้ว (Shipped)</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/20 text-sky-400 border border-blue-500/30">จัดส่งสำเร็จ (Delivered)</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">ยกเลิกแล้ว (Cancelled)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="order-history-modal"
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">ประวัติคำสั่งซื้อและสถานะพัสดุ</h2>
              <p className="text-xs text-zinc-400">ติดตามสถานะออเดอร์และเลขพัสดุเรียลไทม์</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Package className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <p className="font-bold text-white text-base">ยังไม่มีประวัติคำสั่งซื้อ</p>
              <p className="text-xs text-zinc-500 mt-1">เมื่อคุณสั่งซื้อรองเท้า รายการจะปรากฏที่นี่</p>
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-zinc-950/70 border border-zinc-800 rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex -space-x-3 overflow-hidden">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image}
                            alt="shoe"
                            className="inline-block h-10 w-10 rounded-xl ring-2 ring-zinc-900 object-cover bg-zinc-800"
                          />
                        ))}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{order.id}</span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • {order.items.reduce((s, i) => s + i.quantity, 0)} คู่
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-sky-400 block">
                          ฿{order.totalAmount.toLocaleString('th-TH')}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase">{order.paymentMethod}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 space-y-4 animate-in fade-in duration-150">
                      {/* Tracking Card */}
                      {order.trackingNumber && (
                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-sky-400" />
                            <div>
                              <p className="text-xs font-bold text-white">{order.carrier || 'Kerry Express'}</p>
                              <p className="text-xs text-sky-400 font-mono font-bold mt-0.5">{order.trackingNumber}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleCopy(order.trackingNumber!, `track-${order.id}`)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                          >
                            {copiedId === `track-${order.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-sky-400" />
                                <span>คัดลอกแล้ว</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>คัดลอกเลขพัสดุ</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Status Timeline */}
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-3">
                          ไทม์ไลน์สถานะออเดอร์ (Status Flow Timeline)
                        </h4>
                        <div className="space-y-2 border-l-2 border-zinc-800 ml-3 pl-4">
                          {order.statusHistory.map((step, idx) => (
                            <div key={idx} className="relative group">
                              <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-zinc-900" />
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{step.status}</span>
                                <span className="text-[10px] text-zinc-500">
                                  {new Date(step.timestamp).toLocaleTimeString('th-TH')}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 mt-0.5">{step.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="pt-2 border-t border-zinc-800">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-2">
                          รายการสินค้าที่สั่ง
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                              <div className="flex items-center gap-3">
                                <img src={item.image} alt="shoe" className="w-12 h-12 rounded-lg object-cover bg-zinc-900" />
                                <div>
                                  <p className="text-xs font-bold text-white">{item.productName}</p>
                                  <p className="text-[11px] text-zinc-400">
                                    ไซส์: {item.selectedSize} • จำนวน: {item.quantity} คู่
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white">
                                ฿{(item.unitPrice * item.quantity).toLocaleString('th-TH')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Address & Actions */}
                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                        <div>
                          <span className="font-semibold text-zinc-300">จัดส่งที่: </span>
                          <span>{order.shippingAddress.fullName}, {order.shippingAddress.province}</span>
                        </div>

                        <button
                          onClick={() => alert(`ใบเสร็จรับเงินสำหรับคำสั่งซื้อ #${order.id}\nยอดชำระ: ฿${order.totalAmount}\nสถานะ: ${order.paymentStatus}`)}
                          className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>ดูใบเสร็จ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
