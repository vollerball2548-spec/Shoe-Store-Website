import { OrderStatus, ProductCategory } from '../types';

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function formatPrice(value: number): string {
  return `฿${Math.round(value).toLocaleString('th-TH')}`;
}

export function formatDate(value: string, withTime = false): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export const CATEGORY_META: Record<
  ProductCategory,
  { label: string; en: string; blurb: string; accent: string }
> = {
  Sneakers: {
    label: 'สนีกเกอร์',
    en: 'Sneakers',
    blurb: 'คู่โปรดที่เดินได้ทุกวัน',
    accent: '#e7ddcb'
  },
  Apparel: {
    label: 'เสื้อผ้า',
    en: 'Apparel',
    blurb: 'เสื้อผ้าที่ใส่จริงได้บ่อย',
    accent: '#e4d9cc'
  },
  Bags: {
    label: 'กระเป๋า',
    en: 'Bags',
    blurb: 'พกของจำเป็นอย่างมีสไตล์',
    accent: '#dde2d4'
  },
  Accessories: {
    label: 'แอกเซสซอรี',
    en: 'Accessories',
    blurb: 'รายละเอียดเล็ก ๆ ที่ทำให้ต่าง',
    accent: '#ead9c8'
  },
  Tech: {
    label: 'แกดเจ็ต',
    en: 'Tech',
    blurb: 'เทคโนโลยีที่ใช้ทุกวัน',
    accent: '#dce2e0'
  },
  Home: {
    label: 'ของแต่งบ้าน',
    en: 'Home',
    blurb: 'มุมเล็ก ๆ ที่น่าอยู่ขึ้น',
    accent: '#e9e0cd'
  }
};

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: string; dot: string }
> = {
  PENDING: {
    label: 'รอดำเนินการ',
    tone: 'bg-amber/15 text-[#8a6a17] border-amber/30',
    dot: 'bg-amber'
  },
  PROCESSING: {
    label: 'กำลังเตรียมสินค้า',
    tone: 'bg-clay-soft/60 text-clay border-clay/25',
    dot: 'bg-clay'
  },
  SHIPPED: {
    label: 'จัดส่งแล้ว',
    tone: 'bg-[#dce5ee] text-[#3d5a73] border-[#b9cddd]',
    dot: 'bg-[#5f83a1]'
  },
  DELIVERED: {
    label: 'สำเร็จ',
    tone: 'bg-sage-soft/70 text-[#4f5c43] border-sage/40',
    dot: 'bg-sage'
  },
  CANCELLED: {
    label: 'ยกเลิก',
    tone: 'bg-[#efe6e2] text-[#8f5a4c] border-[#ddc8c1]',
    dot: 'bg-[#a76a5a]'
  }
};

export const PAYMENT_LABELS: Record<string, string> = {
  PromptPay: 'โอนผ่านธนาคาร',
  CreditCard: 'บัตรเครดิต',
  COD: 'เก็บเงินปลายทาง'
};

export const COUPON_VALUES: Record<string, number> = {
  MIX300: 300,
  MIX500: 500,
  MIX800: 800,
  MIX1000: 1000
};

export function discountForCoupon(code: string | undefined, subtotal: number): number {
  if (!code) return 0;
  const normalized = code.trim().toUpperCase();
  if (normalized === 'MIX10') return Math.round(subtotal * 0.1);
  return Math.min(subtotal, COUPON_VALUES[normalized] || 0);
}

export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_FEE = 80;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function lineCount(text: string): number {
  return text.split('\n').length;
}
