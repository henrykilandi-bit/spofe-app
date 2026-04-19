CREATE TABLE delivery_notes (
  tenant_id TEXT NOT NULL,
  delivery_note_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  delivered_at TIMESTAMP
);
