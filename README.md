# patsakorn. mix shop

ร้านค้าออนไลน์แบบคัดสรร (curated mix shop) ที่รวมสนีกเกอร์ เสื้อผ้า กระเป๋า แอกเซสซอรี แกดเจ็ต และของแต่งบ้านไว้ในที่เดียว พร้อมระบบหลังบ้านที่เชื่อมต่อ PostgreSQL จริง

ดีไซน์ได้รับแรงบันดาลใจจาก editorial minimalism ของ Wix shoe-store template — พื้นครีม โทนดำอุ่น ตัวอักษรพาดหัวขนาดใหญ่ ปุ่ม pill และพื้นที่ว่างที่ทำให้สินค้าเป็นพระเอก

## Features

### Storefront
- หน้าแรกแบบ editorial hero พร้อมสินค้าแนะนำและ floating product card
- แคตตาล็อก 26 สินค้าใน 6 หมวดหมู่: Sneakers, Apparel, Bags, Accessories, Tech, Home
- ค้นหา / กรองตามหมวดหมู่ แบรนด์ ราคา สต็อก / เรียงลำดับได้
- หน้ารายละเอียดสินค้า พร้อมตัวเลือก ไซส์ สต็อก รีวิว และเรื่องราวสินค้า
- ตะกร้าแบบ drawer, ปรับจำนวน, แจ้งเตือนสต็อก และคำนวณส่งฟรีเมื่อครบ ฿1,500
- Checkout พร้อมที่อยู่จัดส่ง, PromptPay / Credit Card / COD, คูปองส่วนลด และหน้าประกาศผลสำเร็จ
- สมัครสมาชิก / เข้าสู่ระบบด้วยรหัสผ่านจริง (scrypt + HMAC token)
- ประวัติคำสั่งซื้อพร้อมไทม์ไลน์สถานะและการติดตามพัสดุ
- Newsletter form และ footer แบบ editorial

### Back office
- แดชบอร์ดภาพรวม: รายได้ คำสั่งซื้อ ลูกค้า สินค้า กราฟ 7 วัน และยอดขายตามหมวดหมู่
- จัดการสินค้า: เพิ่ม / แก้ไข / ลบ, ตัวเลือกและสต็อก, รูปภาพ, ป้ายสินค้า
- จัดการคำสั่งซื้อ: ค้นหา กรอง และอัปเดตสถานะพร้อมไทม์ไลน์
- คลังสินค้า: ปรับสต็อกแต่ละ variant และดูรายการสต็อกต่ำ
- Database: แสดงโหมดการเชื่อมต่อ ตาราง คอลัมน์ และ SQL Console แบบอ่านอย่างเดียว (`SELECT` / `WITH` เท่านั้น)
- Automation: ติดตามคิวงาน background (order processing, email, invoice, inventory sync), ดู log, retry และ trigger sync

### Coupons
| Code | สิทธิ์ |
| --- | --- |
| `MIX10` | ลด 10% จากยอดสินค้า |
| `MIX300` | ลด ฿300 |
| `MIX500` | ลด ฿500 |
| `MIX800` | ลด ฿800 |
| `MIX1000` | ลด ฿1,000 |
| `FREESHIP` | จัดส่งฟรี |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, lucide-react
- **Backend:** Express, TypeScript (tsx), Node `crypto`
- **Database:** PostgreSQL 17 (หรือ 16+) ผ่าน `pg` หรือ in-memory PostgreSQL (`pg-mem`) เมื่อยังไม่ได้ตั้งค่า
- **Auth:** scrypt password hashing + HMAC-SHA256 signed bearer token (หมดอายุ 7 วัน)
- **Fonts:** Manrope + IBM Plex Sans Thai

## Getting Started

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

เปิด `http://localhost:3000`

> ถ้าใช้ PostgreSQL portable ที่ติดตั้งไว้ในเครื่องนี้ ให้รัน `npm run db:start` ก่อน `npm run dev` (รายละเอียดอยู่ในหัวข้อถัดไป)

ค่าเริ่มต้นระบบจะใช้ **pg-mem** ซึ่งเป็น PostgreSQL จำลองในหน่วยความจำ ทำให้รันได้ทันทีโดยไม่ต้องติดตั้งฐานข้อมูล เหมาะสำหรับ demo และการพัฒนา UI

### ใช้ PostgreSQL จริง

#### Portable PostgreSQL บนเครื่องนี้ (ติดตั้งให้แล้ว)

PostgreSQL 17.6 ถูกติดตั้งแบบ portable ไว้ที่ `C:\Users\admin\patsakorn-postgres` โดยไม่ต้องใช้สิทธิ์ administrator และไม่ได้ลงเป็น Windows service จึงต้องเปิดฐานข้อมูลเองหลังรีบูตเครื่อง:

```powershell
npm run db:start     # เปิด PostgreSQL ที่ localhost:5432
npm run db:status    # ดูสถานะ
npm run db:stop      # ปิดฐานข้อมูล
```

ตั้งค่าใน `.env` (ไฟล์นี้มีอยู่แล้วในเครื่อง แต่ไม่ถูกใส่ใน ZIP):

```env
DATABASE_URL="postgres://patsakorn:patsakorn@localhost:5432/patsakorn_mix_shop"
AUTH_SECRET="replace-with-a-long-random-string"
PORT=3000
```

