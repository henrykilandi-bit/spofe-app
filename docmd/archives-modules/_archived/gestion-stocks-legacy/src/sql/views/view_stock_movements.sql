CREATE OR REPLACE VIEW view_stock_movements AS
SELECT
    movement_id,
    tenant_id,
    depot_id,
    product_id,
    category,
    movement_type,
    quantity,
    document_id,
    occurred_at
FROM stock_movements
ORDER BY occurred_at ASC;