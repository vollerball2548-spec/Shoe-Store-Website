import fs from 'fs';
import path from 'path';
import { Pool, PoolClient } from 'pg';
import crypto from 'crypto';
import { DataType, newDb } from 'pg-mem';
import { INITIAL_JOBS, INITIAL_ORDERS, INITIAL_PRODUCTS } from '../src/data/mockProducts';
import { hashPassword } from './auth';

export type DbMode = 'postgres' | 'pg-mem';

let pool: Pool | null = null;
let dbMode: DbMode = 'pg-mem';
let initialized = false;

async function createPostgresPool(): Promise<Pool | null> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const candidate = new Pool({
    connectionString,
    max: 10,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  // Idle clients emit 'error' when PostgreSQL restarts or drops a connection.
  // Without a listener Node treats it as unhandled and exits the process.
  candidate.on('error', error => {
    console.warn('[db] PostgreSQL pool error:', error instanceof Error ? error.message : error);
  });

  try {
    await candidate.query('SELECT 1');
    return candidate;
  } catch (error) {
    console.warn(
      '[db] Cannot connect to DATABASE_URL; falling back to in-memory PostgreSQL (pg-mem).',
      error instanceof Error ? error.message : error
    );
    await candidate.end().catch(() => undefined);
    return null;
  }
}

function createMemoryPool(): Pool {
  const memory = newDb({ autoCreateForeignKeyIndices: true });
  memory.public.registerFunction({
    name: 'btrim',
    args: [DataType.text],
    returns: DataType.text,
    implementation: (value: string) => value.trim()
  });
  memory.public.registerFunction({
    name: 'split_part',
    args: [DataType.text, DataType.text, DataType.integer],
    returns: DataType.text,
    implementation: (value: string, delimiter: string, field: number) => {
      if (field === 0) return '';
      if (!delimiter) return field === 1 ? value : '';
      const parts = value.split(delimiter);
      return parts[field > 0 ? field - 1 : parts.length + field] ?? '';
    }
  });
  memory.public.registerFunction({
    name: 'replace',
    args: [DataType.text, DataType.text, DataType.text],
    returns: DataType.text,
    implementation: (value: string, search: string, replacement: string) => value.split(search).join(replacement)
  });
  const adapter = memory.adapters.createPg();
  return new adapter.Pool() as unknown as Pool;
}

async function ensureSchema() {
  if (!pool) throw new Error('Database pool is not initialized');
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function provisionAdmin() {
  if (!pool) return;
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!username && !password) return;
  if (!username || !password) throw new Error('Set both ADMIN_USERNAME and ADMIN_PASSWORD.');

  const existingAdmin = await pool.query("SELECT id FROM users WHERE role = 'ADMIN' ORDER BY created_at LIMIT 1");
  const email = (process.env.ADMIN_EMAIL || 'shop-admin@patsakorn.shop').trim().toLowerCase();
  const passwordHash = hashPassword(password);
  if (existingAdmin.rows[0]) {
    await pool.query(
      'UPDATE users SET username = $1, password_hash = $2, name = $3 WHERE id = $4',
      [username, passwordHash, 'Shop Admin', existingAdmin.rows[0].id]
    );
  } else {
    const user = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)', [username, email]);
    if (user.rows[0]) throw new Error('Configured admin username or email is already used by another account.');
    await pool.query(
      `INSERT INTO users (id, name, username, email, password_hash, role)
       VALUES ($1, 'Shop Admin', $2, $3, $4, 'ADMIN')`,
      [`admin-${crypto.randomUUID()}`, username, email, passwordHash]
    );
  }
}

async function disableLegacyDemoPasswords() {
  if (!pool) return;
  const applied = await pool.query(
    "INSERT INTO app_migrations (name) VALUES ('disable-public-demo-passwords') ON CONFLICT DO NOTHING RETURNING name"
  );
  if (applied.rows.length === 0) return;
  const legacyUsers = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) IN ('customer@patsakorn.shop', 'somchai@patsakorn.shop', 'apinya@patsakorn.shop')"
  );
  for (const user of legacyUsers.rows) {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashPassword(crypto.randomBytes(48).toString('hex')), user.id]);
  }
}

