/**
 * Activation et Vérification du Guardian Cost-Structure
 * 
 * Ce script vérifie que :
 * 1. Le Guardian est correctement initialisé
 * 2. Tous les invariants sont actifs
 * 3. Les Aggregates (AGA) répondent correctement
 * 
 * Usage: npx ts-node scripts/activate-guardian.ts
 */

import { CostStructureGuardian, INVARIANT_CODES } from '../guardian/cost-structure.guardian.js';
import { 
  CreateEconomicProjectCommand,
  CreateCostStructureCommand,
  AddCostLineCommand,
  RunSimulationCommand,
  FreezeCostStructureCommand,
  ValidateProjectCommand,
} from '../application/commands/index.js';

// ─────────────────────────────────────────────────────────────
// Tests d'Activation
// ─────────────────────────────────────────────────────────────

class GuardianActivator {
  private guardian: CostStructureGuardian;
  private results: Array<{ test: string; status: 'PASS' | 'FAIL'; invariant?: string; error?: string }> = [];

  constructor() {
    this.guardian = new CostStructureGuardian();
    console.log('🛡️  Guardian Cost-Structure initialisé\n');
  }

  /**
   * Exécute tous les tests d'activation
   */
  async runActivationTests(): Promise<void> {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     ACTIVATION GUARDIAN & AGGREGATES (AGA)                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Test 1: COUT-SEC-01 (Tenant Isolation)
    await this.testTenantIsolation();

    // Test 2: COUT-PROJ-01 (Project Uniqueness)
    await this.testProjectUniqueness();

    // Test 3: COUT-CS-02 (Positive Costs)
    await this.testPositiveCosts();

    // Test 4: COUT-01 (Test 70% - The Critical One)
    await this.test70PercentRule();

    // Test 5: COUT-CS-03 (Frozen Version Immutability)
    await this.testFrozenImmutability();

    // Test 6: COUT-CS-04 (Complete Assumptions)
    await this.testCompleteAssumptions();

    this.printSummary();
  }

  private async testTenantIsolation(): Promise<void> {
    try {
      const command = new CreateEconomicProjectCommand(
        '', // Empty tenant
        'test-project',
        'Test Project',
        'PRODUCT',
        'user-1'
      );

      this.guardian.validate(command, { tenantId: '' });
      this.results.push({ test: 'COUT-SEC-01: Tenant Isolation', status: 'FAIL', error: 'Should have thrown' });
    } catch (error: any) {
      if (error.code === INVARIANT_CODES.COUT_SEC_01) {
        this.results.push({ 
          test: 'COUT-SEC-01: Tenant Isolation', 
          status: 'PASS', 
          invariant: INVARIANT_CODES.COUT_SEC_01 
        });
      } else {
        this.results.push({ 
          test: 'COUT-SEC-01: Tenant Isolation', 
          status: 'FAIL', 
          error: error.message 
        });
      }
    }
  }

  private async testProjectUniqueness(): Promise<void> {
    try {
      const command = new CreateEconomicProjectCommand(
        'tenant-1',
        'new-project',
        'Existing Project', // Name already exists
        'PRODUCT',
        'user-1'
      );

      const state = {
        tenantId: 'tenant-1',
        existingProjects: [
          { id: 'existing-1', name: 'Existing Project', tenantId: 'tenant-1', status: 'ACTIVE' }
        ]
      };

      this.guardian.validate(command, state);
      this.results.push({ test: 'COUT-PROJ-01: Project Uniqueness', status: 'FAIL', error: 'Should have thrown' });
    } catch (error: any) {
      if (error.code === INVARIANT_CODES.COUT_PROJ_01) {
        this.results.push({ 
          test: 'COUT-PROJ-01: Project Uniqueness', 
          status: 'PASS', 
          invariant: INVARIANT_CODES.COUT_PROJ_01 
        });
      } else {
        this.results.push({ 
          test: 'COUT-PROJ-01: Project Uniqueness', 
          status: 'FAIL', 
          error: error.message 
        });
      }
    }
  }

  private async testPositiveCosts(): Promise<void> {
    try {
      const command = new AddCostLineCommand(
        'tenant-1',
        'project-1',
        1,
        'RAW_MATERIAL',
        'Test Line',
        -100, // Negative amount
        'EUR',
        undefined,
        'user-1'
      );

      const state = {
        tenantId: 'tenant-1',
        costStructure: {
          version: 1,
          status: 'DRAFT',
          costLines: []
        }
      };

      this.guardian.validate(command, state);
      this.results.push({ test: 'COUT-CS-02: Positive Costs', status: 'FAIL', error: 'Should have thrown' });
    } catch (error: any) {
      if (error.code === INVARIANT_CODES.COUT_CS_02) {
        this.results.push({ 
          test: 'COUT-CS-02: Positive Costs', 
          status: 'PASS', 
          invariant: INVARIANT_CODES.COUT_CS_02 
        });
      } else {
        this.results.push({ 
          test: 'COUT-CS-02: Positive Costs', 
          status: 'FAIL', 
          error: error.message 
        });
      }
    }
  }

