CREATE TABLE stock_movements (
    movement_id      UUID PRIMARY KEY,
    tenant_id        VARCHAR(64) NOT NULL,
    depot_id         VARCHAR(64) NOT NULL,
    product_id       VARCHAR(64) NOT NULL,
    category         VARCHAR(64) NOT NULL,
    movement_type    VARCHAR(32) NOT NULL,
    quantity         NUMERIC NOT NULL,
    document_id      VARCHAR(64) NOT NULL,
    occurred_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX idx_stock_movements_depot ON stock_movements(depot_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_category ON stock_movements(category);
CREATE INDEX idx_stock_movements_date ON stock_movements(occurred_at);