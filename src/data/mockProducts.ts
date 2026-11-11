import {
  Order,
  OrderItem,
  OrderStatus,
  Product,
  QueueJob
} from '../types';

const img = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

const shoeSizes = (stocks: number[]) =>
  ['US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5'].map(
    (label, index) => ({ label, stock: stocks[index] ?? 0 })
  );

const clothingSizes = (stocks: number[]) =>
  ['S', 'M', 'L', 'XL'].map((label, index) => ({ label, stock: stocks[index] ?? 0 }));

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-001',
    name: 'Air Jordan 1 Retro High OG “Chicago Lost & Found”',
    brand: 'Jordan',
    category: 'Sneakers',
    price: 7200,
    originalPrice: 7900,
    description:
      'ไอคอนจากปี 1985 ในโทน Chicago ที่มาพร้อมรายละเอียดหนัง cracks และงานตัดเย็บแบบวินเทจ สวมใส่ได้ทุกวันและเข้ากับทุกสไตล์',
    story:
      'แรงบันดาลใจจากร้านรองเท้ายุค 80s การกลับมาของ Lost & Found คือการเฉลิมฉลองตำนาน Air Jordan 1 ในแบบที่ดูผ่านกาลเวลามาแล้ว',
    sku: 'DZ5485-612',
    subtitle: 'Varsity Red / Black / Sail',
    images: [img('photo-1552346154-21d32810aba3')],
    variants: shoeSizes([2, 4, 5, 3, 6, 2, 4, 1]),
    totalStock: 27,
    rating: 4.9,
    reviewCount: 148,
    reviews: [
      {
        id: 'r-001',
        userName: 'นัท ก.',
        rating: 5,
        comment: 'หนังสวยมาก ไซส์ตรง ใส่แล้วทรงดีสุดๆ',
        date: '2026-10-28'
      },
      {
        id: 'r-002',
        userName: 'สารวัตร ม.',
        rating: 5,
        comment: 'คู่ในฝันของสายวินเทจ ได้มาครอบครองแล้ว',
        date: '2026-10-21'
      }
    ],
    badge: 'HOT',
    isFeatured: true,
    createdAt: '2026-10-01'
  },
  {
    id: 'p-002',
    name: 'Nike Dunk Low “Panda Retro”',
    brand: 'Nike',
    category: 'Sneakers',
    price: 3700,
    originalPrice: 4200,
    description:
      'ดีไซน์ขาวดำคลาสสิกที่จับคู่ได้กับทุกชุด งานหนังเรียบเนียน น้ำหนักเบา และรูปทรงที่ครองใจสายสตรีทมาหลายฤดูกาล',
    story:
      'Dunk เกิดจากสนามบาสแต่ถูกพาไปเดินบนถนน Panda คือสีที่ทำให้ทุกคนรู้จักอีกครั้ง',
    sku: 'DD1391-100',
    subtitle: 'White / Black',
    images: [img('photo-1597045566677-8cf032ed6634')],
    variants: shoeSizes([8, 6, 12, 9, 15, 7, 10, 4]),
    totalStock: 71,
    rating: 4.8,
    reviewCount: 320,
    reviews: [
      {
        id: 'r-003',
        userName: 'ธนวัฒน์ พ.',
        rating: 5,
        comment: 'ใส่ง่าย เข้ากับทุกชุด คุ้มค่ามาก',
        date: '2026-10-30'
      }
    ],
    badge: 'BESTSELLER',
    isFeatured: true,
    createdAt: '2026-09-18'
  },
  {
    id: 'p-003',
    name: 'New Balance 9060 “Rain Cloud Grey”',
    brand: 'New Balance',
    category: 'Sneakers',
    price: 6500,
    originalPrice: 6900,
    description:
      'ดีไซน์ Y2K สุดล้ำด้วยหนังกลับพรีเมียมและพื้น ABZORB ที่ให้น้ำหนักการเดินนุ่มสบายตลอดวัน',
    story:
      '9060 ตีความดีเอ็นเอของซีรีส์ 99X ใหม่ด้วยรูปทรงแห่งอนาคตที่ได้แรงบันดาลใจจากเทคโนโลยี Y2K',
    sku: 'U9060ECA',
    subtitle: 'Rain Cloud / Castlerock / White',
    images: [img('photo-1539185441755-769473a23570')],
    variants: shoeSizes([4, 5, 7, 3, 2, 3, 2, 0]),
    totalStock: 26,
    rating: 4.9,
    reviewCount: 89,
    reviews: [
      {
        id: 'r-004',
        userName: 'กิตติศักดิ์ ส.',
        rating: 5,
        comment: 'นุ่มเท้ามาก เดินทั้งวันไม่ปวดเท้าเลย',
        date: '2026-10-25'
      }
    ],
    badge: 'NEW',
    isFeatured: true,
    createdAt: '2026-10-15'
  },
  {
    id: 'p-004',
    name: 'Adidas Originals Samba OG “Cloud White”',
    brand: 'Adidas',
    category: 'Sneakers',
    price: 3800,
    description:
      'รองเท้าฟุตบอลในร่มระดับตำนานที่กลายเป็นไอคอนสตรีท หนังเต็มใบ น้ำหนักเบา และพื้นยาง gum ที่ให้การยึดเกาะดีเยี่ยม',
    story:
      'Samba ถือกำเนิดบนสนามหญ้าในปี 1950 และยังคงเป็นหนึ่งในดีไซน์ที่ไม่มีวันเอาต์',
    sku: 'B75806',
    subtitle: 'Cloud White / Core Black / Gum',
    images: [img('photo-1518002171953-a080ee817e1f')],
    variants: shoeSizes([3, 4, 6, 8, 5, 9, 2, 0]),
    totalStock: 37,
    rating: 4.7,
    reviewCount: 210,
    reviews: [
      {
        id: 'r-005',
        userName: 'พลอย พ.',
        rating: 5,
        comment: 'ทรงสวย แมตช์กับกางเกงยีนส์ขากระบอกสวยมาก',
        date: '2026-10-18'
      }
    ],
    badge: 'BESTSELLER',
    isFeatured: true,
    createdAt: '2026-08-20'
  },
  {
    id: 'p-005',
    name: 'Asics Gel-Kayano 14 “Metallic Silver”',
    brand: 'Asics',
    category: 'Sneakers',
    price: 5900,
    originalPrice: 6500,
    description:
      'รองเท้าวิ่งสไตล์ late-2000s กับเทคโนโลยี GEL ที่ซับแรงกระแทก งาน metallic overlay และความคลาสสิกที่ไม่มีตกยุค',
    story:
      'Gel-Kayano 14 คือการกลับมาของรองเท้าวิ่งPerformanceในปี 2008 ที่ผสานความ retro เข้ากับความล้ำได้อย่างลงตัว',
    sku: '1201A019-108',
    subtitle: 'Cream / Pure Silver',
    images: [img('photo-1542291026-7eec264c27ff')],
    variants: shoeSizes([2, 3, 4, 1, 3, 2, 1, 0]),
    totalStock: 16,
    rating: 4.9,
    reviewCount: 76,
    reviews: [
      {
        id: 'r-006',
        userName: 'ชลทิศ ท.',
        rating: 5,
        comment: 'สไตล์ Y2K สวยจับใจ รองรับแรงกระแทกดีมาก',
        date: '2026-10-26'
      }
    ],
    badge: 'HOT',
    isFeatured: true,
    createdAt: '2026-09-28'
  },
  {
    id: 'p-006',
    name: 'Puma Palermo Special “Cobalt Clementine”',
    brand: 'Puma',
    category: 'Sneakers',
    price: 3400,
    description:
      'รองเท้าสไตล์ terrace culture หนังกลับพรีเมียม ตัดสลับสีสดใส พร้อมรายละเอียด gold foil branding',
    story:
      'Palermo ย้อนรากเหง้าวัฒนธรรมฟุตบอลชายฝั่งอิตาลีในยุค 80s กลับมาในโทนสีที่สนุกและร่วมสมัย',
    sku: '397549-01',
    subtitle: 'Cobalt Glaze / Clementine',
    images: [img('photo-1608667508764-33cf0726b13a')],
    variants: shoeSizes([5, 4, 6, 7, 4, 3, 2, 1]),
    totalStock: 32,
    rating: 4.6,
    reviewCount: 42,
    reviews: [
      {
        id: 'r-007',
        userName: 'อนุวัฒน์ บ.',
        rating: 5,
        comment: 'สีสดใสใส่กับกางเกงขาสั้นเท่มาก',
        date: '2026-10-20'
      }
    ],
    badge: 'NEW',
    isFeatured: false,
    createdAt: '2026-10-05'
  },
  {
    id: 'p-007',
    name: 'Puma Clyde Court “Triple White”',
    brand: 'Puma',
    category: 'Sneakers',
    price: 3200,
    originalPrice: 3900,
    description:
      'สนีกเกอร์บาสน้ำหนักเบาในโทนขาวล้วน งาน perforated leather ระบายอากาศดี พร้อมพื้น cushioned ที่ใส่สบาย',
    story:
      'Clyde Court หยิบมรดกของ Walt “Clyde” Frazier มาตีความใหม่ให้เหมาะกับชีวิตประจำวัน',
    sku: '194079-01',
    subtitle: 'Puma White / Puma White',
    images: [img('photo-1608231387042-66d1773070a5')],
    variants: shoeSizes([3, 4, 5, 4, 5, 3, 2, 0]),
    totalStock: 26,
    rating: 4.7,
    reviewCount: 64,
    reviews: [
      {
        id: 'r-008',
        userName: 'วีรชัย ต.',
        rating: 4,
        comment: 'สีขาวสะอาด ใส่ง่าย แต่ต้องหมั่นทำความสะอาดหน่อย',
        date: '2026-10-12'
      }
    ],
    badge: 'SALE',
    isFeatured: false,
    createdAt: '2026-09-10'
  },
  {
    id: 'p-008',
    name: 'Nike Air Max 1 “Anniversary Orange”',
    brand: 'Nike',
    category: 'Sneakers',
    price: 5900,
    description:
      'Air Max 1 รุ่นคลาสสิกในโทนขาวส้มสดใส งาน mesh และ suede คุณภาพดี พร้อมช่อง Air ที่เป็นเอกลักษณ์',
    story:
      'Air Max 1 คือจุดเริ่มต้นของวัฒนธรรม visible Air ในปี 1987 และยังคงเป็นหนึ่งใน silhouette ที่ได้รับความนิยมที่สุด',
    sku: 'DC1454-108',
    subtitle: 'White / Safety Orange',
    images: [img('photo-1600185365483-26d7a4cc7519')],
    variants: shoeSizes([4, 5, 7, 6, 8, 4, 3, 1]),
    totalStock: 38,
    rating: 4.8,
    reviewCount: 132,
    reviews: [
      {
        id: 'r-009',
        userName: 'ปัณฑิตา ส.',
        rating: 5,
        comment: 'สีส้มสวยกำลังดี ใส่แล้วดูสดใสมาก',
        date: '2026-11-01'
      }
    ],
    badge: 'NEW',
    isFeatured: true,
    createdAt: '2026-10-30'
  },
  {
    id: 'p-009',
    name: 'Nike SB Dunk Low “Wheat Brown”',
    brand: 'Nike',
    category: 'Sneakers',
    price: 4500,
    originalPrice: 4900,
    description:
      'SB Dunk งานหนังกลับสีน้ำตาลเอิร์ธโทน พร้อม Zoom Air ในพื้นและลิ้นหนานุ่ม เหมาะทั้งเล่นสเก็ตและใส่ everyday',
    story:
      'แรงบันดาลใจจากสีของผ้า corduroy และฤดูใบไม้ร่วง ทำให้คู่นี้เป็นอีกหนึ่งสีที่สายสตรีทตามหา',
    sku: 'CD2563-200',
    subtitle: 'Wheat / Black / Sail',
    images: [img('photo-1549298916-b41d501d3772')],
    variants: shoeSizes([3, 2, 4, 2, 5, 2, 1, 0]),
    totalStock: 19,
    rating: 4.9,
    reviewCount: 65,
    reviews: [
      {
        id: 'r-010',
        userName: 'พีรพล จ.',
        rating: 5,
        comment: 'ลิ้นหนานุ่ม ซับแรงกระแทกดีมาก',
        date: '2026-10-16'
      }
    ],
    badge: 'LIMITED',
    isFeatured: false,
    createdAt: '2026-09-22'
  },
  {
    id: 'p-010',
    name: 'Nike LeBron Witness “Black Ice”',
    brand: 'Nike',
    category: 'Sneakers',
    price: 3900,
    description:
      'สนีกเกอร์บาสที่ให้การรองรับและความมั่นคงสูง น้ำหนักเบา พร้อมพื้นยางที่ยึดเกาะสนามได้ดี',
    story:
      'LeBron Witness ถูกออกแบบสำหรับผู้เล่นที่ต้องการความเร็วและความมั่นใจในทุกก้าว',
    sku: 'CZ4052-001',
    subtitle: 'Black / White / Ice Blue',
    images: [img('photo-1605348532760-6753d2c43329')],
    variants: shoeSizes([2, 3, 4, 3, 3, 2, 1, 0]),
    totalStock: 18,
    rating: 4.5,
    reviewCount: 38,
    reviews: [
      {
        id: 'r-011',
        userName: 'คณาธิป ว.',
        rating: 4,
        comment: 'กระชับเท้าดี เหมาะกับเล่นบาสมาก',
        date: '2026-10-08'
      }
    ],
    badge: undefined,
    isFeatured: false,
    createdAt: '2026-09-05'
  },
  {
    id: 'p-011',
    name: 'Heavyweight Boxy Tee “Off White”',
    brand: 'Patsakorn Studio',
    category: 'Apparel',
    price: 890,
    originalPrice: 1190,
    description:
      'เสื้อยืดคอกลมผ้า cotton หนา 240 แกรม ทรง boxy สวมใส่สบาย ไม่ย้วยง่าย พร้อมปักโลโก้เล็กที่อก',
    story:
      'เสื้อตัวพื้นฐานที่เราตั้งใจทำให้ดีกว่าเดิม ด้วยผ้าหนักกำลังดีและทรงที่ใส่ได้ทุกวัน',
    sku: 'PSS-TEE-OW',
    subtitle: 'Off White / Boxy Fit',
    images: [img('photo-1521572163474-6864f9cf17ab')],
    variants: clothingSizes([12, 18, 15, 6]),
    totalStock: 51,
    rating: 4.8,
    reviewCount: 57,
    reviews: [
      {
        id: 'r-012',
        userName: 'ญาณิศา พ.',
        rating: 5,
        comment: 'ผ้าหนากำลังดี ทรงสวย ใส่แล้วดูมีอะไร',
        date: '2026-10-29'
      }
    ],
    badge: 'NEW',
    isFeatured: true,
    createdAt: '2026-10-20'
  },
  {
    id: 'p-012',
    name: 'Essential Hoodie “Fog Grey”',
    brand: 'Patsakorn Studio',
    category: 'Apparel',
    price: 2290,
    description:
      'ฮู้ดดี้ผ้าฝ้ายผสม fleece นุ่มอุ่น ทรง relaxed ลูกคอสองชั้น และกระเป๋าหน้ารูปตัวจีบ',
    story:
      'ออกแบบให้เป็นฮู้ดดี้ที่หยิบใส่ได้ทุกวัน ตั้งแต่เช้าวันทำงานยันค่ำวันหยุด',
    sku: 'PSS-HD-FG',
    subtitle: 'Fog Grey / Relaxed Fit',
    images: [img('photo-1556821840-3a63f95609a7')],
    variants: clothingSizes([6, 10, 12, 4]),
    totalStock: 32,
    rating: 4.9,
    reviewCount: 84,
    reviews: [
      {
        id: 'r-013',
        userName: 'ธีร์ธวัช ก.',
        rating: 5,
        comment: 'ผ้านุ่มมาก ทรงกำลังดี ใส่ได้ทุกวัน',
        date: '2026-10-27'
      }
    ],
    badge: 'BESTSELLER',
    isFeatured: true,
    createdAt: '2026-10-10'
  },
  {
    id: 'p-013',
    name: 'Canvas Coach Jacket “Nomad”',
    brand: 'Carhartt WIP',
    category: 'Apparel',
    price: 3490,
    originalPrice: 3990,
    description:
      'แจ็คเก็ตโค้ชผ้า canvas ทนทาน ทรงหลวมเล็กน้อย ซิปหน้าและกระเป๋าข้างสองช่อง ใส่ได้ทั้งปี',
    story:
      'แรงบันดาลใจจากแจ็คเก็ตทำงานกลางแจ้ง ถูกปรับให้เบาและใส่ในเมืองได้สบายขึ้น',
    sku: 'I031579-03',
    subtitle: 'Hamilton Brown / Black',
    images: [img('photo-1591047139829-d91aecb6caea')],
    variants: clothingSizes([4, 7, 8, 3]),
    totalStock: 22,
    rating: 4.7,
    reviewCount: 31,
    reviews: [
      {
        id: 'r-014',
        userName: 'กฤษณะ อ.',
        rating: 5,
        comment: 'งานแข็งแรง ใส่ได้หลายโอกาส คุ้มราคา',
        date: '2026-10-19'
      }
    ],
    badge: 'SALE',
    isFeatured: false,
    createdAt: '2026-09-15'
  },
  {
    id: 'p-014',
    name: 'Herschel Daypack 20L “Black”',
    brand: 'Herschel',
    category: 'Bags',
    price: 2890,
    description:
      'กระเป๋าเป้ทรงคลาสสิกความจุ 20 ลิตร ช่องใส่โน้ตบุ๊ก 15 นิ้ว และช่องเล็กสำหรับของใช้จำเป็น',
    story:
      'ดีไซน์ที่ได้รับแรงบันดาลใจจากกระเป๋าเป้ของโรงเรียน vintage แต่ทำใหม่ให้ใช้วัสดุที่ทนทานกว่าเดิม',
    sku: 'HS-10001-BLK',
    subtitle: 'Black / 20L',
    images: [img('photo-1553062407-98eeb64c6a62')],
    variants: [
      { label: 'Black', stock: 9 },
      { label: 'Navy', stock: 6 },
      { label: 'Olive', stock: 4 }
    ],
    totalStock: 19,
    rating: 4.8,
    reviewCount: 46,
    reviews: [
      {
        id: 'r-015',
        userName: 'ชยพล ภ.',
        rating: 5,
        comment: 'ช่องเยอะมาก ใส่ของได้เยอะกว่าที่คิด',
        date: '2026-10-23'
      }
    ],
    badge: 'BESTSELLER',
    isFeatured: true,
    createdAt: '2026-10-02'
  },
  {
    id: 'p-015',
    name: 'Mini Shoulder Bag “Sand”',
    brand: 'Patsakorn Studio',
    category: 'Bags',
    price: 1990,
    description:
      'กระเป๋าสะพายใบเล็กที่ใส่ของจำเป็นได้ครบ มีสายปรับความยาวได้ และช่องซิปด้านหลัง',
    story:
      'กระเป๋าที่เกิดจากความอยากได้ใบเล็กๆ ใส่โทรศัพท์ กระเป๋าเงิน และกุญแจแบบไม่ต้องพกอะไรเยอะ',
    sku: 'PSB-SHL-SND',
    subtitle: 'Sand / Nylon',
    images: [img('photo-1548036328-c9fa89d128fa')],
    variants: [
      { label: 'Sand', stock: 7 },
      { label: 'Black', stock: 10 },
      { label: 'Sage', stock: 5 }
    ],
    totalStock: 22,
    rating: 4.6,
    reviewCount: 28,
    reviews: [
      {
        id: 'r-016',
        userName: 'อารยา ม.',
        rating: 5,
        comment: 'ใบเล็กแต่จุของได้เยอะ สีพรีตตี้มาก',
        date: '2026-10-31'
      }
    ],
    badge: 'NEW',
    isFeatured: true,
    createdAt: '2026-10-25'
  },
  {
    id: 'p-016',
    name: 'Everyday Canvas Tote “Natural”',
    brand: 'Patsakorn Studio',
    category: 'Bags',
    price: 1290,
    description:
      'ถุงผ้า canvas หนา 16 ออนซ์ พร้อมช่องในและสายหิ้วที่เสริมความแข็งแรง ใส่ของได้ทั้งวัน',
    story:
      'ของใช้ที่เรียบง่ายที่สุด แต่หยิบใช้บ่อยที่สุดในทุกวัน',
    sku: 'PSB-TOTE-NAT',
    subtitle: 'Natural / 16oz Canvas',
    images: [img('photo-1590874103328-eac38a683ce7')],
    variants: [
      { label: 'Natural', stock: 14 },
      { label: 'Black', stock: 8 }
    ],
    totalStock: 22,
    rating: 4.5,
    reviewCount: 19,
    reviews: [
      {
        id: 'r-017',
        userName: 'ปรีชา ส.',
        rating: 4,
        comment: 'ผ้าหนาดี ใส่ของได้เยอะ ราคาคุ้ม',
        date: '2026-10-11'
      }
    ],
    badge: undefined,
    isFeatured: false,
    createdAt: '2026-09-01'
  },
  {
    id: 'p-017',
    name: 'Field Watch 38mm “Silver Black”',
    brand: 'Casio',
    category: 'Accessories',
    price: 4590,
    originalPrice: 5200,
    description:
      'นาฬิกาสนามขนาด 38 มม. ตัวเรือนสแตนเลส หน้าปัดเรียบอ่านง่าย พร้อมสายหนังและกันน้ำ 50 เมตร',
    story:
      'นาฬิกาที่ออกแบบมาเพื่อการใช้งานจริงในทุกวัน ทั้งเรียบง่ายและทนทาน',
    sku: 'CS-FW-38SB',
    subtitle: 'Silver Case / Black Leather',
    images: [img('photo-1523275335684-37898b6baf30')],
    variants: [
      { label: 'Silver / Black', stock: 5 },
      { label: 'Gold / Cream', stock: 3 }
    ],
    totalStock: 8,
    rating: 4.7,
    reviewCount: 37,
    reviews: [
      {
        id: 'r-018',
        userName: 'สุรชัย ก.',
        rating: 5,
        comment: 'หน้าปัดอ่านง่าย ใส่กับเสื้อเชิ้ตสวยมาก',
        date: '2026-10-24'
      }
    ],
    badge: 'SALE',
    isFeatured: true,
    createdAt: '2026-09-30'
  },
  {
    id: 'p-018',
    name: 'Archive Sunglasses “Black”',
    brand: 'Patsakorn Studio',
    category: 'Accessories',
    price: 1290,
    description:
      'แว่นกันแดดทรงเหลี่ยมร่วมสมัย เลนส์ UV400 และกรอบ acetate น้ำหนักเบา ใส่ได้ทุกวัน',
    story:
      'หยิบรูปทรงจากคลังแว่นวินเทจมาทำใหม่ให้พอดีกับใบหน้าคนเอเชีย',
    sku: 'PSA-SUN-BLK',
    subtitle: 'Black / UV400',
    images: [img('photo-1572635196237-14b3f281503f')],
    variants: [
      { label: 'Black', stock: 11 },
      { label: 'Tortoise', stock: 4 }
    ],
    totalStock: 15,
    rating: 4.4,
    reviewCount: 23,
    reviews: [
      {
        id: 'r-019',
        userName: 'ณัฐพงษ์ ร.',
        rating: 4,
        comment: 'ทรงสวย ใส่แล้วไม่หนักหน้า',
        date: '2026-10-14'
      }
    ],
    badge: undefined,
    isFeatured: false,
    createdAt: '2026-09-08'
  },
  {
    id: 'p-019',
    name: 'Corduroy Cap “Black”',
    brand: 'New Era',
    category: 'Accessories',
    price: 990,
    description:
      'หมวกแก๊ปผ้าคอร์ดูรอย 6 แพเนล ปักโลโก้เล็ก และสายปรับด้านหลัง ใส่ได้ทุกฤดู',
    story:
      'หมวกที่เพิ่ม texture ให้ลุคเรียบง่าย และเป็นของสะสมสำหรับสาย cap',
    sku: 'NE-CAP-BLK',
    subtitle: 'Black / 6 Panel',
    images: [img('photo-1588850561407-ed78c282e89b')],
    variants: [
      { label: 'Black', stock: 9 },
      { label: 'Brown', stock: 5 }
    ],
    totalStock: 14,
    rating: 4.6,
    reviewCount: 17,
    reviews: [
      {
        id: 'r-020',
        userName: 'กิตติพงศ์ ล.',
        rating: 5,
        comment: 'ทรงสวย ผ้าดี ใส่แล้วเข้ากับทุกชุด',
        date: '2026-10-06'
      }
    ],
    badge: undefined,
    isFeatured: false,
    createdAt: '2026-08-28'
  },
  {
    id: 'p-020',
    name: 'Studio Headphones “Sand”',
    brand: 'Anker',
    category: 'Tech',
    price: 6990,
    originalPrice: 7990,
    description:
      'หูฟัง over-ear ตัดเสียงรบกวนแบบ active noise cancelling แบตอึด 40 ชั่วโมง และเสียงเบสที่สมดุล',
    story:
      'หูฟังสำหรับคนที่ต้องการสมาธิในทุกวัน ไม่ว่าจะทำงาน ฟังเพลง หรือเดินทาง',
    sku: 'AK-SND-SND',
    subtitle: 'Sand / ANC / 40h',
    images: [img('photo-1505740420928-5e560c06d30e')],
    variants: [
      { label: 'Sand', stock: 4 },
      { label: 'Black', stock: 7 }
    ],
    totalStock: 11,
    rating: 4.8,
    reviewCount: 96,
    reviews: [
      {
        id: 'r-021',
        userName: 'ชินวัฒน์ บ.',
        rating: 5,
        comment: 'เสียงดี ตัดเสียงดี แบตอึดจริง',
        date: '2026-10-31'
      }
    ],
    badge: 'HOT',
    isFeatured: true,
    createdAt: '2026-10-18'
  },
  {
    id: 'p-021',
    name: 'Pocket Speaker “Sage”',
    brand: 'Anker',
    category: 'Tech',
    price: 3990,
    description:
      'ลำโพงพกพาขนาดกะทัดรัด กันน้ำ IPX7 เสียงดังกระหึ่ม และแบตเตอรี่ 12 ชั่วโมง',
    story:
      'ลำโพงที่พาเสียงดีๆ ไปได้ทุกที่ ไม่ว่าจะปิกนิกหรือตั้งแคมป์',
    sku: 'AK-SPK-SG',
    subtitle: 'Sage / IPX7',
    images: [img('photo-1546435770-a3e426bf472b')],
    variants: [
      { label: 'Sage', stock: 6 },
      { label: 'Black', stock: 8 }
    ],
    totalStock: 14,
    rating: 4.6,
    reviewCount: 41,
    reviews: [
      {
        id: 'r-022',
        userName: 'ปวริศ ฐ.',
        rating: 5,
        comment: 'เสียงดีเกินขนาด พกง่ายมาก',
        date: '2026-10-22'
      }
    ],
    badge: undefined,
    isFeatured: false,
    createdAt: '2026-09-25'
  },
  {
    id: 'p-022',
    name: 'Mechanical Keyboard “Cream”',
    brand: 'Keychron',
    category: 'Tech',
    price: 3290,
    description:
      'คีย์บอร์ด mechanical ขนาด 75% สวิตช์ tactile เงียบ ใช้ได้ทั้ง Mac และ Windows พร้อมไฟ RGB',
    story:
      'คีย์บอร์ดที่ทำให้การพิมพ์ทุกวันเป็นเรื่องสนุกขึ้นอีกนิด',
    sku: 'KC-K75-CR',
    subtitle: 'Cream / 75% / Tactile',
    images: [img('photo-1527864550417-7fd91fc51a46')],
    variants: [
      { label: 'Brown Switch', stock: 5 },
      { label: 'White Switch', stock: 4 }
    ],
    totalStock: 9,
    rating: 4.7,
    reviewCount: 33,
    reviews: [
      {
        id: 'r-023',
        userName: 'ธนกฤต เ.',
        rating: 5,
        comment: 'พิมพ์เพลินมาก งานประกอบแน่น',
        date: '2026-10-17'
      }
    ],
    badge: undefined,
    isFeatured: false,
    createdAt: '2026-09-12'
  },
  {
    id: 'p-023',
    name: 'Paper Lamp “Warm Grey”',
    brand: 'MUJI',
    category: 'Home',
    price: 2490,
    description:
      'โคมไฟตั้งโต๊ะทรงเรียบง่าย วัสดุกระดาษและเหล็ก ให้แสงนวลอุ่น เหมาะกับมุมอ่านหนังสือหรือหัวเตียง',
    story:
      'แสงที่พอดีทำให้บ้านน่าอยู่ขึ้น ดีไซน์มินิมอลที่เข้ากับทุกห้อง',
    sku: 'MJ-LMP-WG',
    subtitle: 'Warm Grey / E27',
    images: [img('photo-1507473885765-e6ed057f782c')],
    variants: [{ label: 'Warm Grey', stock: 6 }],
    totalStock: 6,
    rating: 4.8,
    reviewCount: 22,
    reviews: [
      {
        id: 'r-024',
        userName: 'มินตรา ช.',
        rating: 5,
        comment: 'แสงสวยมาก ตั้งหัวเตียงแล้วบรรยากาศดีขึ้นเยอะ',
        date: '2026-10-26'
      }
    ],
    badge: 'NEW',
    isFeatured: true,
    createdAt: '2026-10-22'
  },
  {
    id: 'p-024',
    name: 'Lounge Chair “Cream Bouclé”',
    brand: 'Patsakorn Living',
    category: 'Home',
    price: 5990,
    originalPrice: 6900,
    description:
      'เก้าอี้เลานจ์ทรงโค้งบุผ้า bouclé สีครีม ขาไม้ธรรมชาติ นั่งสบายและเป็นจุดเด่นของห้องนั่งเล่น',
    story:
      'เฟอร์นิเจอร์ชิ้นเล็กที่ทำให้มุมหนึ่งของบ้านกลายเป็นมุมโปรด',
    sku: 'PL-CHR-CRM',
    subtitle: 'Cream Bouclé / Oak Legs',
    images: [img('photo-1586023492125-27b2c045efd7')],
    variants: [{ label: 'Cream', stock: 3 }],
    totalStock: 3,
    rating: 4.6,
    reviewCount: 12,
    reviews: [
      {
        id: 'r-025',
        userName: 'อรพรรณ ส.',
        rating: 5,
        comment: 'นั่งสบายมาก งานประกอบดี สีสวยตรงปก',
        date: '2026-10-15'
      }
    ],
    badge: 'SALE',
    isFeatured: false,
    createdAt: '2026-09-20'
  },
  {
    id: 'p-025',
    name: 'Ceramic Mug “Sand”',
    brand: 'Patsakorn Living',
    category: 'Home',
    price: 590,
    description:
      'แก้วเซรามิกเคลือบด้าน ความจุ 350 มล. ทรงจับถนัดมือ เหมาะกับกาแฟยามเช้าและชาในวันสบาย',
    story:
      'ของใช้เล็กๆ ที่ทำให้ทุกเช้าดูพิเศษขึ้น',
    sku: 'PL-MUG-SND',
    subtitle: 'Sand / 350ml',
    images: [img('photo-1514228742587-6b1558fcca3d')],
    variants: [
      { label: 'Sand', stock: 16 },
      { label: 'Charcoal', stock: 9 }
    ],
    totalStock: 25,
    rating: 4.7,
    reviewCount: 25,
    reviews: [
      {
        id: 'r-026',
        userName: 'พิมพ์ชนก ว.',
        rating: 5,
        comment: 'เนื้อแก้วดี จับถนัดมือ สีสวยมาก',
        date: '2026-10-28'
      }
    ],
    badge: undefined,
    isFeatured: false,
    createdAt: '2026-09-03'
  },
  {
    id: 'p-026',
    name: 'House Blend Coffee Beans “Bangkok Roast”',
    brand: 'Patsakorn Living',
    category: 'Home',
    price: 490,
    description:
      'เมล็ดกาแฟคั่วกลาง 250 กรัม โทนช็อกโกแลตและถั่ว ให้ความหอมกลมกล่อม ชงได้ทั้ง drip และ espresso',
    story:
      'คั่วจากเมล็ดอาราบิกาคัดเกรดในกรุงเทพฯ เพื่อทุกเช้าที่ดีกว่าเดิม',
    sku: 'PL-COF-250',
    subtitle: 'Medium Roast / 250g',
    images: [img('photo-1495474472287-4d71bcdd2085')],
    variants: [
      { label: 'Whole Bean', stock: 12 },
      { label: 'Ground', stock: 7 }
    ],
    totalStock: 19,
    rating: 4.8,
    reviewCount: 31,
    reviews: [
      {
        id: 'r-027',
        userName: 'ภาณุวัฒน์ ค.',
        rating: 5,
        comment: 'หอมมาก ชงง่าย ดื่มทุกเช้าเลย',
        date: '2026-10-30'
      }
    ],
    badge: 'NEW',
    isFeatured: false,
    createdAt: '2026-10-27'
  }
];

