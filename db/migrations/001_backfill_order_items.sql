-- Backfill normalized order lines from the legacy orders.items JSONB field.
-- Safe to rerun: the composite primary key and ON CONFLICT prevent duplicates.
-- Run this once in Supabase SQL Editor after deploying the code/schema change.

BEGIN;

CREATE TABLE IF NOT EXISTS order_items (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL CHECK (line_number > 0),
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  image TEXT,
  selected_variant TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id);

INSERT INTO order_items (
  order_id, line_number, product_id, product_name, brand, category,
  image, selected_variant, unit_price, quantity
)
SELECT
  o.id,
  item.line_number::INTEGER,
  product.id,
  COALESCE(item.value->>'productName', 'สินค้าเดิม'),
  COALESCE(item.value->>'brand', ''),
  COALESCE(item.value->>'category', ''),
  NULLIF(item.value->>'image', ''),
  COALESCE(item.value->>'selectedVariant', 'Standard'),
  GREATEST(COALESCE(NULLIF(item.value->>'unitPrice', '')::NUMERIC, 0), 0),
  GREATEST(COALESCE(NULLIF(item.value->>'quantity', '')::INTEGER, 1), 1)
FROM orders AS o
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(o.items) = 'array' THEN o.items ELSE '[]'::JSONB END
) WITH ORDINALITY AS item(value, line_number)
LEFT JOIN products AS product ON product.id = item.value->>'productId'
ON CONFLICT (order_id, line_number) DO NOTHING;

COMMIT;