ฐานข้อมูลถูก seed แล้ว: 26 สินค้า, 11 คำสั่งซื้อ, 4 ผู้ใช้ หากต้องการรัน schema + seed ใหม่:

```bash
npm run db:init
```

- Data directory: `C:\Users\admin\patsakorn-postgres\data`
- Log: `C:\Users\admin\patsakorn-postgres\logs\postgres.log`
- ฐานข้อมูลรับการเชื่อมต่อเฉพาะ `localhost` เท่านั้น
- รหัสผ่านเริ่มต้น `patsakorn` เหมาะสำหรับเครื่องส่วนตัว หากใช้งานจริงควรเปลี่ยนรหัสผ่านและไม่ commit ไฟล์ `.env`
- ถ้าย้ายโฟลเดอร์ติดตั้ง ให้ตั้ง environment variable `PATSAKORN_PG_ROOT` ชี้ไปยังโฟลเดอร์ใหม่

#### วิธีอื่น — Docker Compose

หากใช้ PostgreSQL portable อยู่แล้ว ไม่ต้องรัน Docker Compose เพราะพอร์ต 5432 จะชนกัน

```bash
docker compose up -d
```

จากนั้นตั้งค่าใน `.env`:

```env
DATABASE_URL="postgres://patsakorn:patsakorn@localhost:5432/patsakorn_mix_shop"
AUTH_SECRET="replace-with-a-long-random-string"
PORT=3000
```

รัน schema + seed ข้อมูล:

```bash
npm run db:init
npm run dev
```

ถ้ามี `DATABASE_URL` แต่เชื่อมต่อไม่ได้ เซิร์ฟเวอร์จะ fallback ไปใช้ pg-mem โดยอัตโนมัติและแจ้งเตือนใน console

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@patsakorn.shop` | `admin1234` |
| Customer | `customer@patsakorn.shop` | `customer1234` |
| Customer | `somchai@patsakorn.shop` | `somchai1234` |
| Customer | `apinya@patsakorn.shop` | `apinya1234` |

เข้าหลังบ้านได้จากเมนู **หลังบ้าน** บน navbar หรือลิงก์ใน footer

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | รัน Express + Vite dev server |
| `npm run build` | build frontend และ bundle server ลง `dist/` |
| `npm start` | รัน production build จาก `dist/` (รัน `npm run build` ก่อน) |
| `npm run lint` | TypeScript type check |
| `npm run db:init` | สร้าง schema และ seed ข้อมูลเริ่มต้น |
| `npm run db:start` | เปิด PostgreSQL portable (Windows) |
| `npm run db:stop` | ปิด PostgreSQL portable (Windows) |
| `npm run db:restart` | รีสตาร์ท PostgreSQL portable (Windows) |
| `npm run db:status` | ตรวจสอบสถานะ PostgreSQL portable (Windows) |

## API Overview

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `GET` | `/api/products` | Public |
| `GET` | `/api/products/:id` | Public |
| `POST` | `/api/products` | Admin |
| `PUT` | `/api/products/:id` | Admin |
| `DELETE` | `/api/products/:id` | Admin |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Customer / Admin |
| `GET` | `/api/orders` | Customer (own) / Admin (all) |
| `POST` | `/api/orders` | Public (guest checkout) / Customer |
| `GET` | `/api/orders/:id` | Owner / Admin |
| `PATCH` | `/api/orders/:id/status` | Admin |
| `GET` | `/api/analytics/dashboard` | Admin |
| `GET` | `/api/queue/jobs` | Admin |
| `POST` | `/api/queue/trigger-sync` | Admin |
| `POST` | `/api/queue/jobs/retry/:id` | Admin |
| `GET` | `/api/admin/db/status` | Admin |
| `POST` | `/api/admin/db/query` | Admin |
| `POST` | `/api/newsletter` | Public |

Authorization ใช้ header:

```http
Authorization: Bearer <token>
```

## Database Schema

- `users` — บัญชีลูกค้าและแอดมิน พร้อม scrypt password hash
- `products` — แคตตาล็อก, JSONB images/variants/reviews, total stock
- `orders` — คำสั่งซื้อ, shipping address, payment, status history (JSONB)
- `queue_jobs` — งาน background และ log
- `newsletter_subscribers` — อีเมลผู้รับข่าวสาร

Source of truth อยู่ที่ [`db/schema.sql`](db/schema.sql)

## Project Structure

```text
.
├── db/
│   └── schema.sql
├── scripts/
│   ├── db-local.ps1
│   └── init-db.ts
├── server/
│   ├── auth.ts
│   ├── db.ts
│   ├── jobs.ts
│   └── repository.ts
├── src/
│   ├── components/
│   ├── data/
│   ├── lib/
│   ├── services/
│   ├── App.tsx
│   ├── index.css
│   └── types.ts
├── server.ts
├── compose.yaml
└── package.json
```

## Notes

- ระบบชำระเงินเป็น simulation เพื่อการ demo ไม่มีการตัดเงินจริง
- Queue ใช้ `setTimeout` จำลอง worker แทน Redis/BullMQ แต่มี lifecycle, log, progress และ retry เหมือนระบบจริง
- SQL Console เปิดเฉพาะคำสั่งอ่านข้อมูล (SELECT/WITH) และจำกัดผลลัพธ์ 200 แถว

---

© 2026 patsakorn. mix shop — curated everyday goods.
