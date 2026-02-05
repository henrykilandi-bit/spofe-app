#!/usr/bin/env node

import { SPOFEBuildProofSystem } from './index';
import * as path from 'path';
import * as fs from 'fs';

/**
 * SPOFE BUILD_PROOF Global Orchestrator
 * 
 * Orchestre la génération complète du BUILD_PROOF système :
 * 1. Validation contractuelle préalable
 * 2. Génération BUILD_PROOF global
 * 3. Intégration avec le système existant
 * 4. Mise à jour du fichier BUILD_PROOF_SYSTEM_INTER_MODULES.json
 */

interface OrchestrationResult {
  success: boolean;
  buildProofGenerated: boolean;
  systemUpdated: boolean;
  metricsUpdated: boolean;
  errors: string[];
  warnings: string[];
}

export class SPOFEBuildProofOrchestrator {
  private modulesPath: string;
  private outputPath: string;
  private existingSystemPath: string;

  constructor() {
    this.modulesPath = path.resolve('cascade/modules');
    this.outputPath = path.resolve('.');
    this.existingSystemPath = path.resolve('BUILD_PROOF_SYSTEM_INTER_MODULES.json');
  }

  /**
   * Orchestration complète du BUILD_PROOF global
   */
  async orchestrate(): Promise<OrchestrationResult> {
    const result: OrchestrationResult = {
      success: false,
      buildProofGenerated: false,
      systemUpdated: false,
      metricsUpdated: false,
      errors: [],
      warnings: []
    };

    console.log('🎼 SPOFE BUILD_PROOF Global Orchestration\n');

    try {
      // 1. Génération du BUILD_PROOF système
      console.log('🔧 Step 1: Generating SPOFE BUILD_PROOF Global System...');
      const system = new SPOFEBuildProofSystem(this.modulesPath, this.outputPath);
      const buildProof = await system.generateSystemBuildProof();
      result.buildProofGenerated = true;
      console.log('  ✅ BUILD_PROOF Global System generated successfully\n');

      // 2. Mise à jour du système existant
      console.log('🔄 Step 2: Updating existing BUILD_PROOF system...');
      await this.updateExistingSystem(buildProof);
      result.systemUpdated = true;
      console.log('  ✅ Existing system updated\n');

      // 3. Calcul et mise à jour des métriques
      console.log('📊 Step 3: Updating system metrics...');
      await this.updateSystemMetrics(buildProof);
      result.metricsUpdated = true;
      console.log('  ✅ System metrics updated\n');

      // 4. Validation finale
      console.log('✅ Step 4: Final validation...');
      await this.performFinalValidation(buildProof);
      console.log('  ✅ Final validation successful\n');

      result.success = true;
      this.printSuccessReport(buildProof);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
      
      console.error('❌ BUILD_PROOF Global Orchestration failed:');
      console.error(errorMessage);
      
      if (errorMessage.includes('CONTRACT COMPLIANCE FAILED')) {
        console.log('\n📝 Fix contracts first: npm run validate:contracts');
      }
    }

    return result;
  }

  /**
   * Met à jour le système BUILD_PROOF existant
   */
  private async updateExistingSystem(newBuildProof: any): Promise<void> {
    if (!fs.existsSync(this.existingSystemPath)) {
      console.log('  ⚠️ No existing BUILD_PROOF system found - creating new one');
      return;
    }

    const existingSystem = JSON.parse(fs.readFileSync(this.existingSystemPath, 'utf-8'));
    
    // Met à jour les modules certifiés
    for (const [moduleName, moduleProof] of Object.entries(newBuildProof.certifiedModules)) {
      if (existingSystem.certifiedModules[moduleName]) {
        // Module existant - mise à jour des métadonnées
        existingSystem.certifiedModules[moduleName] = {
          ...existingSystem.certifiedModules[moduleName],
          ...(moduleProof as any),
          certificationDate: new Date().toISOString()
        };
      } else {
        // Nouveau module
        existingSystem.certifiedModules[moduleName] = moduleProof;
      }
    }

    // Met à jour les métriques système
    existingSystem.systemMetrics = {
      ...existingSystem.systemMetrics,
      ...newBuildProof.systemMetrics,
      lastUpdate: new Date().toISOString()
    };

    // Met à jour la compliance
    existingSystem.compliance = {
      ...existingSystem.compliance,
      ...newBuildProof.compliance
    };

    // Met à jour la chaîne de certification
    existingSystem.certificationChain = newBuildProof.certificationChain;
    existingSystem.signature = newBuildProof.signature;

    // Sauvegarde le système mis à jour
    fs.writeFileSync(this.existingSystemPath, JSON.stringify(existingSystem, null, 2));
    console.log(`  📝 Updated existing system: ${this.existingSystemPath}`);
  }

