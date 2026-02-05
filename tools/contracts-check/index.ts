#!/usr/bin/env node

import { parseDependencies } from '../dependencies-check/dependencies.parser';
import { validateDependencies, formatValidationErrors } from '../dependencies-check/dependencies.rules';
import { validateScope, formatScopeErrors } from './scope.check';
import { validateGuardian, formatGuardianErrors, generateInvariantsReport } from './guardian.check';
import * as path from 'path';

/**
 * SPOFE Contracts Compliance Checker
 * 
 * Vérifie automatiquement TOUTE la liasse contractuelle SPOFE :
 * - DEPENDENCIES.md : Flux inter-modules
 * - SCOPE.md : Frontières fonctionnelles  
 * - GUARDIAN.md : Constitution métier (invariants)
 * 
 * Usage: npm run validate:contracts
 */

interface ContractsReport {
  dependencies: {
    errors: ReturnType<typeof validateDependencies>;
    compliant: boolean;
  };
  scope: {
    errors: ReturnType<typeof validateScope>;
    compliant: boolean;
  };
  guardian: {
    errors: ReturnType<typeof validateGuardian>;
    compliant: boolean;
  };
  overall: {
    compliant: boolean;
    totalViolations: number;
  };
}

function main(): void {
  console.log('🔐 SPOFE Contracts Compliance Check\n');
  
  try {
    const modulesPath = path.resolve('cascade/modules');
    console.log(`Scanning contracts in: ${modulesPath}\n`);
    
    const report: ContractsReport = {
      dependencies: { errors: [], compliant: true },
      scope: { errors: [], compliant: true },
      guardian: { errors: [], compliant: true },
      overall: { compliant: true, totalViolations: 0 }
    };
    
    // 1. Vérification DEPENDENCIES.md
    console.log('🔗 Validating DEPENDENCIES.md contracts...');
    try {
      const dependencies = parseDependencies(modulesPath);
      report.dependencies.errors = validateDependencies(dependencies);
      report.dependencies.compliant = report.dependencies.errors.length === 0;
      
      if (report.dependencies.compliant) {
        console.log('✅ Dependencies contracts: COMPLIANT');
      } else {
        console.log(`❌ Dependencies contracts: ${report.dependencies.errors.length} violations`);
      }
    } catch (error) {
      console.error(`❌ Dependencies check failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
    
    // 2. Vérification SCOPE.md
    console.log('🎯 Validating SCOPE.md contracts...');
    try {
      report.scope.errors = validateScope(modulesPath);
      report.scope.compliant = report.scope.errors.length === 0;
      
      if (report.scope.compliant) {
        console.log('✅ Scope contracts: COMPLIANT');
      } else {
        console.log(`❌ Scope contracts: ${report.scope.errors.length} violations`);
      }
    } catch (error) {
      console.error(`❌ Scope check failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
    
    // 3. Vérification GUARDIAN.md
    console.log('🛡️  Validating GUARDIAN.md contracts...');
    try {
      report.guardian.errors = validateGuardian(modulesPath);
      report.guardian.compliant = report.guardian.errors.length === 0;
      
      if (report.guardian.compliant) {
        console.log('✅ Guardian contracts: COMPLIANT');
      } else {
        console.log(`❌ Guardian contracts: ${report.guardian.errors.length} violations`);
      }
    } catch (error) {
      console.error(`❌ Guardian check failed: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
    
    // 4. Rapport global
    report.overall.totalViolations = 
      report.dependencies.errors.length + 
      report.scope.errors.length + 
      report.guardian.errors.length;
    
    report.overall.compliant = 
      report.dependencies.compliant && 
      report.scope.compliant && 
      report.guardian.compliant;
    
    console.log('\n=== GLOBAL CONTRACTS COMPLIANCE REPORT ===');
    
    if (report.overall.compliant) {
      console.log('✅ ALL SPOFE CONTRACTS ARE COMPLIANT\n');
      
      // Génère un rapport des invariants
      console.log('=== INVARIANTS SUMMARY ===');
      const invariantsReport = generateInvariantsReport(modulesPath);
      const lines = invariantsReport.split('\n');
      console.log(lines[2]); // Total invariants
      console.log(lines[3]); // Modules with invariants
      
      console.log('\n🚀 SPOFE is CONTRACT-VERIFIED and ready for BUILD_PROOF');
      process.exit(0);
      
    } else {
      console.log(`❌ FOUND ${report.overall.totalViolations} CONTRACT VIOLATION(S)\n`);
      
      // Détail des violations par type de contrat
      if (!report.dependencies.compliant) {
        console.log('=== DEPENDENCIES VIOLATIONS ===');
        console.log(formatValidationErrors(report.dependencies.errors));
        console.log('');
      }
      
      if (!report.scope.compliant) {
        console.log('=== SCOPE VIOLATIONS ===');
        console.log(formatScopeErrors(report.scope.errors));
        console.log('');
      }
      
      if (!report.guardian.compliant) {
        console.log('=== GUARDIAN VIOLATIONS ===');
        console.log(formatGuardianErrors(report.guardian.errors));
        console.log('');
      }
      
      console.log('🚫 GO PROD REFUSED - Fix contract violations before proceeding');
      console.log('📝 SPOFE requires ALL contracts to be compliant for certification');
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during contracts check:');
    console.error(error instanceof Error ? error.message : error);
    console.log('\n🚫 Cannot proceed to BUILD_PROOF - Fix contract structure');
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`\nSPOFE Contracts Compliance Checker\n\nChecks ALL contractual documents:\n  • DEPENDENCIES.md - Inter-module flows\n  • SCOPE.md - Functional boundaries\n  • GUARDIAN.md - Business invariants\n\nUsage:\n  npm run validate:contracts\n  npm run test:contracts\n\nOutput:\n  Exit 0: All contracts compliant\n  Exit 1: Violations detected\n`);
  process.exit(0);
}

// Generate invariants report if requested
if (process.argv.includes('--report')) {
  const modulesPath = path.resolve('cascade/modules');
  const report = generateInvariantsReport(modulesPath);
  console.log(report);
  process.exit(0);
}

// Run main function
main();

export { main };