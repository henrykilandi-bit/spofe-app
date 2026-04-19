CREATE TABLE sales_orders (
  tenant_id TEXT NOT NULL,
  order_id TEXT PRIMARY KEY,
  quote_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  validated_at TIMESTAMP
);