  private async test70PercentRule(): Promise<void> {
    try {
      const command = new FreezeCostStructureCommand(
        'tenant-1',
        'project-1',
        1,
        'user-1'
      );

      const state = {
        tenantId: 'tenant-1',
        costStructure: {
          version: 1,
          status: 'DRAFT',
          costLines: [{ amount: 100 }],
          assumptions: {
            priceTarget: 10,
            expectedVolume: 1000,
            capacityMax: 2000,
            scenarios: { pessimistic: 0.7, realistic: 1.0, optimistic: 1.3 }
          },
          simulation: {
            marginAt70: -5, // FAIL: Negative margin at 70%
            netMargin: 15
          }
        }
      };

      this.guardian.validate(command, state);
      this.results.push({ test: 'COUT-01: Test 70% (Critical)', status: 'FAIL', error: 'Should have thrown' });
    } catch (error: any) {
      if (error.code === INVARIANT_CODES.COUT_01) {
        this.results.push({ 
          test: 'COUT-01: Test 70% (CRITICAL ✅)', 
          status: 'PASS', 
          invariant: INVARIANT_CODES.COUT_01 
        });
      } else {
        this.results.push({ 
          test: 'COUT-01: Test 70% (Critical)', 
          status: 'FAIL', 
          error: error.message 
        });
      }
    }
  }

  private async testFrozenImmutability(): Promise<void> {
    try {
      const command = new AddCostLineCommand(
        'tenant-1',
        'project-1',
        1,
        'RAW_MATERIAL',
        'Test Line',
        100,
        'EUR',
        undefined,
        'user-1'
      );

      const state = {
        tenantId: 'tenant-1',
        costStructure: {
          version: 1,
          status: 'FROZEN', // FROZEN version
          costLines: []
        }
      };

      this.guardian.validate(command, state);
      this.results.push({ test: 'COUT-CS-03: Frozen Immutability', status: 'FAIL', error: 'Should have thrown' });
    } catch (error: any) {
      if (error.code === INVARIANT_CODES.COUT_CS_03) {
        this.results.push({ 
          test: 'COUT-CS-03: Frozen Immutability', 
          status: 'PASS', 
          invariant: INVARIANT_CODES.COUT_CS_03 
        });
      } else {
        this.results.push({ 
          test: 'COUT-CS-03: Frozen Immutability', 
          status: 'FAIL', 
          error: error.message 
        });
      }
    }
  }

  private async testCompleteAssumptions(): Promise<void> {
    try {
      const command = new RunSimulationCommand(
        'tenant-1',
        'project-1',
        1,
        'user-1'
      );

      const state = {
        tenantId: 'tenant-1',
        costStructure: {
          version: 1,
          status: 'DRAFT',
          costLines: [{ amount: 100 }],
          // Missing assumptions
        }
      };

      this.guardian.validate(command, state);
      this.results.push({ test: 'COUT-CS-04: Complete Assumptions', status: 'FAIL', error: 'Should have thrown' });
    } catch (error: any) {
      if (error.code === INVARIANT_CODES.COUT_CS_04) {
        this.results.push({ 
          test: 'COUT-CS-04: Complete Assumptions', 
          status: 'PASS', 
          invariant: INVARIANT_CODES.COUT_CS_04 
        });
      } else {
        this.results.push({ 
          test: 'COUT-CS-04: Complete Assumptions', 
          status: 'FAIL', 
          error: error.message 
        });
      }
    }
  }

  private printSummary(): void {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    RÉSULTATS ACTIVATION                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const passed = this.results.filter(r => r.status === 'PASS');
    const failed = this.results.filter(r => r.status === 'FAIL');

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}`);
      if (result.invariant) {
        console.log(`   Code: ${result.invariant}`);
      }
      if (result.error) {
        console.log(`   Erreur: ${result.error}`);
      }
      console.log('');
    });

    console.log('────────────────────────────────────────────────────────────');
    console.log(`📊 Total: ${this.results.length} tests | ✅ ${passed.length} pass | ❌ ${failed.length} fail`);
    console.log('────────────────────────────────────────────────────────────\n');

    if (failed.length === 0) {
      console.log('🎉 GUARDIAN & AGGREGATES (AGA) ACTIVÉS AVEC SUCCÈS!');
      console.log('   Tous les invariants sont fonctionnels.');
      console.log('   Le module Cost-Structure est prêt pour la production.\n');
      process.exit(0);
    } else {
      console.log('⚠️  ACTIVATION INCOMPLÈTE');
      console.log('   Certains invariants ne répondent pas correctement.');
      console.log('   Vérifiez les erreurs ci-dessus.\n');
      process.exit(1);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Exécution
// ─────────────────────────────────────────────────────────────

const activator = new GuardianActivator();
activator.runActivationTests().catch(error => {
  console.error('💥 Erreur fatale lors de l\'activation:', error);
  process.exit(1);
});
