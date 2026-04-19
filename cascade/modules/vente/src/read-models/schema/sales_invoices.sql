CREATE TABLE sales_invoices (
  tenant_id TEXT NOT NULL,
  invoice_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  delivery_note_id TEXT,
  status TEXT NOT NULL,
  issued_at TIMESTAMP
);
