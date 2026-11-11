import { useEffect, useState } from 'react';
import {
  ChevronDown,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  X
} from 'lucide-react';
import { Order, OrderStatus, User } from '../types';
import { api } from '../services/api';
import {
  ORDER_STATUS_META,
  PAYMENT_LABELS,
  cx,
  formatDate,
  formatPrice
} from '../lib/utils';

interface OrderHistoryModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onLogin: () => void;
}

const STATUS_FILTERS: Array<{ value: 'ALL' | OrderStatus; label: string }> = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'PENDING', label: 'รอดำเนินการ' },
  { value: 'PROCESSING', label: 'กำลังเตรียม' },
  { value: 'SHIPPED', label: 'จัดส่งแล้ว' },
  { value: 'DELIVERED', label: 'สำเร็จ' },
  { value: 'CANCELLED', label: 'ยกเลิก' }
];

export function OrderHistoryModal({ open, user, onClose, onLogin }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดรายการคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setExpanded(null);
    setFilter('ALL');
    void load();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  if (!open) return null;

  const filtered = filter === 'ALL' ? orders : orders.filter(order => order.orderStatus === filter);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        aria-label="ปิดประวัติคำสั่งซื้อ"
      />
      <div className="animate-scale-in relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:max-h-[86vh] sm:rounded-[30px]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-clay">My orders</p>
            <h2 className="mt-0.5 text-lg font-extrabold tracking-[-0.025em]">คำสั่งซื้อของฉัน</h2>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => void load()}
                className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:bg-sand/60"
                aria-label="โหลดใหม่"
              >
                <RefreshCw className={cx('h-3.5 w-3.5', loading && 'animate-spin')} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:bg-sand/60"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-sand/70">
              <Package className="h-7 w-7 text-ink/45" />
            </span>
            <h3 className="mt-4 text-lg font-bold tracking-[-0.02em]">
              เข้าสู่ระบบเพื่อดูคำสั่งซื้อ
            </h3>
            <p className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-muted">
              เมื่อเข้าสู่ระบบแล้ว คุณจะติดตามสถานะการจัดส่งและดูประวัติการสั่งซื้อทั้งหมดได้ที่นี่
            </p>
            <button
              type="button"
              onClick={onLogin}
              className="mt-5 rounded-full bg-ink px-5 py-2.5 text-[11px] font-semibold text-cream"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        ) : (
          <>
            <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-line/70 px-5 py-3 sm:px-7">
              {STATUS_FILTERS.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cx(
                    'shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-semibold transition-colors',
                    filter === item.value
                      ? 'border-ink bg-ink text-cream'
                      : 'border-line bg-white/60 text-ink/65 hover:border-ink/30'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7">
              {loading && orders.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3].map(item => (
                    <div key={item} className="h-24 animate-pulse rounded-2xl bg-sand/60" />
                  ))}
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-clay/25 bg-clay-soft/35 px-3 py-2 text-[10px] text-clay">
                  {error}
                </p>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-sand/70">
                    <Package className="h-6 w-6 text-ink/40" />
                  </span>
                  <p className="mt-3 text-sm font-bold">ยังไม่มีคำสั่งซื้อในหมวดนี้</p>
                  <p className="mt-1 text-[10px] text-muted">
                    เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {filtered.map(order => {
                  const status = ORDER_STATUS_META[order.orderStatus];
                  const isOpen = expanded === order.id;
                  return (
                    <div
                      key={order.id}
                      className="overflow-hidden rounded-2xl border border-line/85 bg-cream-soft/55"
                    >
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="flex w-full items-center gap-3 p-3.5 text-left sm:p-4"
                      >
                        <div className="flex -space-x-2.5">
                          {order.items.slice(0, 3).map(item => (
                            <span
                              key={`${item.productId}-${item.selectedVariant}`}
                              className="h-11 w-11 overflow-hidden rounded-lg border-2 border-cream bg-sand"
                            >
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            </span>
                          ))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-[10px] font-bold">{order.id}</p>
                            <span
                              className={cx(
                                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold',
                                status.tone
                              )}
                            >
                              <span className={cx('h-1 w-1 rounded-full', status.dot)} />
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[10px] text-muted">
                            {order.items.length} รายการ · {order.items.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
                            · {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-extrabold tracking-[-0.02em]">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <ChevronDown
                            className={cx(
                              'ml-auto mt-1 h-3.5 w-3.5 text-muted transition-transform',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="animate-fade-up border-t border-line/70 px-3.5 pb-4 pt-3.5 sm:px-4">
                          <div className="space-y-2.5">
                            {order.items.map(item => (
                              <div
                                key={`${item.productId}-${item.selectedVariant}`}
                                className="flex items-center gap-3"
                              >
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="h-12 w-10 rounded-lg object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[10px] font-semibold">
                                    {item.productName}
                                  </p>
                                  <p className="text-[8px] text-muted">
                                    {item.selectedVariant} · จำนวน {item.quantity}
                                  </p>
                                </div>
                                <p className="text-[10px] font-bold">
                                  {formatPrice(item.unitPrice * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 grid gap-2 border-t border-line/60 pt-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-sand/35 p-2.5">
                              <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.13em] text-muted">
                                <MapPin className="h-2.5 w-2.5" /> ที่อยู่จัดส่ง
                              </p>
                              <p className="mt-1 text-[9px] leading-relaxed">
                                {order.shippingAddress.fullName} · {order.shippingAddress.phone}
                                <br />
                                {order.shippingAddress.addressLine} {order.shippingAddress.district}{' '}
                                {order.shippingAddress.province} {order.shippingAddress.postalCode}
                              </p>
                            </div>
                            <div className="rounded-xl bg-sand/35 p-2.5">
                              <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.13em] text-muted">
                                <Truck className="h-2.5 w-2.5" /> การชำระเงินและการจัดส่ง
                              </p>
                              <p className="mt-1 text-[9px] leading-relaxed">
                                {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} ·{' '}
                                {order.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'รอชำระ'}
                                <br />
                                {order.carrier || 'รอเลือกขนส่ง'}
                                {order.trackingNumber ? ` · ${order.trackingNumber}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 border-t border-line/60 pt-3">
                            <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.13em] text-muted">
                              <Clock3 className="h-2.5 w-2.5" /> ไทม์ไลน์
                            </p>
                            <div className="mt-2 space-y-2">
                              {order.statusHistory.map((entry, index) => (
                                <div key={`${entry.status}-${index}`} className="flex gap-2.5">
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                                  <div>
                                    <p className="text-[9px] font-semibold">
                                      {ORDER_STATUS_META[entry.status].label}{' '}
                                      <span className="font-normal text-muted">
                                        · {formatDate(entry.timestamp, true)}
                                      </span>
                                    </p>
                                    <p className="text-[8px] leading-relaxed text-muted">
                                      {entry.note}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-3 flex justify-between border-t border-line/60 pt-3 text-[9px]">
                            <span className="text-muted">
                              ยอดสินค้า {formatPrice(order.subtotal)}
                              {order.discount > 0 && ` · ส่วนลด ${formatPrice(order.discount)}`}
                              {` · ส่ง ${order.shippingFee === 0 ? 'ฟรี' : formatPrice(order.shippingFee)}`}
                            </span>
                            <span className="font-bold">รวม {formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
