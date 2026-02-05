CREATE OR REPLACE VIEW view_stock_by_category AS
SELECT
    tenant_id,
    category,
    product_id,
    SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY
    tenant_id,
    category,
    product_id;