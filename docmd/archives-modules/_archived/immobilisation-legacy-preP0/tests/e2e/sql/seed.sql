-- ═══════════════════════════════════════════════════════════════════════════════
-- SQL SEED DATA — E2E Tests Module Immobilisation
-- SPOFE v1.0.0
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- DONNÉES DÉTERMINISTES POUR TESTS E2E
-- - Tenant 1: tenant-e2e-001 (3 assets, maintenance, allocations)
-- - Tenant 2: tenant-e2e-002 (2 assets, different data)
-- 
-- RÈGLES:
-- - UUIDs fixes pour prédictabilité des tests
-- - Données complètes pour chaque endpoint
-- - Isolation tenant garantie
-- ═══════════════════════════════════════════════════════════════════════════════

-- Clean existing test data
DELETE FROM immobilisation.cost_allocation WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002');
DELETE FROM immobilisation.depreciation_schedule WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002');
DELETE FROM immobilisation.maintenance_event WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002');
DELETE FROM immobilisation.renewal_projection WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002');
DELETE FROM immobilisation.disposal WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002');
DELETE FROM immobilisation.asset WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002');

-- ═══════════════════════════════════════════════════════════════════════════════
-- TENANT 1: tenant-e2e-001
-- ═══════════════════════════════════════════════════════════════════════════════

-- Assets Tenant 1
INSERT INTO immobilisation.asset (
    asset_id, tenant_id, name, description, category, 
    acquisition_date, acquisition_cost, useful_life_months,
    depreciation_method, salvage_value, status, currency,
    created_at, created_by
) VALUES
-- Asset 1: Machine Production (IN_SERVICE)
(
    'asset-e2e-001-001', 'tenant-e2e-001', 'Machine Production Alpha',
    'Machine de production principale', 'MACHINERY',
    '2022-01-15', 150000.00, 120,
    'LINEAR', 15000.00, 'IN_SERVICE', 'EUR',
    NOW(), 'seed-script'
),
-- Asset 2: Véhicule (IN_SERVICE)
(
    'asset-e2e-001-002', 'tenant-e2e-001', 'Véhicule Utilitaire',
    'Fourgon de livraison', 'VEHICLE',
    '2023-06-01', 45000.00, 60,
    'LINEAR', 5000.00, 'IN_SERVICE', 'EUR',
    NOW(), 'seed-script'
),
-- Asset 3: Mobilier (DISPOSED)
(
    'asset-e2e-001-003', 'tenant-e2e-001', 'Mobilier Bureau',
    'Ensemble mobilier administratif', 'FURNITURE',
    '2020-03-01', 25000.00, 84,
    'LINEAR', 2500.00, 'DISPOSED', 'EUR',
    NOW(), 'seed-script'
);

