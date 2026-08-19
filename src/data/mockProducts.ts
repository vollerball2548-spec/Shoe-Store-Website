import { ShoeProduct } from '../types';

export const INITIAL_PRODUCTS: ShoeProduct[] = [
  {
    id: 'shoe-1',
    name: 'Air Jordan 1 Retro High OG "Chicago Lost & Found"',
    brand: 'Jordan',
    category: 'Retro',
    price: 7200,
    originalPrice: 7900,
    description: 'The iconic Chicago colorway reborn with vintage aged aesthetics, cracked leather accents, and classic Nike Air cushioning.',
    story: 'Inspired by mom-and-pop shops of the 1980s, the Air Jordan 1 Lost & Found pays homage to the original 1985 release box and heritage basketball roots.',
    sku: 'DZ5485-612',
    colorway: 'Varsity Red / Black / Sail / Muslin',
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 7.5', stock: 3 },
      { size: 'US 8', stock: 5 },
      { size: 'US 8.5', stock: 4 },
      { size: 'US 9', stock: 6 },
      { size: 'US 9.5', stock: 2 },
      { size: 'US 10', stock: 5 },
      { size: 'US 10.5', stock: 1 },
      { size: 'US 11', stock: 0 }
    ],
    totalStock: 26,
    rating: 4.9,
    reviewCount: 148,
    reviews: [
      { id: 'r1', userName: 'Nutthaphon K.', rating: 5, comment: 'งานหนังแท้สวยงามมาก หนังแตกแบบวินเทจสวยสุดๆ', date: '2026-08-10' },
      { id: 'r2', userName: 'Sarawut M.', rating: 5, comment: 'ใส่ตรงไซส์ กระชับเท้า สวยระดับตำนาน', date: '2026-08-04' }
    ],
    badge: 'HOT',
    gender: 'Unisex',
    isFeatured: true,
    createdAt: '2026-07-01'
  },
  {
    id: 'shoe-2',
    name: 'Nike Dunk Low "Panda Retro"',
    brand: 'Nike',
    category: 'Lifestyle',
    price: 3700,
    originalPrice: 4200,
    description: 'Crisp black and white leather color blocking that effortlessly pairs with every streetwear outfit.',
    story: 'Created for the hardwood but taken to the streets, the Nike Dunk Low icon returns with crisp overlays and original team colors.',
    sku: 'DD1391-100',
    colorway: 'White / Black',
    images: [
      'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 7', stock: 8 },
      { size: 'US 7.5', stock: 6 },
      { size: 'US 8', stock: 12 },
      { size: 'US 8.5', stock: 9 },
      { size: 'US 9', stock: 15 },
      { size: 'US 9.5', stock: 7 },
      { size: 'US 10', stock: 10 },
      { size: 'US 10.5', stock: 4 }
    ],
    totalStock: 71,
    rating: 4.8,
    reviewCount: 320,
    reviews: [
      { id: 'r3', userName: 'Thanawat P.', rating: 5, comment: 'ใส่ง่าย เข้ากับทุกชุด คุ้มค่ามาก', date: '2026-08-12' }
    ],
    badge: 'BESTSELLER',
    gender: 'Unisex',
    isFeatured: true,
    createdAt: '2026-07-05'
  },
  {
    id: 'shoe-3',
    name: 'New Balance 9060 "Rain Cloud Grey"',
    brand: 'New Balance',
    category: 'Lifestyle',
    price: 6500,
    originalPrice: 6900,
    description: 'Futuristic Y2K aesthetic fused with premium pigskin suede, mesh panels, and ABZORB dual-density midsole cushioning.',
    story: 'The 9060 reinterprets familiar elements from the classic 99X series with a warped sensibility inspired by the tech aesthetic of the Y2K era.',
    sku: 'U9060ECA',
    colorway: 'Rain Cloud / Castlerock / White',
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 8', stock: 4 },
      { size: 'US 8.5', stock: 5 },
      { size: 'US 9', stock: 7 },
      { size: 'US 9.5', stock: 3 },
      { size: 'US 10', stock: 2 },
      { size: 'US 10.5', stock: 0 }
    ],
    totalStock: 21,
    rating: 4.9,
    reviewCount: 89,
    reviews: [
      { id: 'r4', userName: 'Kittisak S.', rating: 5, comment: 'นุ่มเท้ามาก เดินทั้งวันไม่ปวดเท้าเลย ดีไซน์ล้ำ', date: '2026-08-15' }
    ],
    badge: 'NEW',
    gender: 'Unisex',
    isFeatured: true,
    createdAt: '2026-07-15'
  },
  {
    id: 'shoe-4',
    name: 'Adidas Originals Samba OG "Cloud White"',
    brand: 'Adidas',
    category: 'Lifestyle',
    price: 3800,
    description: 'Timeless indoor soccer heritage featuring soft full-grain leather, suede T-toe overlay, and gum rubber outsole.',
    story: 'Born on the pitch in 1950, the Samba is a timeless icon of street style embraced by subcultures across the globe.',
    sku: 'B75806',
    colorway: 'Cloud White / Core Black / Clear Granite',
    images: [
      'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 6.5', stock: 3 },
      { size: 'US 7', stock: 4 },
      { size: 'US 7.5', stock: 6 },
      { size: 'US 8', stock: 8 },
      { size: 'US 8.5', stock: 5 },
      { size: 'US 9', stock: 9 },
      { size: 'US 9.5', stock: 2 }
    ],
    totalStock: 37,
    rating: 4.7,
    reviewCount: 210,
    reviews: [
      { id: 'r5', userName: 'Ploy P.', rating: 5, comment: 'ทรงสวย แมตช์กับกางเกงยีนส์ขากระบอกสวยมาก', date: '2026-08-01' }
    ],
    badge: 'BESTSELLER',
    gender: 'Unisex',
    isFeatured: true,
    createdAt: '2026-06-20'
  },
  {
    id: 'shoe-5',
    name: 'Asics Gel-Kayano 14 "Metallic Silver / Cream"',
    brand: 'Asics',
    category: 'Running',
    price: 5900,
    originalPrice: 6500,
    description: 'Late 2000s technical runner design with metallic leather overlays and signature GEL technology shock absorption.',
    story: 'Resurfacing its classic running shoe aesthetic, the GEL-KAYANO 14 conveys a new perception of the retro running shape with modern GEL cushioning.',
    sku: '1201A019-108',
    colorway: 'Cream / Pure Silver',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 8', stock: 2 },
      { size: 'US 8.5', stock: 3 },
      { size: 'US 9', stock: 4 },
      { size: 'US 9.5', stock: 1 },
      { size: 'US 10', stock: 3 }
    ],
    totalStock: 13,
    rating: 4.9,
    reviewCount: 76,
    reviews: [
      { id: 'r6', userName: 'Chonlatis T.', rating: 5, comment: 'สไตล์ Y2K สวยจับใจ รองรับแรงกระแทกดีมาก', date: '2026-08-16' }
    ],
    badge: 'HOT',
    gender: 'Unisex',
    isFeatured: true,
    createdAt: '2026-07-28'
  },
  {
    id: 'shoe-6',
    name: 'Nike Air Max 95 OG "Neon Green"',
    brand: 'Nike',
    category: 'Lifestyle',
    price: 6800,
    originalPrice: 7200,
    description: 'Sergio Lozano\'s human anatomy-inspired silhouette featuring layered gradient suede and visible forefoot Air units.',
    story: 'Taking inspiration from the human spine, ribs, and muscle fibers, the Air Max 95 challenged footwear conventions with bold neon accents.',
    sku: 'CT1689-001',
    colorway: 'Black / Neon Yellow / Medium Ash',
    images: [
      'https://images.unsplash.com/photo-1514989940743-460b1d604475?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 8', stock: 4 },
      { size: 'US 8.5', stock: 2 },
      { size: 'US 9', stock: 3 },
      { size: 'US 9.5', stock: 5 },
      { size: 'US 10', stock: 2 },
      { size: 'US 11', stock: 1 }
    ],
    totalStock: 17,
    rating: 4.8,
    reviewCount: 94,
    reviews: [
      { id: 'r7', userName: 'Wichai R.', rating: 5, comment: 'คลาสสิกตลอดกาล สี Neon สดมาก', date: '2026-07-30' }
    ],
    badge: 'LIMITED',
    gender: 'Men',
    isFeatured: false,
    createdAt: '2026-06-15'
  },
  {
    id: 'shoe-7',
    name: 'Puma Palermo Special "Cobalt Glaze / Clementine"',
    brand: 'Puma',
    category: 'Lifestyle',
    price: 3400,
    description: 'Terrace culture staple with premium suede upper, signature formstrip, and vintage gold foil branding.',
    story: 'Straight from the Puma archives, the Palermo pays homage to coastal Italian football terrace roots of the 1980s.',
    sku: '397549-01',
    colorway: 'Cobalt Glaze / Clementine / Gum',
    images: [
      'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 7', stock: 5 },
      { size: 'US 7.5', stock: 4 },
      { size: 'US 8', stock: 6 },
      { size: 'US 8.5', stock: 7 },
      { size: 'US 9', stock: 4 },
      { size: 'US 9.5', stock: 3 }
    ],
    totalStock: 29,
    rating: 4.6,
    reviewCount: 42,
    reviews: [
      { id: 'r8', userName: 'Anuwat B.', rating: 5, comment: 'สีสดใสใส่กับกางเกงขาสั้นเท่มาก หนังกลับคุณภาพดี', date: '2026-08-08' }
    ],
    badge: 'NEW',
    gender: 'Unisex',
    isFeatured: false,
    createdAt: '2026-08-05'
  },
  {
    id: 'shoe-8',
    name: 'Nike SB Dunk Low Pro "Orange Label White Navy"',
    brand: 'Nike',
    category: 'Skateboarding',
    price: 4500,
    originalPrice: 4900,
    description: 'Skater-engineered performance with padded mesh tongue, Zoom Air insole unit, and durable tumbled leather.',
    story: 'Part of the exclusive Orange Label series dedicated to core skate shops with premium materials and skate-ready durability.',
    sku: 'CD2563-100',
    colorway: 'White / Navy / Safety Orange',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
    ],
    sizes: [
      { size: 'US 8', stock: 3 },
      { size: 'US 8.5', stock: 2 },
      { size: 'US 9', stock: 4 },
      { size: 'US 9.5', stock: 1 },
      { size: 'US 10', stock: 0 }
    ],
    totalStock: 10,
    rating: 4.9,
    reviewCount: 65,
    reviews: [
      { id: 'r9', userName: 'Peerapol J.', rating: 5, comment: 'ลิ้นหนานุ่ม ซับแรงกระแทกเวลาเล่นบอร์ดดีมาก', date: '2026-08-11' }
    ],
    badge: 'LIMITED',
    gender: 'Unisex',
    isFeatured: false,
    createdAt: '2026-07-20'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-20260818-001',
    userId: 'user-customer-1',
    customerName: 'Somchai Prasert',
    customerEmail: 'somchai@gmail.com',
    customerPhone: '081-234-5678',
    items: [
      {
        productId: 'shoe-1',
        productName: 'Air Jordan 1 Retro High OG "Chicago Lost & Found"',
        brand: 'Jordan' as const,
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
        selectedSize: 'US 9',
        unitPrice: 7200,
        quantity: 1
      }
    ],
    subtotal: 7200,
    discount: 720,
    shippingFee: 0,
    totalAmount: 6480,
    couponCode: 'WELCOME10',
    paymentMethod: 'PromptPay' as const,
    paymentStatus: 'PAID' as const,
    orderStatus: 'SHIPPED' as const,
    shippingAddress: {
      fullName: 'Somchai Prasert',
      phone: '081-234-5678',
      email: 'somchai@gmail.com',
      addressLine: '99/12 Sukhumvit Soi 21 (Asoke)',
      district: 'Watthana',
      province: 'Bangkok',
      postalCode: '10110',
      notes: 'ฝากไว้ที่นิติบุคคลคอนโด'
    },
    trackingNumber: 'TH-KEX-88921049',
    carrier: 'Kerry Express Thailand',
    createdAt: '2026-08-18T10:30:00.000Z',
    updatedAt: '2026-08-18T14:15:00.000Z',
    statusHistory: [
      { status: 'PENDING' as const, timestamp: '2026-08-18T10:30:00.000Z', note: 'Order created via PromptPay' },
      { status: 'PROCESSING' as const, timestamp: '2026-08-18T10:32:00.000Z', note: 'Payment verified, queued in BullMQ worker' },
      { status: 'SHIPPED' as const, timestamp: '2026-08-18T14:15:00.000Z', note: 'Handed over to Kerry Express (Tracking: TH-KEX-88921049)' }
    ]
  },
  {
    id: 'ORD-20260819-002',
    userId: 'user-customer-2',
    customerName: 'Apinya Wongsuwan',
    customerEmail: 'apinya.w@hotmail.com',
    customerPhone: '089-987-6543',
    items: [
      {
        productId: 'shoe-4',
        productName: 'Adidas Originals Samba OG "Cloud White"',
        brand: 'Adidas' as const,
        image: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80',
        selectedSize: 'US 7.5',
        unitPrice: 3800,
        quantity: 1
      },
      {
        productId: 'shoe-2',
        productName: 'Nike Dunk Low "Panda Retro"',
        brand: 'Nike' as const,
        image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=800&q=80',
        selectedSize: 'US 8',
        unitPrice: 3700,
        quantity: 1
      }
    ],
    subtotal: 7500,
    discount: 500,
    shippingFee: 0,
    totalAmount: 7000,
    couponCode: 'MOBY2026',
    paymentMethod: 'CreditCard' as const,
    paymentStatus: 'PAID' as const,
    orderStatus: 'PROCESSING' as const,
    shippingAddress: {
      fullName: 'Apinya Wongsuwan',
      phone: '089-987-6543',
      email: 'apinya.w@hotmail.com',
      addressLine: '452 Phahonyothin Rd, Samsen Nai',
      district: 'Phaya Thai',
      province: 'Bangkok',
      postalCode: '10400'
    },
    trackingNumber: 'TH-FLASH-992810',
    carrier: 'Flash Express',
    createdAt: '2026-08-19T08:20:00.000Z',
    updatedAt: '2026-08-19T08:25:00.000Z',
    statusHistory: [
      { status: 'PENDING' as const, timestamp: '2026-08-19T08:20:00.000Z', note: 'Order placed by customer' },
      { status: 'PROCESSING' as const, timestamp: '2026-08-19T08:25:00.000Z', note: 'Warehouse picking & packing items' }
    ]
  }
];

