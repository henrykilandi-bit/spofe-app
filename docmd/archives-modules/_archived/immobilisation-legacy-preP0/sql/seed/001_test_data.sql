-- =====================================================
-- Immobilisation Module - Seed Data for Testing
-- Conformité: READ_MODELS.md v1.0.0
-- =====================================================

-- Test tenant
INSERT INTO assets (
  asset_id, tenant_id,
  acquisition_cost, currency, acquisition_date,
  useful_life_months, depreciation_method, residual_value,
  renewal_date, replacement_cost,
  status, created_by
) VALUES 
  -- Asset 1: Machine industrielle
  (
    'a0000001-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    12000000, 'XAF', '2024-01-01',
    60, 'LINEAR', 1000000,
    '2029-01-01', 15000000,
    'IN_SERVICE', 'admin'
  ),
  -- Asset 2: Véhicule
  (
    'a0000002-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    8000000, 'XAF', '2024-06-01',
    48, 'LINEAR', 500000,
    '2028-06-01', 10000000,
    'IN_SERVICE', 'admin'
  ),
  -- Asset 3: Ordinateurs (disposed)
  (
    'a0000003-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    2000000, 'XAF', '2022-01-01',
    36, 'LINEAR', 100000,
    NULL, NULL,
    'DISPOSED', 'admin'
  )
ON CONFLICT DO NOTHING;

-- Depreciation records for Asset 1
INSERT INTO depreciation_records (
  schedule_id, asset_id, tenant_id,
  period, depreciation_amount, accumulated_depreciation, net_book_value, currency,
  calculated_by
)
SELECT
  gen_random_uuid(),
  'a0000001-0000-0000-0000-000000000001',
  't0000001-0000-0000-0000-000000000001',
  TO_CHAR(d.month, 'YYYY-MM'),
  183333.33, -- (12000000 - 1000000) / 60
  183333.33 * ROW_NUMBER() OVER (ORDER BY d.month),
  12000000 - (183333.33 * ROW_NUMBER() OVER (ORDER BY d.month)),
  'XAF',
  'system'
FROM generate_series('2024-01-01'::date, '2025-12-01'::date, '1 month'::interval) AS d(month)
ON CONFLICT DO NOTHING;

-- Allocations for Asset 1
INSERT INTO asset_allocations (
  allocation_id, asset_id, tenant_id,
  target_type, target_id, percentage,
  effective_from, created_by
) VALUES 
  (
    'alloc-001',
    'a0000001-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    'PRODUCT', 'p0000001-0000-0000-0000-000000000001', 60,
    '2024-01-01', 'admin'
  ),
  (
    'alloc-002',
    'a0000001-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    'SERVICE', 's0000001-0000-0000-0000-000000000001', 40,
    '2024-01-01', 'admin'
  )
ON CONFLICT DO NOTHING;

-- Maintenance records
INSERT INTO maintenance_records (
  maintenance_id, asset_id, tenant_id,
  maintenance_type, maintenance_date, description,
  cost, currency, performed_by, recorded_by
) VALUES 
  (
    'mnt-001',
    'a0000001-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    'MAINTENANCE', '2024-06-15', 'Maintenance préventive semestrielle',
    150000, 'XAF', 'Technicien A', 'admin'
  ),
  (
    'mnt-002',
    'a0000001-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    'REPAIR', '2024-09-10', 'Remplacement pièce usée',
    350000, 'XAF', 'Technicien B', 'admin'
  ),
  (
    'mnt-003',
    'a0000002-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    'SERVICE', '2024-12-01', 'Vidange et révision',
    75000, 'XAF', 'Garage Central', 'admin'
  )
ON CONFLICT DO NOTHING;

-- Disposal for Asset 3
INSERT INTO asset_disposals (
  disposal_id, asset_id, tenant_id,
  disposal_date, disposal_type, disposal_value, currency,
  net_book_value, gain_or_loss,
  disposed_by
) VALUES 
  (
    'disp-001',
    'a0000003-0000-0000-0000-000000000001',
    't0000001-0000-0000-0000-000000000001',
    '2025-01-15', 'SALE', 300000, 'XAF',
    100000, 200000, -- Gain de 200,000
    'admin'
  )
ON CONFLICT DO NOTHING;
