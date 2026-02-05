# BUILD_PROOF.md

**Module:** immobilisation  
**Status:** 🔴 ERROR  
**Generated:** 2026-02-02T11:26:19.259Z  
**Commit:** 39a08a7f08e9967b9b006908b1cd08d8cd9ba04e  
**Branch:** master  
**SPOFE Rules:** v1.1.0

## 🎯 VALIDATION SUMMARY

- **Total Validations:** 5
- **Successful:** 3
- **Failed:** 2
- **Overall Status:** ERROR

## 🏗️ ENVIRONMENT

- **Node.js:** v24.12.0
- **Platform:** win32 (x64)
- **Working Directory:** C:\Users\henry\Desktop\SPOFE-APP VERS 1.0

## 🔍 VALIDATION RESULTS

### ✅ npx tsc --noEmit (2409ms)

**Timestamp:** 2026-02-02T11:25:59.248Z  
**Status:** SUCCESS

```

```

### ✅ npm run build

**Timestamp:** 2026-02-02T11:25:59.250Z  
**Status:** SUCCESS

```
No build script configured - validation skipped
```

### ❌ npm test (19267ms)

**Timestamp:** 2026-02-02T11:26:18.518Z  
**Status:** FAILED

```
Command failed: npm test
PASS cascade/modules/cost-structure/guardian/cost-structure.guardian.spec.ts (5.443 s)
PASS cascade/modules/cost-structure/tests/contract/coutflex-budget.contract.spec.ts (5.42 s)
PASS cascade/modules/immobilisation/guardian/immobilisation.guardian.spec.ts (5.944 s)
FAIL tests/unit/guardianHttpMap.test.ts (6.783 s)
  ● Guardian HTTP Mapping › Lookup Performance › should retrieve mapping by code in O(1)

    expect(received).toBeLessThan(expected)

    Expected: < 100
    Received:   1213.4582

    [0m [90m 153 |[39m       
     [90m 154 |[39m       [36mconst[39m duration [33m=[39m performance[33m.[39mnow() [33m-[39m startTime[33m;[39m
    [31m[1m>[22m[39m[90m 155 |[39m       expect(duration)[33m.[39mtoBeLessThan([35m100[39m)[33m;[39m [90m// Should be very fast[39m
     [90m     |[39m                        [31m[1m^[22m[39m
     [90m 156 |[39m     })[33m;[39m
     [90m 157 |[39m
     [90m 158 |[39m     test([32m'should handle unknown codes gracefully'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.<anonymous> (tests/unit/guardianHttpMap.test.ts:155:24)

FAIL cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts (6.822 s)
  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should return ONLY VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return VALIDATED projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return SIMULATED projects (even if viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return DRAFT projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should expose all required fields for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should provide accurate cost data for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should ensure FROZEN structure exists

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget creates engagement from cost-structure project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget rejects project with negative margin at 70%

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget waits for project validation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_projects directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_simulation_results directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should trigger Budget integration after ProjectValidated event

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should NOT trigger Budget integration for non-viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

PASS tests/unit/guardianError.test.ts (6.904 s)
PASS tests/integration/guardian-http-mapping.test.ts (6.828 s)
PASS cascade/modules/immobilisation/tests/unit/guardian.unit.spec.ts (7.143 s)
FAIL cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts (7.818 s)
  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return projects list for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by status

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by type

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return 400 without X-Tenant-Id header

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return FROZEN cost structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return 404 for project without FROZEN structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should return cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return simulation results

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return 404 for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return 404 for project without decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should return ONLY VALIDATED + FROZEN + viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return project history

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return 404 for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts (7.841 s)
  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-01: rm_cost_projects_budget_ready never exposes projects failing COUT-01

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-02: rm_cost_projects_budget_ready exposes only FROZEN cost structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-03: rm_cost_projects_budget_ready exposes only VALIDATED projects

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-04: rm_cost_projects_budget_ready exposes only versioned structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-05: rm_cost_projects_budget_ready respects tenant isolation

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-06: rm_cost_projects_budget_ready exposes all contract fields

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-07: exposed data is immutable (read-only)

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts (8.222 s)
  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should enforce tenant isolation (RLS)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should find project by ID

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should return null for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return FROZEN structure for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return null for DRAFT structure (project 2)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 1 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 2 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should enforce tenant isolation on cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 2 (not viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should NOT return results for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return decisions for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return empty array for project without decisions

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should return only VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should enforce tenant isolation on budget-ready projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should enforce RLS across all read-models

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should allow each tenant to see only their own data

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

FAIL cascade/modules/immobilisation/tests/integration/record-maintenance.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/record-depreciation.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/create-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/multi-tenant.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/e2e/multi-tenant-rls.e2e.spec.ts
  ● Test suite failed to run

    Your test suite must contain at least one test.

      at onResult (node_modules/jest/node_modules/@jest/core/build/index.js:1057:18)
      at node_modules/emittery/index.js:363:13
          at Array.map (<anonymous>)
      at Emittery.emit (node_modules/emittery/index.js:361:23)

FAIL cascade/modules/immobilisation/tests/integration/dispose-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m280[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m280[0m         customerPaymentTerm: { days: 30 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.
    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m281[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m281[0m         supplierPaymentTerm: { days: 60 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.

FAIL cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeEach[33m,[39m beforeAll } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m [36mimport[39m { createTestContext[33m,[39m [33mTestData[39m[33m,[39m [33mScenarios[39m[33m,[39m type [33mTestContext[39m } [36mfrom[39m [32m'./fixtures/test-context.js'[39m[33m;[39m
     [90m 16 |[39m [36mimport[39m { [33mInvariantViolationError[39m } [36mfrom[39m [32m'../../domain/guardian/cost-structure.guardian.js'[39m[33m;[39m
     [90m 17 |[39m [36mimport[39m type {[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.renewal.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.security.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts[0m:[93m9[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m9[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.maintenance.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/contract/immobilisation.openapi.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m35[0m:[93m14[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m35[0m export const OPENAPI_SPEC_PATH = path.resolve(
    [7m  [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m58[0m:[93m12[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m58[0m export let openAPISpec: object;
    [7m  [0m [91m           ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeAll[33m,[39m vi } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m
     [90m 16 |[39m [90m// ═══════════════════════════════════════════════════════════════════════════════[39m
     [90m 17 |[39m [90m// MOCK TYPES (Based on Cost-Structure OpenAPI)[39m[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.kpi.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/contract/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/contract/budget-contract.spec.ts[0m:[93m12[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m12[0m import type { BudgetReadyProjectReadModel } from '../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/write-side.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/write-side.spec.ts[0m:[93m8[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m8[0m import { describe, it, expect, beforeEach } from '@jest/globals';
    [7m [0m [91m                                                 ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/test/integration/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/budget-contract.spec.ts[0m:[93m11[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m11[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m  [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts[0m:[93m42[0m:[93m5[0m - [91merror[0m[90m TS2322: [0mType 'TestAgent<Test>' is not assignable to type 'SuperTest<Test>'.
      Type 'TestAgent<Test>' is not assignable to type 'RequestMethods<Test>'.
        Types of property 'ACL' are incompatible.
          Type '(url: string) => Test' is not assignable to type 'HttpMethod<Test>'.
            Type '(url: string) => Test' is not assignable to type '(url: URLType, callback?: CBHandler | undefined) => Test'.
              Types of parameters 'url' and 'url' are incompatible.
                Type 'URLType' is not assignable to type 'string'.
                  Type 'URL' is not assignable to type 'string'.

    [7m42[0m     http = request(app.getHttpServer());
    [7m  [0m [91m    ~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.depreciation.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts[0m:[93m13[0m:[93m46[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m13[0m import { CostStructureQueryRepository } from '../../../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m1[0m:[93m23[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/db' or its corresponding type declarations.

    [7m1[0m import { query } from '../infrastructure/db'
    [7m [0m [91m                      ~~~~~~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m2[0m:[93m34[0m - [91merror[0m[90m TS2307: [0mCannot find module '../test-utils/tenant' or its corresponding type declarations.

    [7m2[0m import { setTenantContext } from '../test-utils/tenant'
    [7m [0m [91m                                 ~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/UpdateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m195[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m195[0m       expect(event.payload.type).toBe('AggregateUpdated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m206[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m206[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m219[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m219[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m230[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m230[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m264[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m264[0m       expect(fact.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m277[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m277[0m       expect(snapshot.payload.data).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m327[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot1.payload' is of type 'unknown'.

    [7m327[0m       expect(snapshot1.payload.data).toEqual(changes1);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m328[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot2.payload' is of type 'unknown'.

    [7m328[0m       expect(snapshot2.payload.data).toEqual(changes2);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m441[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m441[0m       expect(event.payload.changes).toEqual({ name: 'Updated' });
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m458[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m458[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m477[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m477[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m492[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m492[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m503[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m503[0m       expect(event.payload.changes).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m45[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m                                            ~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/guardian.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/guardian.spec.ts[0m:[93m166[0m:[93m58[0m - [91merror[0m[90m TS2345: [0mArgument of type 'number | undefined' is not assignable to parameter of type 'number | bigint'.
      Type 'undefined' is not assignable to type 'number | bigint'.

    [7m166[0m       expect(scenarios?.pessimistic.margin).toBeLessThan(scenarios?.optimistic.margin);
    [7m   [0m [91m                                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/integration/guardian-db.spec.ts
  ● Test suite failed to run

    [96mtests/integration/guardian-db.spec.ts[0m:[93m36[0m:[93m36[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../src/application/decision/TransactionManager' or its corresponding type declarations.

    [7m36[0m import { TransactionManager } from '../../src/application/decision/TransactionManager';
    [7m  [0m [91m                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/CreateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m207[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m207[0m       expect(event.payload.type).toBe('AggregateCreated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m218[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m218[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m229[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m229[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m276[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'existsFact.payload' is of type 'unknown'.

    [7m276[0m       expect(existsFact.payload.type).toBe('AggregateExists');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m290[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m290[0m       expect(snapshot.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m292[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m292[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m315[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m315[0m         expect(fact.payload.validFrom).toBeDefined();
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m316[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m316[0m         expect(fact.payload.validFrom).toMatch(
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m518[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m518[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m529[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m529[0m       expect(snapshot.payload.data).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m551[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m551[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.assets.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
Summary of all failing tests
FAIL tests/unit/guardianHttpMap.test.ts (6.783 s)
  ● Guardian HTTP Mapping › Lookup Performance › should retrieve mapping by code in O(1)

    expect(received).toBeLessThan(expected)

    Expected: < 100
    Received:   1213.4582

    [0m [90m 153 |[39m       
     [90m 154 |[39m       [36mconst[39m duration [33m=[39m performance[33m.[39mnow() [33m-[39m startTime[33m;[39m
    [31m[1m>[22m[39m[90m 155 |[39m       expect(duration)[33m.[39mtoBeLessThan([35m100[39m)[33m;[39m [90m// Should be very fast[39m
     [90m     |[39m                        [31m[1m^[22m[39m
     [90m 156 |[39m     })[33m;[39m
     [90m 157 |[39m
     [90m 158 |[39m     test([32m'should handle unknown codes gracefully'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.<anonymous> (tests/unit/guardianHttpMap.test.ts:155:24)

FAIL cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts (6.822 s)
  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should return ONLY VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return VALIDATED projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return SIMULATED projects (even if viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return DRAFT projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should expose all required fields for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should provide accurate cost data for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should ensure FROZEN structure exists

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget creates engagement from cost-structure project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget rejects project with negative margin at 70%

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget waits for project validation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_projects directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_simulation_results directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should trigger Budget integration after ProjectValidated event

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should NOT trigger Budget integration for non-viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

FAIL cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts (7.818 s)
  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return projects list for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by status

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by type

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return 400 without X-Tenant-Id header

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return FROZEN cost structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return 404 for project without FROZEN structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should return cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return simulation results

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return 404 for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return 404 for project without decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should return ONLY VALIDATED + FROZEN + viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return project history

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return 404 for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts (7.841 s)
  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-01: rm_cost_projects_budget_ready never exposes projects failing COUT-01

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-02: rm_cost_projects_budget_ready exposes only FROZEN cost structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-03: rm_cost_projects_budget_ready exposes only VALIDATED projects

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-04: rm_cost_projects_budget_ready exposes only versioned structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-05: rm_cost_projects_budget_ready respects tenant isolation

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-06: rm_cost_projects_budget_ready exposes all contract fields

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-07: exposed data is immutable (read-only)

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts (8.222 s)
  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should enforce tenant isolation (RLS)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should find project by ID

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should return null for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return FROZEN structure for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return null for DRAFT structure (project 2)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 1 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 2 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should enforce tenant isolation on cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 2 (not viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should NOT return results for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return decisions for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return empty array for project without decisions

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should return only VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should enforce tenant isolation on budget-ready projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should enforce RLS across all read-models

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should allow each tenant to see only their own data

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

FAIL cascade/modules/immobilisation/tests/integration/record-maintenance.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/record-depreciation.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/create-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/multi-tenant.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/e2e/multi-tenant-rls.e2e.spec.ts
  ● Test suite failed to run

    Your test suite must contain at least one test.

      at onResult (node_modules/jest/node_modules/@jest/core/build/index.js:1057:18)
      at node_modules/emittery/index.js:363:13
          at Array.map (<anonymous>)
      at Emittery.emit (node_modules/emittery/index.js:361:23)

FAIL cascade/modules/immobilisation/tests/integration/dispose-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m280[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m280[0m         customerPaymentTerm: { days: 30 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.
    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m281[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m281[0m         supplierPaymentTerm: { days: 60 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.

FAIL cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeEach[33m,[39m beforeAll } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m [36mimport[39m { createTestContext[33m,[39m [33mTestData[39m[33m,[39m [33mScenarios[39m[33m,[39m type [33mTestContext[39m } [36mfrom[39m [32m'./fixtures/test-context.js'[39m[33m;[39m
     [90m 16 |[39m [36mimport[39m { [33mInvariantViolationError[39m } [36mfrom[39m [32m'../../domain/guardian/cost-structure.guardian.js'[39m[33m;[39m
     [90m 17 |[39m [36mimport[39m type {[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.renewal.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.security.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts[0m:[93m9[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m9[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.maintenance.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/contract/immobilisation.openapi.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m35[0m:[93m14[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m35[0m export const OPENAPI_SPEC_PATH = path.resolve(
    [7m  [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m58[0m:[93m12[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m58[0m export let openAPISpec: object;
    [7m  [0m [91m           ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeAll[33m,[39m vi } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m
     [90m 16 |[39m [90m// ═══════════════════════════════════════════════════════════════════════════════[39m
     [90m 17 |[39m [90m// MOCK TYPES (Based on Cost-Structure OpenAPI)[39m[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.kpi.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/contract/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/contract/budget-contract.spec.ts[0m:[93m12[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m12[0m import type { BudgetReadyProjectReadModel } from '../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/write-side.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/write-side.spec.ts[0m:[93m8[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m8[0m import { describe, it, expect, beforeEach } from '@jest/globals';
    [7m [0m [91m                                                 ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/test/integration/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/budget-contract.spec.ts[0m:[93m11[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m11[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m  [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts[0m:[93m42[0m:[93m5[0m - [91merror[0m[90m TS2322: [0mType 'TestAgent<Test>' is not assignable to type 'SuperTest<Test>'.
      Type 'TestAgent<Test>' is not assignable to type 'RequestMethods<Test>'.
        Types of property 'ACL' are incompatible.
          Type '(url: string) => Test' is not assignable to type 'HttpMethod<Test>'.
            Type '(url: string) => Test' is not assignable to type '(url: URLType, callback?: CBHandler | undefined) => Test'.
              Types of parameters 'url' and 'url' are incompatible.
                Type 'URLType' is not assignable to type 'string'.
                  Type 'URL' is not assignable to type 'string'.

    [7m42[0m     http = request(app.getHttpServer());
    [7m  [0m [91m    ~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.depreciation.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts[0m:[93m13[0m:[93m46[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m13[0m import { CostStructureQueryRepository } from '../../../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m1[0m:[93m23[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/db' or its corresponding type declarations.

    [7m1[0m import { query } from '../infrastructure/db'
    [7m [0m [91m                      ~~~~~~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m2[0m:[93m34[0m - [91merror[0m[90m TS2307: [0mCannot find module '../test-utils/tenant' or its corresponding type declarations.

    [7m2[0m import { setTenantContext } from '../test-utils/tenant'
    [7m [0m [91m                                 ~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/UpdateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m195[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m195[0m       expect(event.payload.type).toBe('AggregateUpdated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m206[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m206[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m219[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m219[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m230[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m230[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m264[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m264[0m       expect(fact.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m277[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m277[0m       expect(snapshot.payload.data).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m327[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot1.payload' is of type 'unknown'.

    [7m327[0m       expect(snapshot1.payload.data).toEqual(changes1);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m328[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot2.payload' is of type 'unknown'.

    [7m328[0m       expect(snapshot2.payload.data).toEqual(changes2);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m441[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m441[0m       expect(event.payload.changes).toEqual({ name: 'Updated' });
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m458[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m458[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m477[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m477[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m492[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m492[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m503[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m503[0m       expect(event.payload.changes).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m45[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m                                            ~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/guardian.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/guardian.spec.ts[0m:[93m166[0m:[93m58[0m - [91merror[0m[90m TS2345: [0mArgument of type 'number | undefined' is not assignable to parameter of type 'number | bigint'.
      Type 'undefined' is not assignable to type 'number | bigint'.

    [7m166[0m       expect(scenarios?.pessimistic.margin).toBeLessThan(scenarios?.optimistic.margin);
    [7m   [0m [91m                                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/integration/guardian-db.spec.ts
  ● Test suite failed to run

    [96mtests/integration/guardian-db.spec.ts[0m:[93m36[0m:[93m36[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../src/application/decision/TransactionManager' or its corresponding type declarations.

    [7m36[0m import { TransactionManager } from '../../src/application/decision/TransactionManager';
    [7m  [0m [91m                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/CreateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m207[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m207[0m       expect(event.payload.type).toBe('AggregateCreated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m218[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m218[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m229[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m229[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m276[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'existsFact.payload' is of type 'unknown'.

    [7m276[0m       expect(existsFact.payload.type).toBe('AggregateExists');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m290[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m290[0m       expect(snapshot.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m292[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m292[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m315[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m315[0m         expect(fact.payload.validFrom).toBeDefined();
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m316[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m316[0m         expect(fact.payload.validFrom).toMatch(
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m518[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m518[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m529[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m529[0m       expect(snapshot.payload.data).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m551[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m551[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.assets.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'


Test Suites: 32 failed, 6 passed, 38 total
Tests:       62 failed, 138 passed, 200 total
Snapshots:   0 total
Time:        18.043 s, estimated 20 s
Ran all test suites.

> spofe-app@2.1.0 test
> jest

PASS cascade/modules/cost-structure/guardian/cost-structure.guardian.spec.ts (5.443 s)
PASS cascade/modules/cost-structure/tests/contract/coutflex-budget.contract.spec.ts (5.42 s)
PASS cascade/modules/immobilisation/guardian/immobilisation.guardian.spec.ts (5.944 s)
FAIL tests/unit/guardianHttpMap.test.ts (6.783 s)
  ● Guardian HTTP Mapping › Lookup Performance › should retrieve mapping by code in O(1)

    expect(received).toBeLessThan(expected)

    Expected: < 100
    Received:   1213.4582

    [0m [90m 153 |[39m       
     [90m 154 |[39m       [36mconst[39m duration [33m=[39m performance[33m.[39mnow() [33m-[39m startTime[33m;[39m
    [31m[1m>[22m[39m[90m 155 |[39m       expect(duration)[33m.[39mtoBeLessThan([35m100[39m)[33m;[39m [90m// Should be very fast[39m
     [90m     |[39m                        [31m[1m^[22m[39m
     [90m 156 |[39m     })[33m;[39m
     [90m 157 |[39m
     [90m 158 |[39m     test([32m'should handle unknown codes gracefully'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.<anonymous> (tests/unit/guardianHttpMap.test.ts:155:24)

FAIL cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts (6.822 s)
  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should return ONLY VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return VALIDATED projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return SIMULATED projects (even if viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return DRAFT projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should expose all required fields for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should provide accurate cost data for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should ensure FROZEN structure exists

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget creates engagement from cost-structure project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget rejects project with negative margin at 70%

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget waits for project validation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_projects directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_simulation_results directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should trigger Budget integration after ProjectValidated event

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should NOT trigger Budget integration for non-viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

PASS tests/unit/guardianError.test.ts (6.904 s)
PASS tests/integration/guardian-http-mapping.test.ts (6.828 s)
PASS cascade/modules/immobilisation/tests/unit/guardian.unit.spec.ts (7.143 s)
FAIL cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts (7.818 s)
  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return projects list for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by status

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by type

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return 400 without X-Tenant-Id header

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return FROZEN cost structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return 404 for project without FROZEN structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should return cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return simulation results

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return 404 for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return 404 for project without decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should return ONLY VALIDATED + FROZEN + viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return project history

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return 404 for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts (7.841 s)
  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-01: rm_cost_projects_budget_ready never exposes projects failing COUT-01

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-02: rm_cost_projects_budget_ready exposes only FROZEN cost structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-03: rm_cost_projects_budget_ready exposes only VALIDATED projects

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-04: rm_cost_projects_budget_ready exposes only versioned structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-05: rm_cost_projects_budget_ready respects tenant isolation

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-06: rm_cost_projects_budget_ready exposes all contract fields

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-07: exposed data is immutable (read-only)

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts (8.222 s)
  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should enforce tenant isolation (RLS)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should find project by ID

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should return null for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return FROZEN structure for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return null for DRAFT structure (project 2)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 1 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 2 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should enforce tenant isolation on cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 2 (not viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should NOT return results for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return decisions for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return empty array for project without decisions

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should return only VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should enforce tenant isolation on budget-ready projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should enforce RLS across all read-models

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should allow each tenant to see only their own data

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

FAIL cascade/modules/immobilisation/tests/integration/record-maintenance.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/record-depreciation.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/create-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/multi-tenant.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/e2e/multi-tenant-rls.e2e.spec.ts
  ● Test suite failed to run

    Your test suite must contain at least one test.

      at onResult (node_modules/jest/node_modules/@jest/core/build/index.js:1057:18)
      at node_modules/emittery/index.js:363:13
          at Array.map (<anonymous>)
      at Emittery.emit (node_modules/emittery/index.js:361:23)

FAIL cascade/modules/immobilisation/tests/integration/dispose-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m280[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m280[0m         customerPaymentTerm: { days: 30 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.
    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m281[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m281[0m         supplierPaymentTerm: { days: 60 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.

FAIL cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeEach[33m,[39m beforeAll } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m [36mimport[39m { createTestContext[33m,[39m [33mTestData[39m[33m,[39m [33mScenarios[39m[33m,[39m type [33mTestContext[39m } [36mfrom[39m [32m'./fixtures/test-context.js'[39m[33m;[39m
     [90m 16 |[39m [36mimport[39m { [33mInvariantViolationError[39m } [36mfrom[39m [32m'../../domain/guardian/cost-structure.guardian.js'[39m[33m;[39m
     [90m 17 |[39m [36mimport[39m type {[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.renewal.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.security.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts[0m:[93m9[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m9[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.maintenance.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/contract/immobilisation.openapi.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m35[0m:[93m14[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m35[0m export const OPENAPI_SPEC_PATH = path.resolve(
    [7m  [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m58[0m:[93m12[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m58[0m export let openAPISpec: object;
    [7m  [0m [91m           ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeAll[33m,[39m vi } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m
     [90m 16 |[39m [90m// ═══════════════════════════════════════════════════════════════════════════════[39m
     [90m 17 |[39m [90m// MOCK TYPES (Based on Cost-Structure OpenAPI)[39m[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.kpi.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/contract/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/contract/budget-contract.spec.ts[0m:[93m12[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m12[0m import type { BudgetReadyProjectReadModel } from '../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/write-side.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/write-side.spec.ts[0m:[93m8[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m8[0m import { describe, it, expect, beforeEach } from '@jest/globals';
    [7m [0m [91m                                                 ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/test/integration/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/budget-contract.spec.ts[0m:[93m11[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m11[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m  [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts[0m:[93m42[0m:[93m5[0m - [91merror[0m[90m TS2322: [0mType 'TestAgent<Test>' is not assignable to type 'SuperTest<Test>'.
      Type 'TestAgent<Test>' is not assignable to type 'RequestMethods<Test>'.
        Types of property 'ACL' are incompatible.
          Type '(url: string) => Test' is not assignable to type 'HttpMethod<Test>'.
            Type '(url: string) => Test' is not assignable to type '(url: URLType, callback?: CBHandler | undefined) => Test'.
              Types of parameters 'url' and 'url' are incompatible.
                Type 'URLType' is not assignable to type 'string'.
                  Type 'URL' is not assignable to type 'string'.

    [7m42[0m     http = request(app.getHttpServer());
    [7m  [0m [91m    ~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.depreciation.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts[0m:[93m13[0m:[93m46[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m13[0m import { CostStructureQueryRepository } from '../../../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m1[0m:[93m23[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/db' or its corresponding type declarations.

    [7m1[0m import { query } from '../infrastructure/db'
    [7m [0m [91m                      ~~~~~~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m2[0m:[93m34[0m - [91merror[0m[90m TS2307: [0mCannot find module '../test-utils/tenant' or its corresponding type declarations.

    [7m2[0m import { setTenantContext } from '../test-utils/tenant'
    [7m [0m [91m                                 ~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/UpdateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m195[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m195[0m       expect(event.payload.type).toBe('AggregateUpdated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m206[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m206[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m219[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m219[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m230[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m230[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m264[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m264[0m       expect(fact.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m277[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m277[0m       expect(snapshot.payload.data).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m327[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot1.payload' is of type 'unknown'.

    [7m327[0m       expect(snapshot1.payload.data).toEqual(changes1);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m328[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot2.payload' is of type 'unknown'.

    [7m328[0m       expect(snapshot2.payload.data).toEqual(changes2);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m441[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m441[0m       expect(event.payload.changes).toEqual({ name: 'Updated' });
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m458[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m458[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m477[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m477[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m492[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m492[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m503[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m503[0m       expect(event.payload.changes).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m45[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m                                            ~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/guardian.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/guardian.spec.ts[0m:[93m166[0m:[93m58[0m - [91merror[0m[90m TS2345: [0mArgument of type 'number | undefined' is not assignable to parameter of type 'number | bigint'.
      Type 'undefined' is not assignable to type 'number | bigint'.

    [7m166[0m       expect(scenarios?.pessimistic.margin).toBeLessThan(scenarios?.optimistic.margin);
    [7m   [0m [91m                                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/integration/guardian-db.spec.ts
  ● Test suite failed to run

    [96mtests/integration/guardian-db.spec.ts[0m:[93m36[0m:[93m36[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../src/application/decision/TransactionManager' or its corresponding type declarations.

    [7m36[0m import { TransactionManager } from '../../src/application/decision/TransactionManager';
    [7m  [0m [91m                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/CreateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m207[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m207[0m       expect(event.payload.type).toBe('AggregateCreated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m218[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m218[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m229[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m229[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m276[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'existsFact.payload' is of type 'unknown'.

    [7m276[0m       expect(existsFact.payload.type).toBe('AggregateExists');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m290[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m290[0m       expect(snapshot.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m292[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m292[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m315[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m315[0m         expect(fact.payload.validFrom).toBeDefined();
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m316[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m316[0m         expect(fact.payload.validFrom).toMatch(
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m518[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m518[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m529[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m529[0m       expect(snapshot.payload.data).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m551[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m551[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.assets.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
Summary of all failing tests
FAIL tests/unit/guardianHttpMap.test.ts (6.783 s)
  ● Guardian HTTP Mapping › Lookup Performance › should retrieve mapping by code in O(1)

    expect(received).toBeLessThan(expected)

    Expected: < 100
    Received:   1213.4582

    [0m [90m 153 |[39m       
     [90m 154 |[39m       [36mconst[39m duration [33m=[39m performance[33m.[39mnow() [33m-[39m startTime[33m;[39m
    [31m[1m>[22m[39m[90m 155 |[39m       expect(duration)[33m.[39mtoBeLessThan([35m100[39m)[33m;[39m [90m// Should be very fast[39m
     [90m     |[39m                        [31m[1m^[22m[39m
     [90m 156 |[39m     })[33m;[39m
     [90m 157 |[39m
     [90m 158 |[39m     test([32m'should handle unknown codes gracefully'[39m[33m,[39m () [33m=>[39m {[0m

      at Object.<anonymous> (tests/unit/guardianHttpMap.test.ts:155:24)

FAIL cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts (6.822 s)
  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should return ONLY VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return VALIDATED projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return SIMULATED projects (even if viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget-Ready Projects Filter › should NOT return DRAFT projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should expose all required fields for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should provide accurate cost data for Budget

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Contract Validation › should ensure FROZEN structure exists

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget creates engagement from cost-structure project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget rejects project with negative margin at 70%

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Integration Scenarios › Scenario: Budget waits for project validation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_projects directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Budget Cannot Access Other Views (Contract Enforcement) › Budget should NOT use rm_cost_simulation_results directly

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should trigger Budget integration after ProjectValidated event

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

  ● Cost-Structure → Budget Integration E2E › Event-Driven Integration (ProjectValidated) › should NOT trigger Budget integration for non-viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 32 |[39m
     [90m 33 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 35 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/budget-integration.e2e.spec.ts:34:5)

FAIL cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts (7.818 s)
  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return projects list for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by status

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should filter by type

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects › should return 400 without X-Tenant-Id header

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return FROZEN cost structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure › should return 404 for project without FROZEN structure

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should return cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/lines › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return simulation results

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/structure/:version/simulation › should return 404 for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/decision › should return 404 for project without decision

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should return ONLY VALIDATED + FROZEN + viable projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/budget-ready/projects (CONTRAT BUDGET) › should enforce tenant isolation

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return project history

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

  ● Cost-Structure Read API E2E › GET /api/cost-structure/projects/:projectId/history › should return 404 for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 34 |[39m
     [90m 35 |[39m   [36masync[39m [36mfunction[39m seedTestData() {
    [31m[1m>[22m[39m[90m 36 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 37 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 38 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 39 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at seedTestData (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:36:5)
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/api-get.e2e.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts (7.841 s)
  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-01: rm_cost_projects_budget_ready never exposes projects failing COUT-01

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-02: rm_cost_projects_budget_ready exposes only FROZEN cost structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-03: rm_cost_projects_budget_ready exposes only VALIDATED projects

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-04: rm_cost_projects_budget_ready exposes only versioned structures

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-05: rm_cost_projects_budget_ready respects tenant isolation

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-06: rm_cost_projects_budget_ready exposes all contract fields

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

  ● Contract Tests — Cost-Structure → Budget (Provider) › PCT-07: exposed data is immutable (read-only)

    SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string

    [0m [90m 26 |[39m   beforeEach([36masync[39m () [33m=>[39m {
     [90m 27 |[39m     [90m// Clean test data[39m
    [31m[1m>[22m[39m[90m 28 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 29 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 30 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m
     [90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects WHERE tenant_id = $1'[39m[33m,[39m [[32m'test-tenant'[39m])[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts:28:5)

FAIL cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts (8.222 s)
  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should list projects for tenant 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should enforce tenant isolation (RLS)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should find project by ID

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects - Liste des projets › should return null for non-existent project

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return FROZEN structure for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_current - Structure FROZEN courante › should return null for DRAFT structure (project 2)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 1 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should return cost lines for project 2 version 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_lines - Lignes de coût › should enforce tenant isolation on cost lines

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should return simulation results for project 2 (not viable)

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_simulation_results - Résultats de simulation › should NOT return results for non-simulated version

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return decisions for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_decisions - Décisions finales › should return empty array for project without decisions

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should return only VALIDATED projects with viable_at_70 = true

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return SIMULATED projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should NOT return projects with viable_at_70 = false

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_projects_budget_ready - Contrat Budget › should enforce tenant isolation on budget-ready projects

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 1

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › rm_cost_structure_summary - Résumé agrégé › should return aggregated summary for project 2

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should enforce RLS across all read-models

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

  ● Cost-Structure Read-Models E2E › Multi-tenant RLS validation › should allow each tenant to see only their own data

    error: authentification par mot de passe �chou�e pour l'utilisateur  � postgres �

    [0m [90m 29 |[39m
     [90m 30 |[39m     [90m// Clean up[39m
    [31m[1m>[22m[39m[90m 31 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM decision_records'[39m)[33m;[39m
     [90m    |[39m     [31m[1m^[22m[39m
     [90m 32 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_lines'[39m)[33m;[39m
     [90m 33 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM cost_structure_versions'[39m)[33m;[39m
     [90m 34 |[39m     [36mawait[39m db[33m.[39mquery([32m'DELETE FROM economic_projects'[39m)[33m;[39m[0m

      at cascade/modules/cost-structure/node_modules/pg-pool/index.js:45:11
      at Object.<anonymous> (cascade/modules/cost-structure/tests/e2e/read-models.e2e.spec.ts:31:5)

FAIL cascade/modules/immobilisation/tests/integration/record-maintenance.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/record-depreciation.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/create-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/integration/multi-tenant.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/e2e/multi-tenant-rls.e2e.spec.ts
  ● Test suite failed to run

    Your test suite must contain at least one test.

      at onResult (node_modules/jest/node_modules/@jest/core/build/index.js:1057:18)
      at node_modules/emittery/index.js:363:13
          at Array.map (<anonymous>)
      at Emittery.emit (node_modules/emittery/index.js:361:23)

FAIL cascade/modules/immobilisation/tests/integration/dispose-asset.integration.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m15[0m:[93m10[0m - [91merror[0m[90m TS2305: [0mModule '"../../domain/events"' has no exported member 'AssetCreated'.

    [7m15[0m import { AssetCreated, ImmobilisationEvent } from '../../domain/events';
    [7m  [0m [91m         ~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m142[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m142[0m         event.metadata.eventId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m143[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'eventType' does not exist on type 'ImmobilisationEvent'.
      Property 'eventType' does not exist on type 'AssetCreatedEvent'.

    [7m143[0m         event.eventType,
    [7m   [0m [91m              ~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m144[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m144[0m         (event.payload as any).tenantId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m145[0m:[93m16[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m145[0m         (event.payload as any).assetId,
    [7m   [0m [91m               ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m146[0m:[93m30[0m - [91merror[0m[90m TS2339: [0mProperty 'payload' does not exist on type 'ImmobilisationEvent'.
      Property 'payload' does not exist on type 'AssetCreatedEvent'.

    [7m146[0m         JSON.stringify(event.payload),
    [7m   [0m [91m                             ~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m147[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m147[0m         event.metadata.correlationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m148[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m148[0m         event.metadata.causationId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m149[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m149[0m         event.metadata.actorId,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m150[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m150[0m         event.metadata.timestamp,
    [7m   [0m [91m              ~~~~~~~~[0m
    [96mcascade/modules/immobilisation/write/repository/asset.pg.repository.ts[0m:[93m151[0m:[93m15[0m - [91merror[0m[90m TS2339: [0mProperty 'metadata' does not exist on type 'ImmobilisationEvent'.
      Property 'metadata' does not exist on type 'AssetCreatedEvent'.

    [7m151[0m         event.metadata.version,
    [7m   [0m [91m              ~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m280[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m280[0m         customerPaymentTerm: { days: 30 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.
    [96mcascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts[0m:[93m281[0m:[93m9[0m - [91merror[0m[90m TS2741: [0mProperty 'equals' is missing in type '{ days: number; }' but required in type 'PaymentTerm'.

    [7m281[0m         supplierPaymentTerm: { days: 60 },
    [7m   [0m [91m        ~~~~~~~~~~~~~~~~~~~[0m

      [96mcascade/modules/budgeting/domain/value-objects.ts[0m:[93m83[0m:[93m3[0m
        [7m83[0m   equals(other: PaymentTerm): boolean {
        [7m  [0m [96m  ~~~~~~[0m
        'equals' is declared here.

FAIL cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeEach[33m,[39m beforeAll } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m [36mimport[39m { createTestContext[33m,[39m [33mTestData[39m[33m,[39m [33mScenarios[39m[33m,[39m type [33mTestContext[39m } [36mfrom[39m [32m'./fixtures/test-context.js'[39m[33m;[39m
     [90m 16 |[39m [36mimport[39m { [33mInvariantViolationError[39m } [36mfrom[39m [32m'../../domain/guardian/cost-structure.guardian.js'[39m[33m;[39m
     [90m 17 |[39m [36mimport[39m type {[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/cost-structure/test/integration/cost-structure.write.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.renewal.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.security.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/invariants.table-driven.spec.ts[0m:[93m9[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m9[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.maintenance.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/immobilisation/tests/contract/immobilisation.openapi.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m35[0m:[93m14[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m35[0m export const OPENAPI_SPEC_PATH = path.resolve(
    [7m  [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m58[0m:[93m12[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m58[0m export let openAPISpec: object;
    [7m  [0m [91m           ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m425[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'openAPISpec'.

    [7m425[0m   openAPISpec,
    [7m   [0m [91m  ~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2323: [0mCannot redeclare exported variable 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/immobilisation/tests/contract/setup.contract.ts[0m:[93m426[0m:[93m3[0m - [91merror[0m[90m TS2484: [0mExport declaration conflicts with exported declaration of 'OPENAPI_SPEC_PATH'.

    [7m426[0m   OPENAPI_SPEC_PATH,
    [7m   [0m [91m  ~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    Vitest cannot be imported in a CommonJS module using require(). Please use "import" instead.

    If you are using "import" in your source code, then it's possible it was bundled into require() automatically by your bundler. In that case, do not bundle CommonJS output since it will never work with Vitest, or use dynamic import() which is available in all CommonJS modules.

    [0m [90m 12 |[39m [90m */[39m
     [90m 13 |[39m
    [31m[1m>[22m[39m[90m 14 |[39m [36mimport[39m { describe[33m,[39m it[33m,[39m expect[33m,[39m beforeAll[33m,[39m vi } [36mfrom[39m [32m'vitest'[39m[33m;[39m
     [90m    |[39m [31m[1m^[22m[39m
     [90m 15 |[39m
     [90m 16 |[39m [90m// ═══════════════════════════════════════════════════════════════════════════════[39m
     [90m 17 |[39m [90m// MOCK TYPES (Based on Cost-Structure OpenAPI)[39m[0m

      at Object.<anonymous> (node_modules/vitest/index.cjs:1:7)
      at Object.<anonymous> (cascade/modules/budget/contract-tests/cost-structure.contract.spec.ts:14:1)

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.kpi.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/contract/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/contract/budget-contract.spec.ts[0m:[93m12[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m12[0m import type { BudgetReadyProjectReadModel } from '../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/write-side.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/write-side.spec.ts[0m:[93m8[0m:[93m50[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m8[0m import { describe, it, expect, beforeEach } from '@jest/globals';
    [7m [0m [91m                                                 ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/test/integration/budget-contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/integration/budget-contract.spec.ts[0m:[93m11[0m:[93m61[0m - [91merror[0m[90m TS2307: [0mCannot find module '@jest/globals' or its corresponding type declarations.

    [7m11[0m import { describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
    [7m  [0m [91m                                                            ~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts[0m:[93m42[0m:[93m5[0m - [91merror[0m[90m TS2322: [0mType 'TestAgent<Test>' is not assignable to type 'SuperTest<Test>'.
      Type 'TestAgent<Test>' is not assignable to type 'RequestMethods<Test>'.
        Types of property 'ACL' are incompatible.
          Type '(url: string) => Test' is not assignable to type 'HttpMethod<Test>'.
            Type '(url: string) => Test' is not assignable to type '(url: URLType, callback?: CBHandler | undefined) => Test'.
              Types of parameters 'url' and 'url' are incompatible.
                Type 'URLType' is not assignable to type 'string'.
                  Type 'URL' is not assignable to type 'string'.

    [7m42[0m     http = request(app.getHttpServer());
    [7m  [0m [91m    ~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.depreciation.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'

FAIL cascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/test/e2e/query-repository.e2e.spec.ts[0m:[93m13[0m:[93m46[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../../infrastructure/cost-structure.query.repository.js' or its corresponding type declarations.

    [7m13[0m import { CostStructureQueryRepository } from '../../../infrastructure/cost-structure.query.repository.js';
    [7m  [0m [91m                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m1[0m:[93m23[0m - [91merror[0m[90m TS2307: [0mCannot find module '../infrastructure/db' or its corresponding type declarations.

    [7m1[0m import { query } from '../infrastructure/db'
    [7m [0m [91m                      ~~~~~~~~~~~~~~~~~~~~~~[0m
    [96mcascade/modules/cost-structure/contract-tests/budget-readiness.spec.ts[0m:[93m2[0m:[93m34[0m - [91merror[0m[90m TS2307: [0mCannot find module '../test-utils/tenant' or its corresponding type declarations.

    [7m2[0m import { setTenantContext } from '../test-utils/tenant'
    [7m [0m [91m                                 ~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/UpdateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m195[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m195[0m       expect(event.payload.type).toBe('AggregateUpdated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m206[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m206[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m219[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m219[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m230[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m230[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m264[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m264[0m       expect(fact.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m277[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m277[0m       expect(snapshot.payload.data).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m327[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot1.payload' is of type 'unknown'.

    [7m327[0m       expect(snapshot1.payload.data).toEqual(changes1);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m328[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot2.payload' is of type 'unknown'.

    [7m328[0m       expect(snapshot2.payload.data).toEqual(changes2);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m441[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m441[0m       expect(event.payload.changes).toEqual({ name: 'Updated' });
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m458[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m458[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m477[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m477[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m492[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m492[0m       expect(event.payload.changes).toEqual(changes);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m503[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m503[0m       expect(event.payload.changes).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/UpdateAggregateCommand.test.ts[0m:[93m573[0m:[93m45[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m573[0m       expect(event.payload.occurredAt).toBe(fact.payload.validFrom);
    [7m   [0m [91m                                            ~~~~~~~~~~~~[0m

FAIL cascade/modules/cost-structure/tests/guardian.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/cost-structure/tests/guardian.spec.ts[0m:[93m166[0m:[93m58[0m - [91merror[0m[90m TS2345: [0mArgument of type 'number | undefined' is not assignable to parameter of type 'number | bigint'.
      Type 'undefined' is not assignable to type 'number | bigint'.

    [7m166[0m       expect(scenarios?.pessimistic.margin).toBeLessThan(scenarios?.optimistic.margin);
    [7m   [0m [91m                                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/integration/guardian-db.spec.ts
  ● Test suite failed to run

    [96mtests/integration/guardian-db.spec.ts[0m:[93m36[0m:[93m36[0m - [91merror[0m[90m TS2307: [0mCannot find module '../../src/application/decision/TransactionManager' or its corresponding type declarations.

    [7m36[0m import { TransactionManager } from '../../src/application/decision/TransactionManager';
    [7m  [0m [91m                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m

FAIL tests/unit/application/commands/CreateAggregateCommand.test.ts
  ● Test suite failed to run

    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m207[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m207[0m       expect(event.payload.type).toBe('AggregateCreated');
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m218[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m218[0m       expect(event.payload.aggregateId).toBe(validUuid.toLowerCase());
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m229[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m229[0m       expect(event.payload.occurredAt).toBeDefined();
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m231[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'event.payload' is of type 'unknown'.

    [7m231[0m       expect(event.payload.occurredAt).toMatch(
    [7m   [0m [91m             ~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m276[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'existsFact.payload' is of type 'unknown'.

    [7m276[0m       expect(existsFact.payload.type).toBe('AggregateExists');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m290[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m290[0m       expect(snapshot.payload.type).toBe('AggregateSnapshot');
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m292[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m292[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m315[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m315[0m         expect(fact.payload.validFrom).toBeDefined();
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m316[0m:[93m16[0m - [91merror[0m[90m TS18046: [0m'fact.payload' is of type 'unknown'.

    [7m316[0m         expect(fact.payload.validFrom).toMatch(
    [7m   [0m [91m               ~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m518[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m518[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m529[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m529[0m       expect(snapshot.payload.data).toEqual({});
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m
    [96mtests/unit/application/commands/CreateAggregateCommand.test.ts[0m:[93m551[0m:[93m14[0m - [91merror[0m[90m TS18046: [0m'snapshot.payload' is of type 'unknown'.

    [7m551[0m       expect(snapshot.payload.data).toEqual(data);
    [7m   [0m [91m             ~~~~~~~~~~~~~~~~[0m

FAIL cascade/modules/immobilisation/tests/e2e/immobilisation.assets.e2e.spec.ts
  ● Test suite failed to run

    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m105[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m105[0m       status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m110[0m:[93m69[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m110[0m     const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
    [7m   [0m [91m                                                                    ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m142[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AssetStatus | undefined'.
      Type 'string' is not assignable to type 'AssetStatus | undefined'.

    [7m142[0m       status: query.status,
    [7m   [0m [91m      ~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m344[0m:[93m12[0m
        [7m344[0m   readonly status?: AssetStatus;
        [7m   [0m [96m           ~~~~~~[0m
        The expected type comes from property 'status' which is declared here on type 'AssetFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m320[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m320[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'
    [96mcascade/modules/immobilisation/api/immobilisation.module.ts[0m:[93m329[0m:[93m7[0m - [91merror[0m[90m TS2322: [0mType 'string | undefined' is not assignable to type 'AllocationTargetType | undefined'.
      Type 'string' is not assignable to type 'AllocationTargetType | undefined'.

    [7m329[0m       targetType: query.targetType,
    [7m   [0m [91m      ~~~~~~~~~~[0m

      [96mcascade/modules/immobilisation/infrastructure/persistence/read-model.types.ts[0m:[93m355[0m:[93m12[0m
        [7m355[0m   readonly targetType?: AllocationTargetType;
        [7m   [0m [96m           ~~~~~~~~~~[0m
        The expected type comes from property 'targetType' which is declared here on type 'AllocationFilter'


Test Suites: 32 failed, 6 passed, 38 total
Tests:       62 failed, 138 passed, 200 total
Snapshots:   0 total
Time:        18.043 s, estimated 20 s
Ran all test suites.
```

### ❌ npm run test:integration (532ms)

**Timestamp:** 2026-02-02T11:26:19.051Z  
**Status:** FAILED

```
Command failed: npm run test:integration
npm error Missing script: "test:integration"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\henry\AppData\Local\npm-cache\_logs\2026-02-02T11_26_18_920Z-debug-0.log
npm error Missing script: "test:integration"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\henry\AppData\Local\npm-cache\_logs\2026-02-02T11_26_18_920Z-debug-0.log
```

### ✅ SPOFE Module Structure Check (immobilisation) (10ms)

**Timestamp:** 2026-02-02T11:26:19.052Z  
**Status:** SUCCESS

```
All SPOFE module structure requirements met
```


## 🔒 SPOFE COMPLIANCE

This BUILD_PROOF was generated according to SPOFE Build/Test Rules v1.1.0:

- ✅ **Executable proof** (not a diagnostic report)
- ✅ **Real-time validation** with actual command execution
- ✅ **Traceable** with commit SHA and timestamp
- ✅ **Binary status** (SUCCESS/ERROR)
- ❌ **GO PROD Ready:** NO

---

**SPOFE BUILD_PROOF v1.1.0 — Module requires fixes before production**