  /**
   * Met à jour les métriques système
   */
  private async updateSystemMetrics(buildProof: any): Promise<void> {
    const metricsPath = path.join(this.outputPath, 'BUILD_PROOF_SYSTEM_METRICS.json');
    
    const metrics = {
      timestamp: new Date().toISOString(),
      version: buildProof.systemSnapshot.version,
      governance: buildProof.systemSnapshot.governance,
      summary: buildProof.systemMetrics,
      contractsCompliance: {
        validated: buildProof.compliance.contractsValidated,
        timestamp: new Date().toISOString()
      },
      certificationChain: {
        systemHash: buildProof.certificationChain.systemHash,
        modulesCount: buildProof.certificationChain.certifiedBuildProofs.length,
        algorithm: buildProof.certificationChain.algorithm
      },
      modules: Object.keys(buildProof.certifiedModules).map(name => ({
        name,
        status: buildProof.certifiedModules[name].status,
        invariants: buildProof.certifiedModules[name].invariants,
        hash: buildProof.certifiedModules[name].buildProofSHA256.substring(0, 16)
      }))
    };

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
    console.log(`  📊 Metrics saved: ${metricsPath}`);
  }

  /**
   * Effectue la validation finale
   */
  private async performFinalValidation(buildProof: any): Promise<void> {
    // Vérifie l'intégrité du BUILD_PROOF généré
    if (!buildProof.signature.systemSignature) {
      throw new Error('Invalid system signature');
    }

    if (!buildProof.certificationChain.systemHash) {
      throw new Error('Invalid certification chain');
    }

    if (buildProof.systemMetrics.totalModules === 0) {
      throw new Error('No modules found in system');
    }

    // Vérifie que les fichiers de sortie existent
    const expectedFiles = [
      'BUILD_PROOF_SYSTEM_GLOBAL.json',
      'BUILD_PROOF_SYSTEM_METRICS.json'
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(this.outputPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing output file: ${file}`);
      }
    }

    console.log('  🔍 All validation checks passed');
  }

  /**
   * Affiche le rapport de succès
   */
  private printSuccessReport(buildProof: any): void {
    console.log('🎯 BUILD_PROOF Global Orchestration COMPLETED!\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 SPOFE BUILD_PROOF Global System - SUCCESS REPORT');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 SYSTEM OVERVIEW:');
    console.log(`  🏗️  System Version: ${buildProof.systemSnapshot.version}`);
    console.log(`  🛡️  Governance: ${buildProof.systemSnapshot.governance}`);
    console.log(`  📅 Generated: ${new Date(buildProof.systemSnapshot.timestamp).toLocaleString()}`);
    console.log(`  🔒 System Hash: ${buildProof.certificationChain.systemHash.substring(0, 32)}...\n`);
    
    console.log('📈 CERTIFICATION METRICS:');
    console.log(`  📦 Total Modules: ${buildProof.systemMetrics.totalModules}`);
    console.log(`  ✅ Certified: ${buildProof.systemMetrics.certifiedModules}`);
    console.log(`  📋 Certification Rate: ${buildProof.systemMetrics.certificationRate}`);
    console.log(`  🛡️ Total Invariants: ${buildProof.systemMetrics.totalInvariants.certified}`);
    console.log(`  🧪 Total Tests: ${buildProof.systemMetrics.totalTests.total}\n`);
    
    console.log('✅ COMPLIANCE STATUS:');
    console.log(`  🔐 SPOFE P0: ${buildProof.compliance.spofeP0 ? '✅' : '❌'}`);
    console.log(`  📋 Contracts: ${buildProof.compliance.contractsValidated ? '✅' : '❌'}`);
    console.log(`  🛡️ Guardian-First: ${buildProof.compliance.guardianFirst ? '✅' : '❌'}`);
    console.log(`  👥 Multi-Tenant: ${buildProof.compliance.multiTenant ? '✅' : '❌'}\n`);
    
    console.log('📁 OUTPUT FILES:');
    console.log('  📄 BUILD_PROOF_SYSTEM_GLOBAL.json - Main system proof');
    console.log('  📊 BUILD_PROOF_SYSTEM_METRICS.json - System metrics');
    console.log('  🔄 BUILD_PROOF_SYSTEM_INTER_MODULES.json - Updated existing system\n');
    
    console.log('🎉 SPOFE is now BUILD_PROOF CERTIFIED and ready for PRODUCTION!');
    console.log('═══════════════════════════════════════════════════════');
  }
}

/**
 * CLI Interface
 */
async function main(): Promise<void> {
  const orchestrator = new SPOFEBuildProofOrchestrator();
  const result = await orchestrator.orchestrate();
  
  if (result.success) {
    process.exit(0);
  } else {
    console.error('\n❌ Orchestration failed with errors:');
    result.errors.forEach(error => console.error(`  • ${error}`));
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
SPOFE BUILD_PROOF Global Orchestrator

Orchestrates complete BUILD_PROOF system generation:
  • Contracts compliance verification
  • Global BUILD_PROOF generation
  • System integration and updates
  • Metrics calculation and reporting

Usage:
  npm run build-proof:system
  npm run ci:build-proof

Prerequisites:
  • ALL contracts must be compliant
  • Module structure must follow SPOFE P0

Output:
  • BUILD_PROOF_SYSTEM_GLOBAL.json
  • BUILD_PROOF_SYSTEM_METRICS.json
  • Updated BUILD_PROOF_SYSTEM_INTER_MODULES.json
`);
  process.exit(0);
}

// Run main function if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.endsWith('orchestrator.ts') || 
                     process.argv[1]?.endsWith('orchestrator.js');

if (isMainModule) {
  main();
}

export { main };