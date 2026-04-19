#!/usr/bin/env tsx
/**
 * Build Proof Generator - Module Budgeting
 * SPOFE v2.1.0 P0 Governance
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

interface BuildProofResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  details?: string;
}

interface BuildProofReport {
  timestamp: string;
  module: string;
  version: string;
  overall: 'success' | 'error' | 'warning';
  results: BuildProofResult[];
  summary: {
    totalSteps: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
  };
  signature?: string;
}

class BudgetingBuildProof {
  private results: BuildProofResult[] = [];
  private moduleRoot = process.cwd();

  async generateProof(): Promise<void> {
    console.log('🎯 BUILD PROOF VALIDATOR - Module Budgeting');
    console.log('==================================================\n');

    // Step 1: Critical Files Check
    await this.checkCriticalFiles();
    
    // Step 2: TypeScript Compilation
    await this.checkTypeScriptCompilation();
    
    // Step 3: Jest Configuration
    await this.checkJestConfiguration();
    
    // Step 4: Guardian Tests
    await this.runGuardianTests();
    
    // Step 5: Module Structure
    await this.checkModuleStructure();
    
    // Step 6: Generate Report
    await this.generateReport();
  }

  private async checkCriticalFiles(): Promise<void> {
    console.log('🔍 Vérification des fichiers critiques...');
    
    const criticalFiles = [
      'package.json',
      'tsconfig.json', 
      'jest.config.guardian-only.cjs',
      'index.ts',
      'domain/index.ts',
      'guardian/index.ts'
    ];

    let missingFiles: string[] = [];
    
    for (const file of criticalFiles) {
      const filePath = join(this.moduleRoot, file);
      if (existsSync(filePath)) {
        this.addResult('File Check', 'success', `${file} exists`);
        console.log(`✅ File Check: ${file} exists`);
      } else {
        missingFiles.push(file);
        this.addResult('File Check', 'error', `${file} missing`);
        console.log(`❌ File Check: ${file} missing`);
      }
    }

    if (missingFiles.length === 0) {
      this.addResult('Critical Files', 'success', 'All critical files present');
    } else {
      this.addResult('Critical Files', 'error', `${missingFiles.length} critical files missing`);
    }
  }

  private async checkTypeScriptCompilation(): Promise<void> {
    console.log('🔨 Vérification de la compilation TypeScript...');
    
    try {
      execSync('npx tsc --noEmit', { 
        stdio: 'pipe',
        cwd: this.moduleRoot 
      });
      this.addResult('TypeScript Compilation', 'success', 'No TypeScript errors found');
      console.log('✅ TypeScript Compilation: No TypeScript errors found');
    } catch (error: any) {
      this.addResult('TypeScript Compilation', 'error', 'TypeScript compilation failed', error.toString());
      console.log('❌ TypeScript Compilation: Failed');
    }
  }

  private async checkJestConfiguration(): Promise<void> {
    console.log('⚗️ Vérification de la configuration Jest...');
    
    const jestConfig = join(this.moduleRoot, 'jest.config.guardian-only.cjs');
    if (existsSync(jestConfig)) {
      this.addResult('Jest Configuration', 'success', 'Jest config found');
      console.log('✅ Jest Configuration: jest.config.guardian-only.cjs found');
    } else {
      this.addResult('Jest Configuration', 'error', 'Jest config missing');
      console.log('❌ Jest Configuration: jest.config.guardian-only.cjs missing');
    }
  }

  private async runGuardianTests(): Promise<void> {
    console.log('🧪 Exécution des tests Guardian...');
    
    try {
      execSync('npm run test:module', { 
        stdio: 'pipe',
        cwd: this.moduleRoot 
      });
      this.addResult('Guardian Tests', 'success', 'All Guardian tests passed');
      console.log('✅ Guardian Tests: All tests passed');
    } catch (error: any) {
      this.addResult('Guardian Tests', 'error', 'Guardian tests failed', error.toString());
      console.log('❌ Guardian Tests: Tests failed');
    }
  }

  private async checkModuleStructure(): Promise<void> {
    console.log('🏗️ Vérification de l\'architecture SPOFE...');
    
    const requiredStructure = [
      { path: 'domain', name: 'Domain Layer (Aggregates + Value Objects)' },
      { path: 'guardian', name: 'Guardian Layer (Invariants)' },
      { path: 'tests/guardian', name: 'Guardian Tests' }
    ];

    let validLayers = 0;
    
    for (const layer of requiredStructure) {
      const layerPath = join(this.moduleRoot, layer.path);
      if (existsSync(layerPath)) {
        this.addResult('SPOFE Architecture', 'success', `${layer.name} found`);
        console.log(`✅ SPOFE Architecture: ${layer.name}`);
        validLayers++;
      } else {
        this.addResult('SPOFE Architecture', 'error', `Missing ${layer.name}`);
        console.log(`❌ SPOFE Architecture: Missing ${layer.name}`);
      }
    }

    this.addResult('SPOFE Compliance', validLayers === requiredStructure.length ? 'success' : 'warning', 
      `${validLayers}/${requiredStructure.length} SPOFE layers valid`);
    console.log(`⚖️ SPOFE Compliance: ${validLayers}/${requiredStructure.length} SPOFE layers valid`);
  }

  private async generateReport(): Promise<void> {
    console.log('\n==================================================');
    console.log('📋 RAPPORT FINAL');
    console.log('==================================================');

    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length; 
    const errorCount = this.results.filter(r => r.status === 'error').length;

    let overall: 'success' | 'error' | 'warning' = 'success';
    if (errorCount > 0) overall = 'error';
    else if (warningCount > 0) overall = 'warning';

    const packageJson = JSON.parse(readFileSync(join(this.moduleRoot, 'package.json'), 'utf-8'));

    const report: BuildProofReport = {
      timestamp: new Date().toISOString(),
      module: 'budgeting',
      version: packageJson.version || '1.0.0',
      overall,
      results: this.results,
      summary: {
        totalSteps: this.results.length,
        successCount,
        warningCount,
        errorCount
      }
    };

    // Generate cryptographic signature
    const reportJson = JSON.stringify(report, null, 2);
    const signature = crypto.createHash('sha256').update(reportJson).digest('hex');
    report.signature = signature;

    // Save report
    const reportPath = join(this.moduleRoot, 'build-proof-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Save signature file
    const signaturePath = join(this.moduleRoot, 'BUILD_PROOF.sig');
    writeFileSync(signaturePath, signature);

    // Display final status
    const statusIcon = overall === 'success' ? '🟢' : overall === 'warning' ? '🟡' : '🔴';
    console.log(`${statusIcon} Statut global: ${overall.toUpperCase()}`);
    console.log(`📊 Résumé: ${successCount} succès, ${warningCount} avertissements, ${errorCount} erreurs`);
    console.log(`🔐 Signature: ${signature.substring(0, 16)}...`);
    console.log(`📄 Rapport complet sauvegardé: ${reportPath}`);

    if (overall === 'success') {
      console.log('\n🎉 BUILD PROOF GÉNÉRÉ AVEC SUCCÈS !');
      console.log('✅ Module budgeting validé et prêt pour figement');
    } else if (errorCount > 0) {
      console.log('\n💡 Recommendations:');
      console.log('   🔴 Address critical errors before proceeding to production');
      process.exit(1);
    }
  }

  private addResult(step: string, status: 'success' | 'error' | 'warning', message: string, details?: string): void {
    this.results.push({
      step,
      status, 
      message,
      details
    });
  }
}

// Execute if run directly
if (require.main === module) {
  const buildProof = new BudgetingBuildProof();
  buildProof.generateProof().catch(console.error);
}