-- Depreciation Schedule Tenant 1
INSERT INTO immobilisation.depreciation_schedule (
    depreciation_id, tenant_id, asset_id, period,
    depreciation_amount, cumulative_depreciation, net_book_value,
    calculated_at, calculation_method
) VALUES
-- Asset 1 depreciation history
('dep-e2e-001-001-2024-01', 'tenant-e2e-001', 'asset-e2e-001-001', '2024-01', 1125.00, 27000.00, 123000.00, '2024-01-31', 'LINEAR'),
('dep-e2e-001-001-2024-02', 'tenant-e2e-001', 'asset-e2e-001-001', '2024-02', 1125.00, 28125.00, 121875.00, '2024-02-29', 'LINEAR'),
('dep-e2e-001-001-2024-03', 'tenant-e2e-001', 'asset-e2e-001-001', '2024-03', 1125.00, 29250.00, 120750.00, '2024-03-31', 'LINEAR'),
('dep-e2e-001-001-2024-04', 'tenant-e2e-001', 'asset-e2e-001-001', '2024-04', 1125.00, 30375.00, 119625.00, '2024-04-30', 'LINEAR'),
('dep-e2e-001-001-2024-05', 'tenant-e2e-001', 'asset-e2e-001-001', '2024-05', 1125.00, 31500.00, 118500.00, '2024-05-31', 'LINEAR'),
('dep-e2e-001-001-2024-06', 'tenant-e2e-001', 'asset-e2e-001-001', '2024-06', 1125.00, 32625.00, 117375.00, '2024-06-30', 'LINEAR'),
-- Asset 2 depreciation history
('dep-e2e-001-002-2024-01', 'tenant-e2e-001', 'asset-e2e-001-002', '2024-01', 666.67, 4666.67, 40333.33, '2024-01-31', 'LINEAR'),
('dep-e2e-001-002-2024-02', 'tenant-e2e-001', 'asset-e2e-001-002', '2024-02', 666.67, 5333.34, 39666.66, '2024-02-29', 'LINEAR'),
('dep-e2e-001-002-2024-03', 'tenant-e2e-001', 'asset-e2e-001-002', '2024-03', 666.67, 6000.01, 38999.99, '2024-03-31', 'LINEAR'),
('dep-e2e-001-002-2024-04', 'tenant-e2e-001', 'asset-e2e-001-002', '2024-04', 666.67, 6666.68, 38333.32, '2024-04-30', 'LINEAR'),
('dep-e2e-001-002-2024-05', 'tenant-e2e-001', 'asset-e2e-001-002', '2024-05', 666.67, 7333.35, 37666.65, '2024-05-31', 'LINEAR'),
('dep-e2e-001-002-2024-06', 'tenant-e2e-001', 'asset-e2e-001-002', '2024-06', 666.67, 8000.02, 36999.98, '2024-06-30', 'LINEAR');

-- Allocations Tenant 1
INSERT INTO immobilisation.cost_allocation (
    allocation_id, tenant_id, asset_id,
    target_type, target_id, percentage, effective_date,
    created_at, created_by
) VALUES
-- Asset 1 allocations (total 100%)
('alloc-e2e-001-001-a', 'tenant-e2e-001', 'asset-e2e-001-001', 'PRODUCT', 'product-e2e-001', 60.00, '2024-01-01', NOW(), 'seed-script'),
('alloc-e2e-001-001-b', 'tenant-e2e-001', 'asset-e2e-001-001', 'PRODUCT', 'product-e2e-002', 25.00, '2024-01-01', NOW(), 'seed-script'),
('alloc-e2e-001-001-c', 'tenant-e2e-001', 'asset-e2e-001-001', 'SERVICE', 'service-e2e-001', 15.00, '2024-01-01', NOW(), 'seed-script'),
-- Asset 2 allocations (total 80%, 20% unallocated)
('alloc-e2e-001-002-a', 'tenant-e2e-001', 'asset-e2e-001-002', 'PROJECT', 'project-e2e-001', 50.00, '2024-01-01', NOW(), 'seed-script'),
('alloc-e2e-001-002-b', 'tenant-e2e-001', 'asset-e2e-001-002', 'SERVICE', 'service-e2e-002', 30.00, '2024-01-01', NOW(), 'seed-script');

-- Maintenance Events Tenant 1
INSERT INTO immobilisation.maintenance_event (
    maintenance_id, tenant_id, asset_id,
    maintenance_type, maintenance_date, cost, description,
    performed_by, next_scheduled_date,
    created_at, created_by
) VALUES
('maint-e2e-001-001-a', 'tenant-e2e-001', 'asset-e2e-001-001', 'PREVENTIVE', '2024-03-15', 2500.00, 'Révision annuelle', 'TechniPro SARL', '2025-03-15', NOW(), 'seed-script'),
('maint-e2e-001-001-b', 'tenant-e2e-001', 'asset-e2e-001-001', 'CORRECTIVE', '2024-05-20', 4800.00, 'Remplacement pièce usée', 'TechniPro SARL', NULL, NOW(), 'seed-script'),
('maint-e2e-001-002-a', 'tenant-e2e-001', 'asset-e2e-001-002', 'PREVENTIVE', '2024-02-10', 350.00, 'Vidange + contrôle', 'Garage Central', '2024-08-10', NOW(), 'seed-script'),
('maint-e2e-001-002-b', 'tenant-e2e-001', 'asset-e2e-001-002', 'IMPROVEMENT', '2024-04-05', 1200.00, 'Installation GPS', 'AutoEquip', NULL, NOW(), 'seed-script');