const productById = (id: string): Product => {
  const product = INITIAL_PRODUCTS.find(item => item.id === id);
  if (!product) throw new Error(`Unknown seed product: ${id}`);
  return product;
};

const orderItem = (productId: string, selectedVariant: string, quantity = 1): OrderItem => {
  const product = productById(productId);
  return {
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    category: product.category,
    image: product.images[0],
    selectedVariant,
    unitPrice: product.price,
    quantity
  };
};

const sumItems = (items: OrderItem[]) =>
  items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

const history = (
  status: OrderStatus,
  timestamp: string,
  note: string
) => ({ status, timestamp, note });

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-20261102-101',
    userId: 'user-customer-1',
    customerName: 'พัสกร สุขเจริญ',
    customerEmail: 'customer@patsakorn.shop',
    customerPhone: '081-234-5678',
    items: [orderItem('p-001', 'US 9'), orderItem('p-020', 'Sand')],
    subtotal: sumItems([orderItem('p-001', 'US 9'), orderItem('p-020', 'Sand')]),
    discount: 1000,
    shippingFee: 0,
    totalAmount: 13190,
    couponCode: 'MIX1000',
    paymentMethod: 'PromptPay',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    shippingAddress: {
      fullName: 'พัสกร สุขเจริญ',
      phone: '081-234-5678',
      email: 'customer@patsakorn.shop',
      addressLine: '99/12 ซอยสุขุมวิท 21 (อโศก)',
      district: 'วัฒนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110',
      notes: 'ฝากไว้ที่นิติบุคคลคอนโด'
    },
    trackingNumber: 'TH-KEX-8812001',
    carrier: 'Kerry Express Thailand',
    createdAt: '2026-11-02T10:30:00.000Z',
    updatedAt: '2026-11-04T15:10:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-02T10:30:00.000Z', 'สร้างคำสั่งซื้อผ่าน PromptPay'),
      history('PROCESSING', '2026-11-02T10:35:00.000Z', 'ตรวจสอบการชำระเงินและส่งเข้าคลัง'),
      history('SHIPPED', '2026-11-03T09:20:00.000Z', 'มอบพัสดุให้ Kerry Express'),
      history('DELIVERED', '2026-11-04T15:10:00.000Z', 'จัดส่งสำเร็จ ลูกค้าเซ็นรับแล้ว')
    ]
  },
  {
    id: 'ORD-20261103-102',
    userId: 'user-customer-3',
    customerName: 'อภิญญา วงศ์สุวรรณ',
    customerEmail: 'apinya@patsakorn.shop',
    customerPhone: '089-987-6543',
    items: [orderItem('p-008', 'US 9')],
    subtotal: sumItems([orderItem('p-008', 'US 9')]),
    discount: 0,
    shippingFee: 0,
    totalAmount: 5900,
    paymentMethod: 'PromptPay',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    shippingAddress: {
      fullName: 'อภิญญา วงศ์สุวรรณ',
      phone: '089-987-6543',
      email: 'apinya@patsakorn.shop',
      addressLine: '452 ถนนพหลโยธิน แขวงสามเสนใน',
      district: 'พญาไท',
      province: 'กรุงเทพมหานคร',
      postalCode: '10400'
    },
    trackingNumber: 'TH-FLASH-992810',
    carrier: 'Flash Express',
    createdAt: '2026-11-03T08:20:00.000Z',
    updatedAt: '2026-11-05T11:40:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-03T08:20:00.000Z', 'สร้างคำสั่งซื้อ'),
      history('PROCESSING', '2026-11-03T08:25:00.000Z', 'แพ็คสินค้าเรียบร้อย'),
      history('SHIPPED', '2026-11-04T10:00:00.000Z', 'ส่งมอบให้ Flash Express'),
      history('DELIVERED', '2026-11-05T11:40:00.000Z', 'จัดส่งสำเร็จ')
    ]
  },
  {
    id: 'ORD-20261104-103',
    userId: 'user-customer-2',
    customerName: 'สมชาย ประเสริฐ',
    customerEmail: 'somchai@patsakorn.shop',
    customerPhone: '086-555-1212',
    items: [orderItem('p-011', 'M'), orderItem('p-014', 'Black')],
    subtotal: sumItems([orderItem('p-011', 'M'), orderItem('p-014', 'Black')]),
    discount: 0,
    shippingFee: 0,
    totalAmount: 3780,
    paymentMethod: 'CreditCard',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    shippingAddress: {
      fullName: 'สมชาย ประเสริฐ',
      phone: '086-555-1212',
      email: 'somchai@patsakorn.shop',
      addressLine: '88/9 หมู่บ้านลัดดาโฮม',
      district: 'บางเขน',
      province: 'กรุงเทพมหานคร',
      postalCode: '10220'
    },
    trackingNumber: 'TH-KEX-8812044',
    carrier: 'Kerry Express Thailand',
    createdAt: '2026-11-04T13:10:00.000Z',
    updatedAt: '2026-11-06T16:30:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-04T13:10:00.000Z', 'สร้างคำสั่งซื้อ'),
      history('PROCESSING', '2026-11-04T13:18:00.000Z', 'ตรวจสอบสต็อกและแพ็คสินค้า'),
      history('SHIPPED', '2026-11-05T09:45:00.000Z', 'ส่งมอบให้ Kerry Express'),
      history('DELIVERED', '2026-11-06T16:30:00.000Z', 'จัดส่งสำเร็จ')
    ]
  },
  {
    id: 'ORD-20261105-104',
    userId: 'user-customer-1',
    customerName: 'พัสกร สุขเจริญ',
    customerEmail: 'customer@patsakorn.shop',
    customerPhone: '081-234-5678',
    items: [orderItem('p-017', 'Silver / Black'), orderItem('p-023', 'Warm Grey')],
    subtotal: sumItems([orderItem('p-017', 'Silver / Black'), orderItem('p-023', 'Warm Grey')]),
    discount: 500,
    shippingFee: 0,
    totalAmount: 6580,
    couponCode: 'MIX500',
    paymentMethod: 'PromptPay',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    shippingAddress: {
      fullName: 'พัสกร สุขเจริญ',
      phone: '081-234-5678',
      email: 'customer@patsakorn.shop',
      addressLine: '99/12 ซอยสุขุมวิท 21 (อโศก)',
      district: 'วัฒนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110'
    },
    trackingNumber: 'TH-KEX-8812102',
    carrier: 'Kerry Express Thailand',
    createdAt: '2026-11-05T09:00:00.000Z',
    updatedAt: '2026-11-06T14:00:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-05T09:00:00.000Z', 'สร้างคำสั่งซื้อ'),
      history('PROCESSING', '2026-11-05T09:08:00.000Z', 'แพ็คสินค้าเรียบร้อย'),
      history('SHIPPED', '2026-11-06T14:00:00.000Z', 'อยู่ระหว่างขนส่ง')
    ]
  },
  {
    id: 'ORD-20261106-105',
    userId: 'user-customer-2',
    customerName: 'สมชาย ประเสริฐ',
    customerEmail: 'somchai@patsakorn.shop',
    customerPhone: '086-555-1212',
    items: [orderItem('p-024', 'Cream'), orderItem('p-026', 'Whole Bean')],
    subtotal: sumItems([orderItem('p-024', 'Cream'), orderItem('p-026', 'Whole Bean')]),
    discount: 600,
    shippingFee: 0,
    totalAmount: 5880,
    couponCode: 'HOME600',
    paymentMethod: 'CreditCard',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    shippingAddress: {
      fullName: 'สมชาย ประเสริฐ',
      phone: '086-555-1212',
      email: 'somchai@patsakorn.shop',
      addressLine: '88/9 หมู่บ้านลัดดาโฮม',
      district: 'บางเขน',
      province: 'กรุงเทพมหานคร',
      postalCode: '10220'
    },
    trackingNumber: 'TH-FLASH-993110',
    carrier: 'Flash Express',
    createdAt: '2026-11-06T11:25:00.000Z',
    updatedAt: '2026-11-08T13:15:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-06T11:25:00.000Z', 'สร้างคำสั่งซื้อ'),
      history('PROCESSING', '2026-11-06T11:32:00.000Z', 'ตรวจสอบสินค้าขนาดใหญ่'),
      history('SHIPPED', '2026-11-07T10:20:00.000Z', 'ส่งมอบให้ Flash Express'),
      history('DELIVERED', '2026-11-08T13:15:00.000Z', 'จัดส่งสำเร็จ')
    ]
  },
  {
    id: 'ORD-20261107-106',
    userId: 'user-customer-2',
    customerName: 'สมชาย ประเสริฐ',
    customerEmail: 'somchai@patsakorn.shop',
    customerPhone: '086-555-1212',
    items: [orderItem('p-015', 'Sand'), orderItem('p-012', 'L')],
    subtotal: sumItems([orderItem('p-015', 'Sand'), orderItem('p-012', 'L')]),
    discount: 300,
    shippingFee: 0,
    totalAmount: 3980,
    couponCode: 'MIX300',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    orderStatus: 'PROCESSING',
    shippingAddress: {
      fullName: 'สมชาย ประเสริฐ',
      phone: '086-555-1212',
      email: 'somchai@patsakorn.shop',
      addressLine: '88/9 หมู่บ้านลัดดาโฮม',
      district: 'บางเขน',
      province: 'กรุงเทพมหานคร',
      postalCode: '10220'
    },
    trackingNumber: 'TH-KEX-8812155',
    carrier: 'Kerry Express Thailand',
    createdAt: '2026-11-07T15:40:00.000Z',
    updatedAt: '2026-11-08T09:10:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-07T15:40:00.000Z', 'สร้างคำสั่งซื้อแบบเก็บเงินปลายทาง'),
      history('PROCESSING', '2026-11-08T09:10:00.000Z', 'กำลังเตรียมสินค้า')
    ]
  },
  {
    id: 'ORD-20261108-107',
    userId: 'user-customer-3',
    customerName: 'อภิญญา วงศ์สุวรรณ',
    customerEmail: 'apinya@patsakorn.shop',
    customerPhone: '089-987-6543',
    items: [orderItem('p-022', 'Brown Switch')],
    subtotal: sumItems([orderItem('p-022', 'Brown Switch')]),
    discount: 0,
    shippingFee: 0,
    totalAmount: 3290,
    paymentMethod: 'PromptPay',
    paymentStatus: 'PENDING',
    orderStatus: 'PENDING',
    shippingAddress: {
      fullName: 'อภิญญา วงศ์สุวรรณ',
      phone: '089-987-6543',
      email: 'apinya@patsakorn.shop',
      addressLine: '452 ถนนพหลโยธิน แขวงสามเสนใน',
      district: 'พญาไท',
      province: 'กรุงเทพมหานคร',
      postalCode: '10400'
    },
    createdAt: '2026-11-08T18:05:00.000Z',
    updatedAt: '2026-11-08T18:05:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-08T18:05:00.000Z', 'รอการยืนยันการชำระเงิน')
    ]
  },
  {
    id: 'ORD-20261109-108',
    userId: 'user-customer-1',
    customerName: 'พัสกร สุขเจริญ',
    customerEmail: 'customer@patsakorn.shop',
    customerPhone: '081-234-5678',
    items: [orderItem('p-005', 'US 9.5'), orderItem('p-025', 'Sand', 2)],
    subtotal: sumItems([orderItem('p-005', 'US 9.5'), orderItem('p-025', 'Sand', 2)]),
    discount: 500,
    shippingFee: 0,
    totalAmount: 6580,
    couponCode: 'MIX500',
    paymentMethod: 'CreditCard',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    shippingAddress: {
      fullName: 'พัสกร สุขเจริญ',
      phone: '081-234-5678',
      email: 'customer@patsakorn.shop',
      addressLine: '99/12 ซอยสุขุมวิท 21 (อโศก)',
      district: 'วัฒนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110'
    },
    trackingNumber: 'TH-FLASH-993220',
    carrier: 'Flash Express',
    createdAt: '2026-11-09T10:15:00.000Z',
    updatedAt: '2026-11-10T08:30:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-09T10:15:00.000Z', 'สร้างคำสั่งซื้อ'),
      history('PROCESSING', '2026-11-09T10:22:00.000Z', 'แพ็คสินค้าเรียบร้อย'),
      history('SHIPPED', '2026-11-10T08:30:00.000Z', 'อยู่ระหว่างขนส่ง')
    ]
  },
  {
    id: 'ORD-20261110-109',
    userId: 'user-customer-3',
    customerName: 'อภิญญา วงศ์สุวรรณ',
    customerEmail: 'apinya@patsakorn.shop',
    customerPhone: '089-987-6543',
    items: [orderItem('p-019', 'Black'), orderItem('p-018', 'Black')],
    subtotal: sumItems([orderItem('p-019', 'Black'), orderItem('p-018', 'Black')]),
    discount: 0,
    shippingFee: 0,
    totalAmount: 2280,
    paymentMethod: 'COD',
    paymentStatus: 'REFUNDED',
    orderStatus: 'CANCELLED',
    shippingAddress: {
      fullName: 'อภิญญา วงศ์สุวรรณ',
      phone: '089-987-6543',
      email: 'apinya@patsakorn.shop',
      addressLine: '452 ถนนพหลโยธิน แขวงสามเสนใน',
      district: 'พญาไท',
      province: 'กรุงเทพมหานคร',
      postalCode: '10400'
    },
    createdAt: '2026-11-10T09:35:00.000Z',
    updatedAt: '2026-11-10T12:00:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-10T09:35:00.000Z', 'สร้างคำสั่งซื้อ'),
      history('CANCELLED', '2026-11-10T12:00:00.000Z', 'ลูกค้ายกเลิกคำสั่งซื้อ')
    ]
  },
  {
    id: 'ORD-20261110-110',
    userId: 'user-customer-1',
    customerName: 'พัสกร สุขเจริญ',
    customerEmail: 'customer@patsakorn.shop',
    customerPhone: '081-234-5678',
    items: [orderItem('p-021', 'Sage'), orderItem('p-003', 'US 9')],
    subtotal: sumItems([orderItem('p-021', 'Sage'), orderItem('p-003', 'US 9')]),
    discount: 800,
    shippingFee: 0,
    totalAmount: 9690,
    couponCode: 'MIX800',
    paymentMethod: 'PromptPay',
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    shippingAddress: {
      fullName: 'พัสกร สุขเจริญ',
      phone: '081-234-5678',
      email: 'customer@patsakorn.shop',
      addressLine: '99/12 ซอยสุขุมวิท 21 (อโศก)',
      district: 'วัฒนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110'
    },
    trackingNumber: 'TH-KEX-8812199',
    carrier: 'Kerry Express Thailand',
    createdAt: '2026-11-10T17:45:00.000Z',
    updatedAt: '2026-11-11T08:20:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-10T17:45:00.000Z', 'สร้างคำสั่งซื้อ'),
      history('PROCESSING', '2026-11-11T08:20:00.000Z', 'ตรวจสอบการชำระเงินแล้ว กำลังเตรียมจัดส่ง')
    ]
  },
  {
    id: 'ORD-20261111-111',
    userId: 'user-customer-1',
    customerName: 'พัสกร สุขเจริญ',
    customerEmail: 'customer@patsakorn.shop',
    customerPhone: '081-234-5678',
    items: [orderItem('p-006', 'US 8.5'), orderItem('p-011', 'L')],
    subtotal: sumItems([orderItem('p-006', 'US 8.5'), orderItem('p-011', 'L')]),
    discount: 0,
    shippingFee: 0,
    totalAmount: 4290,
    paymentMethod: 'CreditCard',
    paymentStatus: 'PAID',
    orderStatus: 'PENDING',
    shippingAddress: {
      fullName: 'พัสกร สุขเจริญ',
      phone: '081-234-5678',
      email: 'customer@patsakorn.shop',
      addressLine: '99/12 ซอยสุขุมวิท 21 (อโศก)',
      district: 'วัฒนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110'
    },
    createdAt: '2026-11-11T08:05:00.000Z',
    updatedAt: '2026-11-11T08:05:00.000Z',
    statusHistory: [
      history('PENDING', '2026-11-11T08:05:00.000Z', 'สร้างคำสั่งซื้อ รอตรวจสอบสต็อก')
    ]
  }
];