async function seedProducts() {
  if (!pool) return;
  for (const product of INITIAL_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (
        id, name, brand, category, price, original_price, description, story,
        sku, subtitle, images, variants, total_stock, rating, review_count,
        reviews, badge, is_featured, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19
      )`,
      [
        product.id,
        product.name,
        product.brand,
        product.category,
        product.price,
        product.originalPrice ?? null,
        product.description,
        product.story,
        product.sku,
        product.subtitle,
        JSON.stringify(product.images),
        JSON.stringify(product.variants),
        product.totalStock,
        product.rating,
        product.reviewCount,
        JSON.stringify(product.reviews),
        product.badge ?? null,
        product.isFeatured ?? false,
        product.createdAt
      ]
    );
  }
}

async function seedOrders() {
  if (!pool) return;
  for (const order of INITIAL_ORDERS) {
    await pool.query(
      `INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone, items,
        subtotal, discount, shipping_fee, total_amount, coupon_code,
        payment_method, payment_status, order_status, shipping_address,
        tracking_number, carrier, status_history, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20
      )`,
      [
        order.id,
        order.userId,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        JSON.stringify(order.items),
        order.subtotal,
        order.discount,
        order.shippingFee,
        order.totalAmount,
        order.couponCode ?? null,
        order.paymentMethod,
        order.paymentStatus,
        order.orderStatus,
        JSON.stringify(order.shippingAddress),
        order.trackingNumber ?? null,
        order.carrier ?? null,
        JSON.stringify(order.statusHistory),
        order.createdAt,
        order.updatedAt
      ]
    );
  }
}

async function seedJobs() {
  if (!pool) return;
  for (const job of INITIAL_JOBS) {
    await pool.query(
      `INSERT INTO queue_jobs (
        id, queue_name, job_name, data, status, progress, attempts,
        max_attempts, logs, created_at, finished_at, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        job.id,
        job.queueName,
        job.jobName,
        JSON.stringify(job.data),
        job.status,
        job.progress,
        job.attempts,
        job.maxAttempts,
        JSON.stringify(job.logs),
        job.createdAt,
        job.finishedAt ?? null,
        job.errorMessage ?? null
      ]
    );
  }
}

export async function initDb(): Promise<DbMode> {
  if (initialized && pool) return dbMode;

  const postgresPool = await createPostgresPool();
  if (postgresPool) {
    pool = postgresPool;
    dbMode = 'postgres';
  } else {
    pool = createMemoryPool();
    dbMode = 'pg-mem';
  }

  await ensureSchema();
  await disableLegacyDemoPasswords();
  await provisionAdmin();

  const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  const productCount = Number(countResult.rows[0]?.count || 0);

  if (productCount === 0) {
    await seedProducts();
    await seedOrders();
    await seedJobs();
  }

  initialized = true;

  console.log(
    dbMode === 'postgres'
      ? `[db] Connected to PostgreSQL (${getDbTarget()})`
      : '[db] Running on in-memory PostgreSQL (pg-mem). Set DATABASE_URL to use a real PostgreSQL server.'
  );

  return dbMode;
}

export function getPool(): Pool {
  if (!pool) throw new Error('Database is not initialized. Call initDb() first.');
  return pool;
}

export function getDbMode(): DbMode {
  return dbMode;
}

export function getDbTarget(): string {
  if (dbMode === 'pg-mem') {
    return 'pg-mem://in-memory/patsakorn_mix_shop';
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return 'postgres';
  try {
    const url = new URL(connectionString);
    return `${url.hostname}:${url.port || '5432'}${url.pathname}`;
  } catch {
    return 'configured-postgres';
  }
}

export async function query<T = any>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