-- Renewal Projections Tenant 1
INSERT INTO immobilisation.renewal_projection (
    projection_id, tenant_id, asset_id,
    projected_year, estimated_cost, priority, reason,
    created_at, created_by
) VALUES
('renew-e2e-001-001', 'tenant-e2e-001', 'asset-e2e-001-001', 2032, 180000.00, 'MEDIUM', 'Fin de vie utile prévue', NOW(), 'seed-script'),
('renew-e2e-001-002', 'tenant-e2e-001', 'asset-e2e-001-002', 2028, 55000.00, 'HIGH', 'Renouvellement flotte', NOW(), 'seed-script');

-- Disposal Tenant 1 (Asset 3)
INSERT INTO immobilisation.disposal (
    disposal_id, tenant_id, asset_id,
    disposal_type, disposal_date, sale_amount, net_book_value_at_disposal,
    buyer_info, reason,
    created_at, created_by
) VALUES
('disp-e2e-001-003', 'tenant-e2e-001', 'asset-e2e-001-003', 'SALE', '2024-02-28', 5000.00, 8928.57, 'Brocante Pro', 'Remplacement mobilier', NOW(), 'seed-script');

-- ═══════════════════════════════════════════════════════════════════════════════
-- TENANT 2: tenant-e2e-002
-- ═══════════════════════════════════════════════════════════════════════════════

-- Assets Tenant 2
INSERT INTO immobilisation.asset (
    asset_id, tenant_id, name, description, category,
    acquisition_date, acquisition_cost, useful_life_months,
    depreciation_method, salvage_value, status, currency,
    created_at, created_by
) VALUES
-- Asset 1: Équipement IT (IN_SERVICE)
(
    'asset-e2e-002-001', 'tenant-e2e-002', 'Serveur Principal',
    'Serveur rack haute performance', 'IT_EQUIPMENT',
    '2023-01-10', 35000.00, 48,
    'LINEAR', 3500.00, 'IN_SERVICE', 'EUR',
    NOW(), 'seed-script'
),
-- Asset 2: Outillage (OUT_OF_SERVICE)
(
    'asset-e2e-002-002', 'tenant-e2e-002', 'CNC Machine',
    'Machine à commande numérique', 'MACHINERY',
    '2019-06-15', 95000.00, 96,
    'DECLINING_BALANCE', 9500.00, 'OUT_OF_SERVICE', 'EUR',
    NOW(), 'seed-script'
);

-- Depreciation Schedule Tenant 2
INSERT INTO immobilisation.depreciation_schedule (
    depreciation_id, tenant_id, asset_id, period,
    depreciation_amount, cumulative_depreciation, net_book_value,
    calculated_at, calculation_method
) VALUES
-- Asset 1 (IT) depreciation history
('dep-e2e-002-001-2024-01', 'tenant-e2e-002', 'asset-e2e-002-001', '2024-01', 656.25, 7875.00, 27125.00, '2024-01-31', 'LINEAR'),
('dep-e2e-002-001-2024-02', 'tenant-e2e-002', 'asset-e2e-002-001', '2024-02', 656.25, 8531.25, 26468.75, '2024-02-29', 'LINEAR'),
('dep-e2e-002-001-2024-03', 'tenant-e2e-002', 'asset-e2e-002-001', '2024-03', 656.25, 9187.50, 25812.50, '2024-03-31', 'LINEAR'),
('dep-e2e-002-001-2024-04', 'tenant-e2e-002', 'asset-e2e-002-001', '2024-04', 656.25, 9843.75, 25156.25, '2024-04-30', 'LINEAR'),
('dep-e2e-002-001-2024-05', 'tenant-e2e-002', 'asset-e2e-002-001', '2024-05', 656.25, 10500.00, 24500.00, '2024-05-31', 'LINEAR'),
('dep-e2e-002-001-2024-06', 'tenant-e2e-002', 'asset-e2e-002-001', '2024-06', 656.25, 11156.25, 23843.75, '2024-06-30', 'LINEAR');

