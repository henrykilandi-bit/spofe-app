CREATE OR REPLACE VIEW view_stock_by_depot AS
SELECT
    tenant_id,
    depot_id,
    product_id,
    category,
    SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY
    tenant_id,
    depot_id,
    product_id,
    category;