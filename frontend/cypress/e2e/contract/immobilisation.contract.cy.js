/**
 * ═══════════════════════════════════════════════════════════════════════════
 * E2E CONTRACT TESTS — Frontend ↔ Backend Real Integration
 * Module Immobilisation v1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 NIVEAU 3 SPOFE — Tests E2E Contractuels
 * 
 * Ces tests vérifient l'intégrité du contrat FE ↔ BE en conditions réelles:
 * ✅ Frontend lancé
 * ✅ Backend lancé
 * ✅ Appels HTTP réels
 * ✅ Aucun mock
 * 
 * ⚠️ RÈGLES SPOFE:
 * ❌ Pas de test du design UI
 * ❌ Pas de test de logique métier frontend
 * ✅ Test de l'intégrité contractuelle uniquement
 * ✅ Test de la non-rupture FE ↔ BE
 * 
 * Prérequis:
 *   - Frontend lancé: npm run dev (port 5173)
 *   - Backend lancé: npm run start:dev (port 3000)
 *   - Database avec données de test
 * 
 * Exécution:
 *   npm run e2e:headless
 */

/// <reference types="cypress" />

describe('[E2E CONTRACT] Immobilisation — Frontend ↔ Backend Integration', () => {
  
  const API_BASE = Cypress.env('API_BASE') || '/api';
  const TEST_TENANT = Cypress.env('TEST_TENANT') || 'tenant-e2e-test';
  
  beforeEach(() => {
    // Clear any previous intercepts
    cy.intercept(`${API_BASE}/immobilisation/**`).as('immobilisationAPI');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSETS — Contract Integration
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Assets List — Contract Integration', () => {
    it('[CONTRACT] Frontend loads assets via generated client', () => {
      // Navigate to immobilisation page
      cy.visit('/immobilisation');
      
      // Wait for the API call
      cy.wait('@immobilisationAPI').then((interception) => {
        // Verify request was made to correct endpoint
        expect(interception.request.url).to.include('/immobilisation/assets');
        
        // Verify required headers are present
        expect(interception.request.headers).to.have.property('x-tenant-id');
        expect(interception.request.headers).to.have.property('authorization');
        
        // Verify response status
        expect(interception.response.statusCode).to.eq(200);
        
        // Verify response shape matches contract
        const body = interception.response.body;
        expect(body).to.have.property('items');
        expect(body).to.have.property('page');
        expect(body).to.have.property('limit');
        expect(body).to.have.property('total');
        expect(body.items).to.be.an('array');
      });
    });

    it('[CONTRACT] Asset items have required contract fields', () => {
      cy.visit('/immobilisation');
      
      cy.wait('@immobilisationAPI').then((interception) => {
        if (interception.response.statusCode === 200) {
          const items = interception.response.body.items;
          
          if (items.length > 0) {
            const asset = items[0];
            
            // Verify contract-required fields
            expect(asset).to.have.property('assetId');
            expect(asset).to.have.property('tenantId');
            expect(asset).to.have.property('designation');
            expect(asset).to.have.property('status');
            expect(asset).to.have.property('acquisitionCost');
            expect(asset).to.have.property('currency');
            
            // Verify enum values
            expect(['IN_SERVICE', 'DISPOSED', 'SCRAPPED']).to.include(asset.status);
            
            // Verify types
            expect(asset.assetId).to.be.a('string');
            expect(asset.acquisitionCost).to.be.a('number');
          }
        }
      });
    });

    it('[CONTRACT] Pagination works according to contract', () => {
      cy.visit('/immobilisation?page=1&limit=10');
      
      cy.wait('@immobilisationAPI').then((interception) => {
        const url = new URL(interception.request.url, Cypress.config().baseUrl);
        
        // Verify pagination params are passed
        expect(url.searchParams.get('page')).to.exist;
        expect(url.searchParams.get('limit')).to.exist;
        
        // Verify response pagination
        const body = interception.response.body;
        expect(body.items.length).to.be.at.most(body.limit);
      });
    });

    it('[CONTRACT] Status filter works according to contract', () => {
      cy.visit('/immobilisation');
      
      // Trigger filter (assuming UI has filter controls)
      // This depends on actual UI implementation
      cy.intercept('GET', `${API_BASE}/immobilisation/assets*status=IN_SERVICE*`).as('filteredRequest');
      
      // If filter UI exists, trigger it
      // cy.get('[data-testid="status-filter"]').select('IN_SERVICE');
      
      // For now, we test the API directly
      cy.request({
        url: `${API_BASE}/immobilisation/assets?status=IN_SERVICE`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        // All items should have matching status
        response.body.items.forEach((item) => {
          expect(item.status).to.eq('IN_SERVICE');
        });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSET DETAIL — Contract Integration
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Asset Detail — Contract Integration', () => {
    it('[CONTRACT] Asset detail page loads correct contract data', () => {
      // First get an asset ID
      cy.request({
        url: `${API_BASE}/immobilisation/assets`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
      }).then((listResponse) => {
        if (listResponse.body.items.length > 0) {
          const assetId = listResponse.body.items[0].assetId;
          
          // Navigate to detail page
          cy.visit(`/immobilisation/assets/${assetId}`);
          
          // Intercept detail request
          cy.intercept(`${API_BASE}/immobilisation/assets/${assetId}`).as('assetDetail');
          
          cy.wait('@assetDetail').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            
            const asset = interception.response.body;
            expect(asset).to.have.property('assetId');
            expect(asset.assetId).to.eq(assetId);
            expect(asset).to.have.property('netBookValue');
            expect(asset).to.have.property('totalDepreciation');
          });
        }
      });
    });

    it('[CONTRACT] 404 response for non-existent asset', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/assets/non-existent-asset-999`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        
        // Verify error response shape
        expect(response.body).to.have.property('statusCode');
        expect(response.body).to.have.property('message');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COST-STRUCTURE CONTRACT — Integration
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[IMM-CS-*] Cost-Structure Contract — Integration', () => {
    it('[CONTRACT] Depreciation summary endpoint works (IMM-CS-DEP-01)', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/depreciation/summary?period=2025-01`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        const body = response.body;
        expect(body).to.have.property('tenantId');
        expect(body).to.have.property('period');
        expect(body.period).to.eq('2025-01');
        expect(body).to.have.property('totalDepreciation');
        expect(body).to.have.property('byCategory');
        expect(body.byCategory).to.be.an('array');
      });
    });

    it('[CONTRACT] Allocations endpoint works (IMM-CS-ALL-01)', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/allocations`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        const body = response.body;
        expect(body).to.have.property('items');
        expect(body.items).to.be.an('array');
        
        if (body.items.length > 0) {
          const allocation = body.items[0];
          expect(allocation).to.have.property('allocationId');
          expect(allocation).to.have.property('targetType');
          expect(['PRODUCT', 'SERVICE', 'PROJECT']).to.include(allocation.targetType);
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET CONTRACT — Integration
  // ═══════════════════════════════════════════════════════════════════════════

  describe('[IMM-BUD-*] Budget Contract — Integration', () => {
    it('[CONTRACT] Renewal projections endpoint works (IMM-BUD-REN-01)', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/renewals/projections?fromYear=2025&toYear=2030`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        const body = response.body;
        expect(body).to.have.property('items');
        expect(body).to.have.property('fromYear');
        expect(body).to.have.property('toYear');
        expect(body).to.have.property('totalProjectedCost');
        expect(body.fromYear).to.eq(2025);
        expect(body.toYear).to.eq(2030);
      });
    });

    it('[CONTRACT] Renewals by year endpoint works (IMM-BUD-REN-02)', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/renewals/by-year?year=2025`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        const body = response.body;
        expect(body).to.have.property('year');
        expect(body.year).to.eq(2025);
        expect(body).to.have.property('assets');
        expect(body).to.have.property('totalEstimatedCost');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // KPI — Contract Integration
  // ═══════════════════════════════════════════════════════════════════════════

  describe('KPI Dashboard — Contract Integration', () => {
    it('[CONTRACT] KPI endpoint returns complete contract data', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/kpi`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        const kpi = response.body;
        
        // Verify all KPI contract fields
        expect(kpi).to.have.property('tenantId');
        expect(kpi).to.have.property('totalAssets');
        expect(kpi).to.have.property('totalAcquisitionCost');
        expect(kpi).to.have.property('totalNetBookValue');
        expect(kpi).to.have.property('totalAccumulatedDepreciation');
        expect(kpi).to.have.property('averageAge');
        expect(kpi).to.have.property('byStatus');
        expect(kpi).to.have.property('byCategory');
        expect(kpi).to.have.property('currency');
        
        // Verify byStatus structure
        expect(kpi.byStatus).to.have.property('inService');
        expect(kpi.byStatus).to.have.property('disposed');
        expect(kpi.byStatus).to.have.property('scrapped');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-TENANT — Contract Enforcement
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Multi-Tenant Isolation — Contract Enforcement', () => {
    it('[CONTRACT] Missing X-Tenant-Id returns 401/403', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/assets`,
        headers: {
          'Authorization': 'Bearer test-token',
          // No X-Tenant-Id
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });

    it('[CONTRACT] Different tenants see isolated data', () => {
      const tenant1 = 'tenant-e2e-001';
      const tenant2 = 'tenant-e2e-002';
      
      // Get data for tenant 1
      cy.request({
        url: `${API_BASE}/immobilisation/assets`,
        headers: {
          'X-Tenant-Id': tenant1,
          'Authorization': 'Bearer test-token',
        },
      }).then((response1) => {
        // Get data for tenant 2
        cy.request({
          url: `${API_BASE}/immobilisation/assets`,
          headers: {
            'X-Tenant-Id': tenant2,
            'Authorization': 'Bearer test-token',
          },
        }).then((response2) => {
          expect(response1.status).to.eq(200);
          expect(response2.status).to.eq(200);
          
          // Both responses should be valid contract shapes
          expect(response1.body).to.have.property('items');
          expect(response2.body).to.have.property('items');
          
          // Tenant isolation: items from tenant1 should not have tenant2's data
          response1.body.items.forEach((item) => {
            expect(item.tenantId).to.eq(tenant1);
          });
          
          response2.body.items.forEach((item) => {
            expect(item.tenantId).to.eq(tenant2);
          });
        });
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING — Contract Enforcement
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Error Responses — Contract Enforcement', () => {
    it('[CONTRACT] 400 response for invalid period format', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/depreciation/summary?period=invalid`,
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message');
      });
    });

    it('[CONTRACT] 400 response for missing required params', () => {
      cy.request({
        url: `${API_BASE}/immobilisation/depreciation/summary`,
        // Missing required 'period' param
        headers: {
          'X-Tenant-Id': TEST_TENANT,
          'Authorization': 'Bearer test-token',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TEST METADATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @contractVersion 1.0.0
 * @module immobilisation
 * @testType e2e-contract
 * 
 * SPOFE E2E Contract Test Rules:
 * 1. Real frontend + real backend — NO MOCKS
 * 2. Focus on contract integrity, not UI behavior
 * 3. Verify HTTP shapes match OpenAPI exactly
 * 4. Test failures block CI/CD deployment
 */
