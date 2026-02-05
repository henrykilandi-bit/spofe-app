#!/usr/bin/env node

import { parseDependencies } from './dependencies.parser';
import { validateDependencies, formatValidationErrors } from './dependencies.rules';
import { buildDependencyGraph, topologicalSort } from './dependencies.graph';
import * as path from 'path';

/**
 * SPOFE Dependencies Compliance Checker
 * 
 * Vérifie automatiquement que tous les fichiers DEPENDENCIES.md
 * respectent les contraintes architecturales SPOFE.
 * 
 * Usage: npm run validate:dependencies
 */

function main(): void {
  console.log('🔍 SPOFE Dependencies Compliance Check\n');
  
  try {
    const modulesPath = path.resolve('cascade/modules');
    console.log(`Scanning modules in: ${modulesPath}`);
    
    // Parse dependencies
    const dependencies = parseDependencies(modulesPath);
    console.log(`ℹ️ Found ${dependencies.length} modules with dependency contracts`);
    
    // Validate compliance
    const errors = validateDependencies(dependencies);
    
    // Generate report
    const report = formatValidationErrors(errors);
    console.log('\n=== COMPLIANCE REPORT ===');
    console.log(report);
    
    if (errors.length === 0) {
      // Show deployment order
      const graph = buildDependencyGraph(dependencies);
      const deployOrder = topologicalSort(graph);
      
      console.log('\n=== SUGGESTED DEPLOYMENT ORDER ===');
      deployOrder.forEach((module, index) => {
        console.log(`${index + 1}. ${module}`);
      });
      
      console.log('\n✅ All SPOFE inter-module dependencies are compliant');
      console.log('\n🚀 Ready for BUILD_PROOF certification');
      
      process.exit(0);
    } else {
      console.log('\n❌ SPOFE compliance violations detected');
      console.log('\n⚠️  Fix these violations before proceeding to BUILD_PROOF');
      console.log('\n🚫 GO PROD REFUSED - Dependencies not compliant');
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during dependencies check:');
    console.error(error instanceof Error ? error.message : error);
    console.log('\n🚫 Cannot proceed to BUILD_PROOF - Fix dependency structure');
    
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
SPOFE Dependencies Compliance Checker

Usage:
  npm run validate:dependencies
  npm run test:dependencies

What it checks:
  • All modules have DEPENDENCIES.md contracts
  • No circular dependencies
  • Symmetric dependency declarations
  • Read-only constraints respected
  • Only existing modules referenced

Environment:
  Scans: cascade/modules/*/contract/DEPENDENCIES.md

Output:
  Exit 0: Compliant (ready for BUILD_PROOF)
  Exit 1: Violations detected (fix required)
`);
  process.exit(0);
}

// Run main function
main();

export { parseDependencies, validateDependencies, formatValidationErrors };