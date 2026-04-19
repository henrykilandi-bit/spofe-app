CREATE TABLE sales_quotes (
  tenant_id TEXT NOT NULL,
  quote_id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  validated_at TIMESTAMP
);