export const INITIAL_JOBS = [
  {
    id: 'job-101',
    queueName: 'order-processing' as const,
    jobName: 'process-new-order',
    data: { orderId: 'ORD-20260818-001', customer: 'Somchai Prasert', amount: 6480 },
    status: 'completed' as const,
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[BullMQ:Worker] Job #job-101 picked up by worker pid:4201',
      '[OrderService] Validated stock allocation for 1 items',
      '[StockService] Decremented size US 9 stock from 7 -> 6',
      '[PaymentGateway] Confirmed PromptPay transaction ref: PP-99201',
      '[BullMQ:Worker] Completed job in 342ms'
    ],
    createdAt: '2026-08-18T10:30:05.000Z',
    finishedAt: '2026-08-18T10:30:06.000Z'
  },
  {
    id: 'job-102',
    queueName: 'email-notification' as const,
    jobName: 'send-order-confirmation-email',
    data: { orderId: 'ORD-20260818-001', recipient: 'somchai@gmail.com', template: 'order-receipt-th' },
    status: 'completed' as const,
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[BullMQ:EmailWorker] Generating HTML receipt for ORD-20260818-001',
      '[SMTPClient] Connected to Mailer Gateway (TLS)',
      '[SMTPClient] Message dispatched to somchai@gmail.com with status 250 OK',
      '[BullMQ:EmailWorker] Email sent successfully'
    ],
    createdAt: '2026-08-18T10:30:07.000Z',
    finishedAt: '2026-08-18T10:30:08.000Z'
  },
  {
    id: 'job-103',
    queueName: 'order-processing' as const,
    jobName: 'process-new-order',
    data: { orderId: 'ORD-20260819-002', customer: 'Apinya Wongsuwan', amount: 7000 },
    status: 'completed' as const,
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[BullMQ:Worker] Processing order items batch (2 lines)',
      '[Inventory] Reserved Samba OG (US 7.5) & Nike Dunk (US 8)',
      '[BullMQ:Worker] Order state transitioned to PROCESSING'
    ],
    createdAt: '2026-08-19T08:20:02.000Z',
    finishedAt: '2026-08-19T08:20:04.000Z'
  },
  {
    id: 'job-104',
    queueName: 'inventory-sync' as const,
    jobName: 'sync-channel-stock',
    data: { channels: ['Storefront', 'Shopee', 'Lazada'], timestamp: '2026-08-19T10:00:00Z' },
    status: 'completed' as const,
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[BullMQ:Cron] Scheduled 15-minute stock sync triggered',
      '[MySQL:Query] Reading active SKU levels across 8 products',
      '[SyncService] Stock parity verified across channels (0 mismatches)'
    ],
    createdAt: '2026-08-19T10:00:00.000Z',
    finishedAt: '2026-08-19T10:00:02.000Z'
  }
];