export const INITIAL_JOBS: QueueJob[] = [
  {
    id: 'job-101',
    queueName: 'order-processing',
    jobName: 'process-new-order',
    data: { orderId: 'ORD-20261102-101', customer: 'พัสกร สุขเจริญ', amount: 13190 },
    status: 'completed',
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[Worker] Job #job-101 picked up by worker thread',
      '[OrderService] Validated stock allocation for 2 items',
      '[StockService] Reserved Air Jordan 1 (US 9) and Studio Headphones (Sand)',
      '[Payment] PromptPay transaction confirmed: PP-99201',
      '[Worker] Completed job in 342ms'
    ],
    createdAt: '2026-11-02T10:30:05.000Z',
    finishedAt: '2026-11-02T10:30:06.000Z'
  },
  {
    id: 'job-102',
    queueName: 'email-notification',
    jobName: 'send-order-confirmation-email',
    data: {
      orderId: 'ORD-20261102-101',
      recipient: 'customer@patsakorn.shop',
      template: 'order-receipt-th'
    },
    status: 'completed',
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[EmailWorker] Generating HTML receipt for ORD-20261102-101',
      '[SMTP] Connected to mail gateway over TLS',
      '[SMTP] Message dispatched to customer@patsakorn.shop (250 OK)',
      '[EmailWorker] Email sent successfully'
    ],
    createdAt: '2026-11-02T10:30:07.000Z',
    finishedAt: '2026-11-02T10:30:08.000Z'
  },
  {
    id: 'job-103',
    queueName: 'inventory-sync',
    jobName: 'sync-channel-stock',
    data: { channels: ['Storefront', 'Shopee', 'Lazada'], skuCount: 26 },
    status: 'completed',
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[Cron] Scheduled 15-minute stock sync triggered',
      '[PostgreSQL] Reading active SKU levels across 26 products',
      '[SyncService] Stock parity verified across channels (0 mismatches)'
    ],
    createdAt: '2026-11-11T07:00:00.000Z',
    finishedAt: '2026-11-11T07:00:02.000Z'
  },
  {
    id: 'job-104',
    queueName: 'invoice-generation',
    jobName: 'generate-daily-sales-report',
    data: { date: '2026-11-10', format: 'csv' },
    status: 'completed',
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[ReportWorker] Collecting orders for 2026-11-10',
      '[PostgreSQL] Aggregated 3 orders / ฿15,260 revenue',
      '[FileStore] Report saved to /reports/2026-11-10.csv'
    ],
    createdAt: '2026-11-11T00:05:00.000Z',
    finishedAt: '2026-11-11T00:05:04.000Z'
  },
  {
    id: 'job-105',
    queueName: 'email-notification',
    jobName: 'send-shipping-tracking-sms',
    data: { orderId: 'ORD-20261109-108', trackingNumber: 'TH-FLASH-993220' },
    status: 'completed',
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    logs: [
      '[SmsWorker] Loaded shipping template for Flash Express',
      '[SmsGateway] SMS dispatched to 081-234-5678',
      '[SmsWorker] Delivery receipt received'
    ],
    createdAt: '2026-11-10T08:30:05.000Z',
    finishedAt: '2026-11-10T08:30:07.000Z'
  }
];
