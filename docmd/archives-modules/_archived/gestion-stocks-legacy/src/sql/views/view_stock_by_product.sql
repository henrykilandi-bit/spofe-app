CREATE OR REPLACE VIEW view_stock_by_product AS
SELECT
    tenant_id,
    product_id,
    SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY
    tenant_id,
    product_id;