-- Allocations Tenant 2
INSERT INTO immobilisation.cost_allocation (
    allocation_id, tenant_id, asset_id,
    target_type, target_id, percentage, effective_date,
    created_at, created_by
) VALUES
('alloc-e2e-002-001-a', 'tenant-e2e-002', 'asset-e2e-002-001', 'SERVICE', 'service-tenant2-001', 100.00, '2024-01-01', NOW(), 'seed-script');

-- Maintenance Events Tenant 2
INSERT INTO immobilisation.maintenance_event (
    maintenance_id, tenant_id, asset_id,
    maintenance_type, maintenance_date, cost, description,
    performed_by, next_scheduled_date,
    created_at, created_by
) VALUES
('maint-e2e-002-001-a', 'tenant-e2e-002', 'asset-e2e-002-001', 'PREVENTIVE', '2024-04-01', 800.00, 'Nettoyage et vérification', 'IT Services', '2024-10-01', NOW(), 'seed-script'),
('maint-e2e-002-002-a', 'tenant-e2e-002', 'asset-e2e-002-002', 'CORRECTIVE', '2024-01-20', 12000.00, 'Réparation majeure', 'CNC Expert', NULL, NOW(), 'seed-script');

-- Renewal Projections Tenant 2
INSERT INTO immobilisation.renewal_projection (
    projection_id, tenant_id, asset_id,
    projected_year, estimated_cost, priority, reason,
    created_at, created_by
) VALUES
('renew-e2e-002-001', 'tenant-e2e-002', 'asset-e2e-002-001', 2027, 45000.00, 'HIGH', 'Obsolescence technologique', NOW(), 'seed-script'),
('renew-e2e-002-002', 'tenant-e2e-002', 'asset-e2e-002-002', 2025, 120000.00, 'HIGH', 'Remplacement urgent', NOW(), 'seed-script');

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Verify seed data
SELECT 'Assets' as entity, tenant_id, COUNT(*) as count FROM immobilisation.asset WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002') GROUP BY tenant_id
UNION ALL
SELECT 'Depreciation', tenant_id, COUNT(*) FROM immobilisation.depreciation_schedule WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002') GROUP BY tenant_id
UNION ALL
SELECT 'Allocations', tenant_id, COUNT(*) FROM immobilisation.cost_allocation WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002') GROUP BY tenant_id
UNION ALL
SELECT 'Maintenance', tenant_id, COUNT(*) FROM immobilisation.maintenance_event WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002') GROUP BY tenant_id
UNION ALL
SELECT 'Renewals', tenant_id, COUNT(*) FROM immobilisation.renewal_projection WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002') GROUP BY tenant_id
UNION ALL
SELECT 'Disposals', tenant_id, COUNT(*) FROM immobilisation.disposal WHERE tenant_id IN ('tenant-e2e-001', 'tenant-e2e-002') GROUP BY tenant_id
ORDER BY entity, tenant_id;

-- Expected output:
-- Allocations | tenant-e2e-001 | 5
-- Allocations | tenant-e2e-002 | 1
-- Assets | tenant-e2e-001 | 3
-- Assets | tenant-e2e-002 | 2
-- Depreciation | tenant-e2e-001 | 12
-- Depreciation | tenant-e2e-002 | 6
-- Disposals | tenant-e2e-001 | 1
-- Maintenance | tenant-e2e-001 | 4
-- Maintenance | tenant-e2e-002 | 2
-- Renewals | tenant-e2e-001 | 2
-- Renewals | tenant-e2e-002 | 2
